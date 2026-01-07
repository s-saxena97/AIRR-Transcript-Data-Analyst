import { GoogleGenAI, Type } from "@google/genai";
import { StudentRecord, AnalysisResponse, ChartType } from "./types";

export const analyzeData = async (
  query: string,
  data: StudentRecord[]
): Promise<AnalysisResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return {
      answer: "Error: GEMINI_API_KEY is not configured in Vercel environment variables. Please add it and re-deploy.",
    };
  }

  // Initialize with the verified key
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are a Senior Data Analyst for AIRR (AI Transcript Processing).
    You have access to a student dataset. Your goal is to:
    1. Answer natural language questions about the data.
    2. Perform calculations (averages, counts, distributions).
    3. Suggest and provide data for a visualization if the query warrants it.
    
    Data Schema:
    - id, name, age, city, state, schoolName, schoolType, schoolState, schoolCity, cumulativeGpa, unweightedGpa, weightedGpa, rigorCoursesCount, creditsEarned, majorInterest, graduationYear.

    Return a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: `Current Dataset (JSON): ${JSON.stringify(data)}` },
            { text: `User Query: ${query}` }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
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
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      label: { type: Type.STRING }, 
                      value: { type: Type.NUMBER } 
                    },
                    required: ["label", "value"]
                  },
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
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResponse;
  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    return {
      answer: "I encountered an error during inference. This usually happens if the API key is invalid or the request was blocked. Please check your Vercel logs.",
    };
  }
};