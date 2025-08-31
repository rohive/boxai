import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

export class ClaudeService {
  private static instance: ClaudeService;
  private client: Anthropic;
  private apiKey: string;
  private defaultModel: string;

  private constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.defaultModel = 'claude-3-haiku-20240307'; // Using Haiku as default for better reliability
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  public async listModels() {
    try {
      // Note: The Anthropic API doesn't have a direct models endpoint like OpenAI
      // So we'll return the known models
      return {
        models: [
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
          { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
        ]
      };
    } catch (error) {
      console.error('Error listing Claude models:', error);
      throw new Error(`Failed to list models: ${error}`);
    }
  }

  public async generateResponse(prompt: string, model: string = this.defaultModel): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Safely extract text content from the response
      const content = response.content.find(
        (item: any) => item.type === 'text'
      ) as { type: 'text'; text: string } | undefined;

      return content?.text || 'No response from model';
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }
}

export const claudeService = ClaudeService.getInstance();
