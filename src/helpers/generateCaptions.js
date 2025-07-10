import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const generateCaptionsFromImage = async (base64Image) => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const mimeType = base64Image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const imagePart = {
        inlineData: {
            data: base64Image.split(',')[1], // remove data:image/...;base64,
            mimeType: mimeType,
        },
    };

    const result = await model.generateContent([
        { text: "Generate a short, Instagram-style caption for this image" },
        imagePart,
    ]);

    const response = await result.response;
    return response.text();
};
  
