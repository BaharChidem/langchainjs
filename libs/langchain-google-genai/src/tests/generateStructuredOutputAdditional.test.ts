import { ChatGoogleGenerativeAI } from "../chat_models.js";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);
describe("Additional generateStructuredOutput Tests", () => {
  it("should generate structured output with simple schema", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });
    const structuredLlm = model.withStructuredOutput(schema);
    const request = "Provide structured data with name and age.";
    const result = await structuredLlm.invoke(request);
    console.log("Result:", result);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("age");
  });
  it("should test forced function calling", async () => {
    const schema = z.object({
      title: z.string(),
      description: z.string().optional(),
    });
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });
    const structuredLlm = model.withStructuredOutput(schema, {
      name: "provideTitle",
    });
    const request = "Generate structured output with title and description.";
    const result = await structuredLlm.invoke(request);
    console.log("Forced Function Result:", result);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("title");
  });
});
