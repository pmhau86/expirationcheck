/**
 * Test script for Appwrite Edge Function - check-ssl
 * 
 * Usage:
 *   npm run test:function                    # Test with default domain (kjclub.com)
 *   npm run test:function google.com         # Test with custom domain
 *   node test_edge_function.js example.com  # Direct execution
 * 
 * Requirements:
 *   - Add APPWRITE_API_KEY to your .env file
 *   - Make sure you have node-appwrite installed (npm install)
 */

import { Client, Functions } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Cấu hình Appwrite
const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://appwrite.infra.m-milu.com/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '68b16e260029530463c0')
    .setKey(process.env.APPWRITE_API_KEY || ''); // Cần set API key trong .env

const functions = new Functions(client);

// Function ID
const FUNCTION_ID = '68e781b0000efd509766';

// Domain để test
const TEST_DOMAIN = process.argv[2] || 'kjclub.com';

// Kiểm tra API key
if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY is not set!');
    console.log('💡 Please add APPWRITE_API_KEY to your .env file');
    console.log('   Example: APPWRITE_API_KEY=your_api_key_here');
    process.exit(1);
}

async function testEdgeFunction() {
    try {
        console.log(`🔍 Testing SSL check function for domain: ${TEST_DOMAIN}`);
        console.log('─'.repeat(60));

        // Gọi function
        const execution = await functions.createExecution(
            FUNCTION_ID,
            JSON.stringify({ domain: TEST_DOMAIN }),
            false // Synchronous
        );

        console.log('\n📊 Execution Result:');
        console.log('─'.repeat(60));
        console.log(`Status: ${execution.status}`);
        console.log(`Response Status Code: ${execution.responseStatusCode}`);
        console.log(`Duration: ${execution.duration}s`);

        if (execution.status === 'completed') {
            // Parse response
            const response = JSON.parse(execution.responseBody);

            console.log('\n✅ Response Body:');
            console.log(JSON.stringify(response, null, 2));

            if (response.success) {
                console.log('\n📋 SSL Certificate Info:');
                console.log(`  Domain: ${response.domain}`);
                console.log(`  Subject: ${response.subject}`);
                console.log(`  Issuer: ${response.issuer}`);
                console.log(`  Valid From: ${response.valid_from}`);
                console.log(`  Valid To: ${response.valid_to}`);
                console.log(`  Days Until Expiry: ${response.daysUntilExpiry}`);
                console.log(`  Is Expired: ${response.isExpired}`);

                if (response.domain_info) {
                    console.log('\n📦 Domain Info from Database:');
                    console.log(JSON.stringify(response.domain_info, null, 2));
                } else {
                    console.log('\n⚠️  No domain info found in database (domain not in DB)');
                }
            } else {
                console.log('\n❌ Function returned error:');
                console.log(`  Error: ${response.error}`);
            }
        } else {
            console.log('\n❌ Execution failed');
            if (execution.stderr) {
                console.log('Error logs:', execution.stderr);
            }
        }

        // Logs
        if (execution.logs && execution.logs.length > 0) {
            console.log('\n📝 Function Logs:');
            console.log(execution.logs);
        }

        // Errors
        if (execution.errors && execution.errors.length > 0) {
            console.log('\n⚠️  Function Errors:');
            console.log(execution.errors);
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Chạy test
testEdgeFunction()
    .then(() => {
        console.log('\n✅ Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
