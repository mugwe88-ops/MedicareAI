import axios from 'axios';
import 'dotenv/config';

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;
const callbackUrl = process.env.MPESA_CALLBACK_URL;

const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

// NEW: Production Status Query
export const querySTKStatus = async (checkoutRequestID) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const initiateSTKPush = async (phoneNumber, amount) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.slice(1)}`;

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "MedicareAI",
      TransactionDesc: "Medical Payment"
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};