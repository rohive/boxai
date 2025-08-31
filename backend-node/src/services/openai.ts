import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI;

  private constructor() {
    this.client = openai;
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async generateResponse(prompt: string, model: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user' as const, content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'No response from model';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }
}

export const openAIService = OpenAIService.getInstance();
