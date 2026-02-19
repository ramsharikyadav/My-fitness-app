
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Language, ExerciseHelp } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyMotivation = async (day: string, focus: string, lang: Language = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a friendly fitness coach. Today is ${day} and the workout focus is ${focus}. 
      Give me a 2-sentence motivational tip for staying active today, especially for someone with a sitting office job. 
      Respond strictly in ${lang === 'hi' ? 'Hindi language' : 'English language'}. Keep it encouraging and punchy.`,
    });
    return response.text || (lang === 'hi' ? "हर कदम मायने रखता है। आज के लक्ष्यों को हासिल करें!" : "Every step counts. Let's crush today's goals!");
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'hi' ? "प्रगति पर ध्यान दें, पूर्णता पर नहीं। आप कर सकते हैं!" : "Focus on the progress, not the perfection. You've got this!";
  }
};

export const getRecipe = async (mealDescription: string, lang: Language = 'en'): Promise<Recipe | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a healthy, traditional Indian-style recipe for: "${mealDescription}". 
      Focus on nutrition, low oil, and high protein. 
      The output must be strictly in ${lang === 'hi' ? 'Hindi language' : 'English language'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            instructions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            calories: { type: Type.STRING },
            prepTime: { type: Type.STRING }
          },
          required: ["id", "name", "ingredients", "instructions", "calories", "prepTime"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as Recipe;
  } catch (error) {
    console.error("Recipe Fetch Error:", error);
    return null;
  }
};

export const getExerciseHelp = async (exerciseName: string, lang: Language = 'en'): Promise<ExerciseHelp | null> => {
  try {
    // 1. Get Text Content
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain how to properly perform the exercise: "${exerciseName}". 
      Provide a short description, 3 key form tips, and 1 common mistake to avoid.
      The output must be strictly in ${lang === 'hi' ? 'Hindi language' : 'English language'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            mistake: { type: Type.STRING }
          },
          required: ["description", "tips", "mistake"]
        }
      }
    });

    // 2. Generate Visual Illustration
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A clean, professional, high-quality fitness illustration of a person correctly performing the exercise: ${exerciseName}. The style should be minimalist, clean lines, bright background, showing proper form and posture. Instructional workout guide style.` }
        ]
      }
    });

    let imageUrl = "";
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    const textContent = JSON.parse(textResponse.text);

    return {
      name: exerciseName,
      ...textContent,
      imageUrl
    };
  } catch (error) {
    console.error("Exercise Help Error:", error);
    return null;
  }
};
