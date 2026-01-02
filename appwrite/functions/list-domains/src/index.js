const { Client, Databases, Query } = require('node-appwrite');

/**
 * Gets Appwrite client configured with environment variables.
 * @param {object} req The request object containing environment variables.
 * @returns {object} Configured Appwrite client and databases instance.
 */
function getAppwriteClient(req) {
    // In Appwrite Functions, environment variables are accessed via process.env
    // req.env might not be available, so we use process.env with fallback
    const endpoint = process.env.APPWRITE_ENDPOINT || (req && req.env && req.env.APPWRITE_ENDPOINT) || 'https://appwrite.infra.m-milu.com/v1';
    const projectId = process.env.APPWRITE_PROJECT_ID || (req && req.env && req.env.APPWRITE_PROJECT_ID) || '68b16e260029530463c0';
    const apiKey = process.env.APPWRITE_API_KEY || (req && req.env && req.env.APPWRITE_API_KEY);

    if (!apiKey) {
        throw new Error('APPWRITE_API_KEY is not set. Cannot query database.');
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);

    const databases = new Databases(client);

    return { client, databases };
}

/**
 * Lists all domains from Appwrite database.
 * @param {object} req The request object containing environment variables.
 * @param {object} options Query options (limit, offset, orderBy, etc.)
 * @returns {Promise<object>} List of domain documents.
 */
async function listDomainsFromDatabase(req, options = {}) {
    try {
        const { databases } = getAppwriteClient(req);

        const dbId = process.env.APPWRITE_DB_ID || (req && req.env && req.env.APPWRITE_DB_ID) || 'expiration_check_db';
        const collectionId = process.env.APPWRITE_DOMAINS_COLLECTION_ID || (req && req.env && req.env.APPWRITE_DOMAINS_COLLECTION_ID) || 'domains';

        // Build query options
        const queries = [];

        // Limit (default: 100, max: 100)
        const limit = Math.min(options.limit || 100, 100);
        queries.push(Query.limit(limit));

        // Offset for pagination
        if (options.offset) {
            queries.push(Query.offset(options.offset));
        }

        // Order by (default: $createdAt desc)
        if (options.orderBy) {
            const orderType = options.orderType || 'DESC';
            if (orderType === 'ASC') {
                queries.push(Query.orderAsc(options.orderBy));
            } else {
                queries.push(Query.orderDesc(options.orderBy));
            }
        } else {
            queries.push(Query.orderDesc('$createdAt'));
        }

        // Search filter (optional)
        if (options.search) {
            queries.push(Query.search('domain', options.search));
        }

        const response = await databases.listDocuments(
            dbId,
            collectionId,
            queries
        );

        return {
            documents: response.documents || [],
            total: response.total || 0
        };
    } catch (err) {
        console.error(`Error listing domains from database: ${err.message}`);
        throw err;
    }
}

/**
 * Appwrite Function entry point.
 * @param {*} req The request object.
 * @param {*} res The response object.
 */
module.exports = async ({ req, res, log, error }) => {
    try {
        // Parse request body for query options
        let queryOptions = {};

        try {
            let payload = JSON.parse(req.bodyRaw || '{}');

            // If the payload has a 'body' property (typical from SDK calls),
            // it means our actual data is nested inside. We need to parse it again.
            if (payload.body && typeof payload.body === 'string') {
                payload = JSON.parse(payload.body);
            }

            // Extract query options
            queryOptions = {
                limit: payload.limit || 100,
                offset: payload.offset || 0,
                orderBy: payload.orderBy || '$createdAt',
                orderType: payload.orderType || 'DESC',
                search: payload.search || null
            };

        } catch (e) {
            log(`Failed to parse request body, using defaults. Error: ${e.message}`);
            // Use default options if parsing fails
        }

        log(`📋 Fetching domains list with options: ${JSON.stringify(queryOptions)}`);

        const result = await listDomainsFromDatabase(req, queryOptions);

        log(`✅ Successfully fetched ${result.documents.length} domains (total: ${result.total})`);

        return res.json({
            success: true,
            data: result.documents,
            total: result.total,
            limit: queryOptions.limit,
            offset: queryOptions.offset || 0
        });

    } catch (e) {
        error(`❌ Failed to list domains: ${e.message}`);
        return res.json({
            success: false,
            error: e.message,
            data: [],
            total: 0
        }, 500);
    }
};
