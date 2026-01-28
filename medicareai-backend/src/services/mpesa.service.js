import axios from 'axios';
import 'dotenv/config';

// Logic to toggle between Sandbox and Production
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;
const callbackUrl = process.env.MPESA_CALLBACK_URL;

const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

export const initiateSTKPush = async (phoneNumber, amount, reference = "MedicareAI") => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.slice(1)}`;
  if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);

  const response = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", // Use "CustomerBuyGoodsOnline" if using Till
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: reference,
      TransactionDesc: "Medical Consultation Fee"
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // This returns { CheckoutRequestID, ResponseCode, CustomerMessage, etc. }
  return response.data;
};
