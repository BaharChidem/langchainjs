import { ChatGoogleGenerativeAI } from "../chat_models.js";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);
const schema = z.object({
  name: z.string(),
  age: z.number(),
});
describe("generateStructuredOutput", () => {
  it("should generate structured output without errors", async () => {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });
    const structuredLlm = model.withStructuredOutput(schema);
    const request = "Generate a structured response for a user.";
    try {
      const result = await structuredLlm.invoke(request);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("age");
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });
});
