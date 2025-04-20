import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TSHIRT_PROMPT_TEMPLATE = (title) => `
You are a classifier. Your task is simple:

- If the following product title contains keywords such as "T-Shirt", "Tee", "Shirt", or clearly implies a T-shirt, respond with "YES".
- If the title refers to a different product (e.g., hoodie, sweatshirt, pants, etc.), respond with "NO".
- Only respond with "YES" or "NO" (uppercase, no explanation).

Product title: "${title}"
`;

export async function isTshirt(title) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = TSHIRT_PROMPT_TEMPLATE(title);
    const result = await model.generateContent(prompt);

    let reply = result.response.text().trim().toUpperCase();

    // Normalize reply
    reply = reply.replace(/[^A-Z]/g, ""); 

    const isValid = reply === "YES" || reply === "NO";

    if (!isValid) {
      console.warn(`Unexpected Gemini response: "${reply}"`);
      return false;
    }

    console.log(`Gemini response: ${reply}`);
    return reply === "YES";
  } catch (err) {
    console.error("Gemini error:", err.message);
    return false;
  }
}
