import app from './app.js';
import 'dotenv/config';
import './jobs/reconciliation.js'; // 👈 Add this line to start the background worker
import webhookRoutes from "./routes/webhook/routes.js";

app.use("/api", webhookRoutes);

const PORT = process.env.PORT || 3000;

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`---`);
    console.log(`🟢 MedicareAI Server is Live!`);
    console.log(`🔄 Reconciliation Job: ACTIVE`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`---`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} busy. Try: fuser -k ${PORT}/tcp`);
      process.exit(1);
    }
  });
};

startServer();