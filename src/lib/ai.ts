import { GoogleGenerativeAI, type GenerativeModel, type ModelParams } from '@google/generative-ai';

export const getGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY ?? process.env['GEMINI-API-KEY'] ?? 'AIzaSyB4YYWjGYw62x_D0l9-JcQtPmhUybCeIbM';
  return key;
};

export const getGeminiModel = (model = 'gemini-1.5-flash', options?: Omit<ModelParams, 'model'>): GenerativeModel => {
  const client = new GoogleGenerativeAI(getGeminiKey());
  return client.getGenerativeModel({ model, ...options });
};

