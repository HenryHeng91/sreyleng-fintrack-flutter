import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  async processReceipt(base64Image: string): Promise<{
    amount: number;
    description: string;
    category: string;
    date: string;
    type: 'expense' | 'income';
    account?: string;
    source?: string;
  }> {
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Analyze this receipt image (it might be a paper receipt or a digital bank receipt like ABA Bank).
      Extract the following information:
      - Total Amount (as a number)
      - Transaction Description (merchant name or purpose)
      - Category (e.g., Food, Transport, Shopping, Utility, Salary, Other)
      - Date (in YYYY-MM-DD format)
      - Transaction Type (expense or income)
      - Account (e.g., ABA, Cash, etc.)
      - Source (e.g., Wallet, Bank Transfer, etc.)
    `;

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image.split(',')[1] || base64Image,
      },
    };

    const response = await this.ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            date: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['expense', 'income'] },
            account: { type: Type.STRING },
            source: { type: Type.STRING },
          },
          required: ["amount", "description", "category", "date", "type"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  }

  async processStatement(base64Image: string): Promise<{
    amount: number;
    description: string;
    category: string;
    date: string;
    type: 'expense' | 'income';
  }[]> {
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Analyze this credit card statement image.
      Extract all transactions listed.
      For each transaction, provide:
      - Date (YYYY-MM-DD)
      - Description
      - Amount (positive for expenses, negative for payments/credits)
      - Category (best guess)
      - Type (expense or income)
    `;

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image.split(',')[1] || base64Image,
      },
    };

    const response = await this.ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              date: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['expense', 'income'] },
            },
            required: ["amount", "description", "category", "date", "type"],
          }
        },
      },
    });

    return JSON.parse(response.text || '[]');
  }
}
