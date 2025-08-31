export interface LLMResponse {
  model: string;
  text: string;
  latency_ms: number;
  word_count: number;
}

export interface QueryRequest {
  query: string;
  models: string[];
}

export interface ModelConfig {
  name: string;
  displayName: string;
  isEnabled: boolean;
}
