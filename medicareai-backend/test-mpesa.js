import axios from 'axios';
import 'dotenv/config';

const testMpesaConnection = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    console.log("--- M-Pesa Credential Debugger ---");
    console.log(`Key Found: ${consumerKey ? '✅ Yes' : '❌ No'}`);
    console.log(`Secret Found: ${consumerSecret ? '✅ Yes' : '❌ No'}`);

    if (!consumerKey || !consumerSecret) {
        console.error("Error: Missing credentials in .env file!");
        return;
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        console.log("Attempting to fetch Access Token from Safaricom...");
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: { Authorization: `Basic ${auth}` }
            }
        );

        if (response.data.access_token) {
            console.log("--- SUCCESS! ---");
            console.log("✅ Token received successfully.");
            console.log("Your M-Pesa Consumer Key and Secret are CORRECT.");
        }
    } catch (error) {
        console.log("--- AUTHENTICATION FAILED ---");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Message: ${error.response.data.errorMessage || "Unauthorized"}`);
            console.log("\nPossible Fixes:");
            console.log("1. Check for extra spaces in your .env file.");
            console.log("2. Ensure your Daraja App status is 'Approved'.");
            console.log("3. Verify you are using 'Sandbox' keys, not 'Production'.");
        } else {
            console.error(`Network Error: ${error.message}`);
        }
    }
};

testMpesaConnection();