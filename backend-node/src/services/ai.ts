import { openAIService } from './openai';
import { claudeService } from './claude';
import { LLMResponse } from '../types';

// Define model configuration type
interface ModelConfig {
  id: string;           // Full model ID for the API
  displayName: string;  // Display name for UI
  service: 'openai' | 'claude';
}

// Map of short names to full model configurations
const MODEL_MAP: Record<string, ModelConfig> = {
  // Short names (used by frontend) to model configs
  'openai': {
    id: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5',
    service: 'openai',
  },
  'claude': {
    id: 'claude-3-haiku-20240307', // Using Claude 3 Haiku for better reliability
    displayName: 'Claude',
    service: 'claude',
  },
  'gpt4': {
    id: 'gpt-4',
    displayName: 'GPT-4',
    service: 'openai',
  },
  // Direct model IDs for backward compatibility
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5',
    service: 'openai',
  },
  'gpt-4': {
    id: 'gpt-4',
    displayName: 'GPT-4',
    service: 'openai',
  },
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    displayName: 'Claude',
    service: 'claude',
  },
};

type ModelKey = keyof typeof MODEL_MAP;

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
    const modelConfig = MODEL_MAP[modelKey];

    if (!modelConfig) {
      throw new Error(`Unsupported model: ${model}`);
    }

    let text: string;

    try {
      if (modelConfig.service === 'openai') {
        text = await openAIService.generateResponse(prompt, modelConfig.id);
      } else if (modelConfig.service === 'claude') {
        text = await claudeService.generateResponse(prompt, modelConfig.id);
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
    // Only return the short names for the frontend
    const frontendModels = ['openai', 'claude', 'gpt4'] as const;
    return frontendModels.map(key => {
      const model = MODEL_MAP[key];
      return {
        id: key,
        name: model.displayName,
      };
    });
  }
}

export const aiService = AIService.getInstance();
