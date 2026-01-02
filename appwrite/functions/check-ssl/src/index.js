const tls = require('tls');
const { Client, Databases, Query } = require('node-appwrite');

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
 * Fetches domain information from Appwrite database.
 * @param {string} domainName The domain name to search for.
 * @param {object} req The request object containing environment variables.
 * @returns {Promise<object|null>} The domain document or null if not found.
 */
async function getDomainFromDatabase(domainName, req) {
    try {
        const client = new Client()
            .setEndpoint(req.env.APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://appwrite.infra.m-milu.com/v1')
            .setProject(req.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || '68b16e260029530463c0')
            .setKey(req.env.APPWRITE_API_KEY || process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);

        const dbId = req.env.APPWRITE_DB_ID || process.env.APPWRITE_DB_ID || 'expiration_check_db';
        const collectionId = req.env.APPWRITE_DOMAINS_COLLECTION_ID || process.env.APPWRITE_DOMAINS_COLLECTION_ID || 'domains';

        const response = await databases.listDocuments(
            dbId,
            collectionId,
            [Query.equal('domain', domainName)]
        );

        if (response.documents && response.documents.length > 0) {
            return response.documents[0];
        }

        return null;
    } catch (err) {
        console.error(`Error fetching domain from database: ${err.message}`);
        return null;
    }
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
        // error(`Domain is missing from payload. Received raw body: ${req.bodyRaw}`);
        // return res.json({
        //     success: false,
        //     error: 'Domain is required. Please provide a domain in the payload.',
        // }, 400);
        domain = 'example.com';
    }

    try {
        log(`🔍 Checking SSL certificate for: ${domain}`);

        // Fetch domain info from database
        log(`📋 Fetching domain info from database for: ${domain}`);
        const domainInfo = await getDomainFromDatabase(domain, req);

        if (domainInfo) {
            log(`✅ Domain info found in database for ${domain}`);
        } else {
            log(`⚠️ Domain not found in database for ${domain}`);
        }

        const sslInfo = await checkSSLExpire(domain);
        log(`✅ SSL certificate found for ${domain}`);

        return res.json({
            ...sslInfo,
            domain_info: domainInfo,
            success: true,
        });
    } catch (e) {
        error(`❌ SSL check failed for ${domain}:`, e.message);

        // Try to get domain info even if SSL check failed
        let domainInfo = null;
        try {
            domainInfo = await getDomainFromDatabase(domain, req);
        } catch (dbErr) {
            log(`⚠️ Could not fetch domain info from database: ${dbErr.message}`);
        }

        return res.json({
            domain: domain,
            domain_info: domainInfo,
            error: e.message,
            success: false,
        }, 500);
    }
};
