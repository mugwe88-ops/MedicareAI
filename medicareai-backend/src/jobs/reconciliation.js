import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { querySTKStatus } from '../services/mpesa.service.js';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('🔄 Running Payment Reconciliation...');
  
  const pendingPayments = await prisma.payment.findMany({
    where: { 
      status: 'PENDING',
      createdAt: { lt: new Date(Date.now() - 2 * 60000) } // Older than 2 mins
    }
  });

  for (const payment of pendingPayments) {
    try {
      const result = await querySTKStatus(payment.checkoutRequestId);
      if (result.ResultCode === '0') {
        // Update database if Safaricom says it was successful
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' }
        });
      }
    } catch (e) {
      console.error(`Failed to reconcile ${payment.checkoutRequestId}`);
    }
  }
});