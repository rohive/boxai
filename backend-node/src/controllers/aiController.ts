import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai';

export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }

    console.log(`Generating response for model: ${model}`);
    const response = await aiService.generateResponse(prompt, model);
    console.log('Response generated successfully');
    
    return res.json(response);
  } catch (error) {
    console.error('Error in askQuestion:', error);
    next(error);
  }
};

export const listModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching available models');
    const models = aiService.getAvailableModels();
    console.log('Available models:', models);
    return res.json({ models });
  } catch (error) {
    console.error('Error in listModels:', error);
    next(error);
  }
};
