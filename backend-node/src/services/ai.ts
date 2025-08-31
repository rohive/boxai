import { openAIService } from './openai';
import { claudeService } from './claude';
import { LLMResponse } from '../types';

interface ModelConfig {
  displayName: string;
  service: 'openai' | 'claude';
}

const MODEL_CONFIG: Record<string, ModelConfig> = {
  'gpt-3.5-turbo': {
    displayName: 'GPT-3.5',
    service: 'openai',
  },
  'gpt-4': {
    displayName: 'GPT-4',
    service: 'openai',
  },
  'claude-3-sonnet-20240229': {
    displayName: 'Claude',
    service: 'claude',
  },
};

type ModelKey = keyof typeof MODEL_CONFIG;

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateResponse(
    prompt: string,
    model: string
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const modelKey = model as ModelKey;
    const modelConfig = MODEL_CONFIG[modelKey];

    if (!modelConfig) {
      throw new Error(`Unsupported model: ${model}`);
    }

    let text: string;

    try {
      if (modelConfig.service === 'openai') {
        text = await openAIService.generateResponse(prompt, model);
      } else if (modelConfig.service === 'claude') {
        text = await claudeService.generateResponse(prompt, model);
      } else {
        throw new Error(`Unsupported service: ${modelConfig.service}`);
      }

      const endTime = Date.now();
      const latency_ms = endTime - startTime;
      const word_count = text.split(/\s+/).length;

      return {
        model: modelConfig.displayName,
        text,
        latency_ms,
        word_count,
      };
    } catch (error) {
      console.error(`Error generating response for ${model}:`, error);
      return {
        model: modelConfig.displayName,
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency_ms: 0,
        word_count: 0,
      };
    }
  }

  public getAvailableModels() {
    return Object.entries(MODEL_CONFIG).map(([key, config]) => ({
      id: key,
      name: config.displayName,
    }));
  }
}

export const aiService = AIService.getInstance();
