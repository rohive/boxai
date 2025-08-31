import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

export class ClaudeService {
  private static instance: ClaudeService;
  private client: Anthropic;

  private constructor() {
    this.client = anthropic;
  }

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  public async generateResponse(prompt: string, model: string = 'claude-3-sonnet-20240229'): Promise<string> {
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
