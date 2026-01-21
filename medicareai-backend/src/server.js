import app from './app.js'; // This already creates the app
import 'dotenv/config';
import './jobs/reconciliation.js'; 
import webhookRoutes from "./routes/webhook/routes.js";

// DO NOT WRITE "const app = express();" HERE - it is already imported above

// This "creates" the virtual path for Meta
app.use("/api/webhook", webhookRoutes); 

const PORT = process.env.PORT || 10000;

const startServer = () => {
  // We use the imported 'app' to listen
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`---`);
    console.log(`🟢 MedicareAI Server is Live!`);
    console.log(`🔄 Reconciliation Job: ACTIVE`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Webhook Path: /api/webhook`);
    console.log(`---`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} busy.`);
      process.exit(1);
    }
  });
};

startServer();