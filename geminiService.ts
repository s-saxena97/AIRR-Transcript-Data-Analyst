
import { GoogleGenAI, Type } from "@google/genai";
import { StudentRecord, AnalysisResponse, ChartType } from "./types";

export const analyzeData = async (
  query: string,
  data: StudentRecord[]
): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // To keep payload small and efficient, we describe the data structure
  // and send a relevant subset or summary if needed. 
  // For this app, we'll send the data sample directly as it is small.
  
  const systemInstruction = `
    You are a Senior Data Analyst for AIRR (AI Transcript Processing).
    You have access to a student dataset. Your goal is to:
    1. Answer natural language questions about the data.
    2. Perform calculations (averages, counts, distributions).
    3. Suggest and provide data for a visualization if the query warrants it.
    
    Data Schema:
    - id: string
    - name: string
    - age: number
    - city: string
    - state: string
    - schoolName: string
    - schoolType: 'College' | 'High School'
    - schoolState: string
    - schoolCity: string
    - cumulativeGpa: number
    - unweightedGpa: number
    - weightedGpa: number
    - rigorCoursesCount: number
    - creditsEarned: number
    - majorInterest: string
    - graduationYear: number

    Return a valid JSON object following the schema provided.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: `System Context: ${systemInstruction}` },
          { text: `Current Dataset (JSON): ${JSON.stringify(data)}` },
          { text: `User Query: ${query}` }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING, description: "Direct text answer to the user query" },
          calculationSummary: { type: Type.STRING, description: "Details of any math performed" },
          visualization: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: Object.values(ChartType), description: "Type of chart" },
              data: { 
                type: Type.ARRAY, 
                items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } } },
                description: "Array of objects for charting"
              },
              xAxisLabel: { type: Type.STRING },
              yAxisLabel: { type: Type.STRING },
              title: { type: Type.STRING }
            },
            required: ["type", "data", "xAxisLabel", "yAxisLabel", "title"]
          }
        },
        required: ["answer"]
      },
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResponse;
  } catch (err) {
    console.error("Failed to parse Gemini response", err);
    return {
      answer: "I encountered an error analyzing that data. Could you try rephrasing?",
    };
  }
};
