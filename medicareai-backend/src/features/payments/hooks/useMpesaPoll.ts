import { useState, useEffect } from 'react';
import axios from 'axios';

// We define what "status" can be so TypeScript doesn't guess
type PaymentStatus = 'IDLE' | 'PENDING' | 'COMPLETED' | 'FAILED';

export const useMpesaPoll = (checkoutRequestId: string | null) => {
  const [status, setStatus] = useState<PaymentStatus>('IDLE'); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutRequestId) return;

    setStatus('PENDING');

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/payments/status/${checkoutRequestId}`);
        const currentStatus: PaymentStatus = response.data.status;

        if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED') {
          setStatus(currentStatus);
          clearInterval(pollInterval); 
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Connection lost. Retrying...");
      }
    }, 3000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      // Logic for timeout if needed
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [checkoutRequestId]);

  return { status, error };
};