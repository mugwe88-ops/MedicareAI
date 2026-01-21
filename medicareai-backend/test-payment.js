// test-payment.js
import axios from 'axios';

const TEST_DATA = {
  // Use your real Safaricom number in 254... format to receive the prompt
  phoneNumber: "2547XXXXXXXX", 
  amount: 1,
  // This should be a valid ID from your Appointment table
  appointmentId: "cm0uz1abc000008l5exyz1234" 
};

const triggerTest = async () => {
  console.log("🚀 Initiating STK Push Test...");
  
  try {
    const response = await axios.post('http://localhost:3000/api/payments/initiate', TEST_DATA);
    
    console.log("✅ STK Push Triggered Successfully!");
    console.log("Response:", response.data);
    console.log("\n👉 Check your phone for the M-Pesa PIN prompt.");
  } catch (error) {
    console.error("❌ Test Failed!");
    if (error.response) {
      console.error("Error Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
};

triggerTest();