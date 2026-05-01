import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { handleLLMRequest } from './controllers/gateway.controller';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middlewares
app.use(helmet()); // Adds enterprise-grade security headers
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads

// Readiness probe / Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-gateway'
  });
});

// LLM routing endpoint
app.post('/v1/chat/completions', handleLLMRequest);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 AI Gateway routing engine running on http://localhost:${PORT}`);
  console.log(`📊 Telemetry endpoint: POST http://localhost:${PORT}/v1/chat/completions`);
});