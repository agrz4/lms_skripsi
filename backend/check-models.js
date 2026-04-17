const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function listModels() {
  try {
    const listResult = await ai.models.list();
    console.log('--- Model List (Async Iteration) ---');
    
    // SDK v2: list() returns an async iterator
    for await (const model of listResult) {
      console.log(`> ${model.name}`);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
