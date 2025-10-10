const tls = require('tls');

/**
 * Checks the SSL certificate of a domain.
 * @param {string} domain The domain to check.
 * @returns {Promise<object>} A promise that resolves with the SSL certificate information.
 */
function checkSSLExpire(domain) {
    return new Promise((resolve, reject) => {
        try {
            const options = {
                host: domain,
                port: 443,
                servername: domain,
                rejectUnauthorized: false // Necessary to get cert details even if it's invalid/expired
            };

            const socket = tls.connect(options, () => {
                if (socket.authorized) {
                    console.log(`Connection authorized by a Certificate Authority for ${domain}.`);
                } else {
                    console.log(`Connection not authorized for ${domain}: ${socket.authorizationError}`);
                }

                const cert = socket.getPeerCertificate();
                if (Object.keys(cert).length === 0) {
                    socket.end();
                    return reject(new Error(`No certificate found for ${domain}. The domain might not be serving a certificate on port 443 or is unreachable.`));
                }

                const valid_from = new Date(cert.valid_from);
                const valid_to = new Date(cert.valid_to);
                const now = new Date();
                const daysUntilExpiry = Math.floor((valid_to - now) / (1000 * 60 * 60 * 24));
                const isExpired = now > valid_to;

                socket.end();

                resolve({
                    domain: domain,
                    subject: cert.subject ? cert.subject.CN : domain,
                    issuer: cert.issuer ? cert.issuer.O : 'N/A',
                    valid_from: valid_from.toISOString(),
                    valid_to: valid_to.toISOString(),
                    daysUntilExpiry: daysUntilExpiry,
                    isExpired: isExpired,
                });
            });

            socket.on('error', (err) => {
                reject(new Error(`TLS connection error for ${domain}: ${err.message}`));
            });

            socket.setTimeout(5000, () => { // 5-second timeout
                socket.destroy(new Error(`Timeout trying to connect to ${domain}`));
            });

        } catch (error) {
            reject(new Error(`Failed to check SSL for ${domain}: ${error.message}`));
        }
    });
}

/**
 * Appwrite Function entry point.
 * @param {*} req The request object.
 * @param {*} res The response object.
 */
module.exports = async ({ req, res, log, error }) => {
    // This function is designed to be robust and handle different payload structures
    // that Appwrite might send depending on the trigger (SDK vs. Console Execute).
    let domain = null;
    try {
        let payload = JSON.parse(req.bodyRaw || '{}');

        // If the payload has a 'body' property (typical from SDK calls),
        // it means our actual data is nested inside. We need to parse it again.
        if (payload.body && typeof payload.body === 'string') {
            payload = JSON.parse(payload.body);
        }

        domain = payload.domain;

    } catch (e) {
        error(`Failed to parse request body: ${req.bodyRaw}. Error: ${e.message}`);
        return res.json({
            success: false,
            error: 'Invalid request payload. Could not extract domain.',
        }, 400);
    }

    if (!domain) {
        // Log the raw received payload for easier debugging in the future.
        error(`Domain is missing from payload. Received raw body: ${req.bodyRaw}`);
        return res.json({
            success: false,
            error: 'Domain is required. Please provide a domain in the payload.',
        }, 400);
    }

    try {
        log(`🔍 Checking SSL certificate for: ${domain}`);
        const sslInfo = await checkSSLExpire(domain);
        log(`✅ SSL certificate found for ${domain}`);

        return res.json({
            ...sslInfo,
            success: true,
        });
    } catch (e) {
        error(`❌ SSL check failed for ${domain}:`, e.message);
        return res.json({
            domain: domain,
            error: e.message,
            success: false,
        }, 500);
    }
};
