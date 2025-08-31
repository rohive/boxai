import { openAIService as OpenAIService } from './openai';
import { claudeService as ClaudeService } from './claude';
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
  private openAIService: typeof OpenAIService;
  private claudeService: typeof ClaudeService;

  private constructor() {
    // Initialize with default values
    this.openAIService = OpenAIService;
    this.claudeService = ClaudeService;
    this.initializeServices();
  }

  private initializeServices() {
    try {
      console.log('Initializing AI services...');
      this.openAIService = OpenAIService;
      this.claudeService = ClaudeService;
      console.log('AI services initialized');
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
      throw new Error(`Failed to initialize AI services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getServices() {
    // Lazy initialization if services aren't set
    if (!this.openAIService || !this.claudeService) {
      this.initializeServices();
    }
    return {
      openAIService: this.openAIService,
      claudeService: this.claudeService
    };
  }

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
      console.error(`Unsupported model: ${model}`);
      throw new Error(`Unsupported model: ${model}`);
    }

    let text: string;
    const { openAIService, claudeService } = this.getServices();

    console.log(`Generating response with model: ${model} (${modelConfig.id})`);
    
    try {
      if (modelConfig.service === 'openai') {
        console.log('Using OpenAI service');
        text = await openAIService.generateResponse(prompt, modelConfig.id);
      } else if (modelConfig.service === 'claude') {
        console.log('Using Claude service');
        text = await claudeService.generateResponse(prompt, modelConfig.id);
      } else {
        const errorMsg = `Unsupported service: ${modelConfig.service}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const endTime = Date.now();
      const latency_ms = endTime - startTime;
      const word_count = text.split(/\s+/).length;

      console.log(`Response generated in ${latency_ms}ms (${word_count} words)`);

      return {
        model,
        text,
        latency_ms,
        word_count,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error generating response for model ${model}:`, errorMsg);
      console.error(error);
      
      return {
        model,
        text: `Error: ${errorMsg}`,
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
