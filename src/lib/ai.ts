import { GoogleGenerativeAI, type GenerativeModel, type ModelParams } from '@google/generative-ai';

export const getGeminiKey = () => {
  return process.env.GEMINI_API_KEY || '';
};

export const getGeminiModel = (model = 'gemini-2.5-flash', options?: Omit<ModelParams, 'model'>): GenerativeModel => {
  const client = new GoogleGenerativeAI(getGeminiKey());
  return client.getGenerativeModel({ model, ...options });
};

