import { Request, Response } from 'express';
import { aiService } from '../services/ai';
import { QueryRequest } from '../types';

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { query, models } = req.body as QueryRequest;

    if (!query || !models || !Array.isArray(models) || models.length === 0) {
      return res.status(400).json({
        error: 'Invalid request. Please provide a query and at least one model.',
      });
    }

    const responses = await Promise.all(
      models.map((model) =>
        aiService.generateResponse(query, model).catch((error) => ({
          model,
          text: `Error: ${error.message}`,
          latency_ms: 0,
          word_count: 0,
        }))
      )
    );

    res.json(responses);
  } catch (error) {
    console.error('Error in askQuestion:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listModels = async (_req: Request, res: Response) => {
  try {
    const models = aiService.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({
      error: 'Failed to fetch available models',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
