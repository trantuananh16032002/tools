import dotenv from "dotenv";
dotenv.config();

const provider = process.env.AI_PROVIDER || "gemini";

// Lazy import để tối ưu
let geminiModel = null;
let openai = null;

// Prompt template
const TSHIRT_PROMPT_TEMPLATE = (title) => `
You are a classifier. Your task is simple:

- If the following product title contains keywords such as "T-Shirt", "Tee", "Shirt", or clearly implies a T-shirt, respond with "YES".
- If the title refers to a different product (e.g., hoodie, sweatshirt, pants, etc.), respond with "NO".
- Only respond with "YES" or "NO" (uppercase, no explanation).

Product title: "${title}"
`;

export async function isTshirt(title) {
  const prompt = TSHIRT_PROMPT_TEMPLATE(title);

  try {
    let reply = "";

    if (provider === "gemini") {
      if (!geminiModel) {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      }

      const result = await geminiModel.generateContent(prompt);
      reply = result.response.text().trim().toUpperCase();

    } else if (provider === "openai") {
      if (!openai) {
        const { OpenAI } = await import("openai");
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      }

      const result = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      reply = result.choices[0].message.content.trim().toUpperCase();
    }

    reply = reply.replace(/[^A-Z]/g, "");
    const isValid = reply === "YES" || reply === "NO";

    if (!isValid) {
      console.warn(`❗ Unexpected response from ${provider}: "${reply}"`);
      return false;
    }

    console.log(`🤖 [${provider}] response: ${reply}`);
    return reply === "YES";

  } catch (err) {
    console.error(`❌ ${provider} error:`, err.message);
    return false;
  }
}
