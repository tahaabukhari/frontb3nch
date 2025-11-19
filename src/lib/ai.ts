import { GoogleGenerativeAI, type GenerativeModel, type ModelParams } from '@google/generative-ai';

export const getGeminiKey = () => {
  const key = process.env['GEMINI-API-KEY'] ?? process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY or GEMINI-API-KEY environment variable');
  }
  return key;
};

export const getGeminiModel = (model = 'gemini-1.5-flash', options?: Omit<ModelParams, 'model'>): GenerativeModel => {
  const client = new GoogleGenerativeAI(getGeminiKey());
  return client.getGenerativeModel({ model, ...options });
};

