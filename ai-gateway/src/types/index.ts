// Domain models for strict typing across the gateway
// No raw JSON objects passed around—everything is typed

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface EvalContext {
  environment: 'development' | 'staging' | 'production';
  feature_flag?: string;
  expected_task?: string; // What was the AI supposed to do?
}

export interface GatewayRequest {
  messages: Message[];
  model: string;
  user_id: string; // The developer making the request
  eval_context?: EvalContext; // Optional eval data attached by the client
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TelemetryPayload {
  request_id: string;
  organization_id: string;
  user_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  status: 'success' | 'error';
  error_message?: string;
  eval_context: EvalContext | null;
  timestamp: string;
}
