import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { handleLLMRequest } from './controllers/gateway.controller';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middlewares
app.use(helmet()); // Adds enterprise-grade security headers

// Strict CORS: In production, you would set origin to your specific Next.js domain
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*', 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' })); // Strict payload size limit to prevent buffer overflow attacks

// Aggressive Global API Rate Limiter
// Limits each IP to 100 requests per 15 minutes to prevent DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Readiness probe / Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-gateway'
  });
});

// LLM routing endpoint with rate limiting attached
app.post('/v1/chat/completions', globalLimiter, handleLLMRequest);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 AI Gateway routing engine running on http://localhost:${PORT}`);
  console.log(`📊 Telemetry endpoint: POST http://localhost:${PORT}/v1/chat/completions`);
});