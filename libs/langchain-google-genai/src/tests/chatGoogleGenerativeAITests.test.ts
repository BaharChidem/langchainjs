import { ChatGoogleGenerativeAI } from "../chat_models.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

describe("ChatGoogleGenerativeAI Tests", () => {
  it("should generate structured output with simple schema", async () => {
    const schema = z.object({ name: z.string(), age: z.number() });

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    const structuredLlm = model.withStructuredOutput(schema);
    const request = "Generate structured data for a user.";
    const result = await structuredLlm.invoke(request);

    console.log("Simple Schema Result:", result);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("age");
  });

  it("should fail if the model ignores tool_choice", async () => {
    const schema = z.object({ key: z.string() });

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    const structuredLlm = model.withStructuredOutput(schema, {
      name: "expectedTool",
      toolChoice: "expectedTool",
    });

    const request = "Generate structured data using the wrong tool.";
    const response = await structuredLlm.invoke(request);
    const invokedTool = response.tool_calls?.[0]?.name;

    console.log("Invoked Tool:", invokedTool);
    expect(invokedTool).toBe("expectedTool");
  });

  it("should fail if no tool call is made", async () => {
    const schema = z.object({ title: z.string(), description: z.string() });

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    const structuredLlm = model.withStructuredOutput(schema, {
      name: "missingTool",
      toolChoice: "missingTool",
    });

    const request = "Generate a title and description without using a tool.";
    const response = await structuredLlm.invoke(request);

    console.log("Response without Tool Call:", response);
    expect(response.tool_calls?.length).toBeGreaterThan(0);
  });

  it("should fail if the output does not match the schema", async () => {
    const schema = z.object({ name: z.string(), age: z.number() });

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    const structuredLlm = model.withStructuredOutput(schema, {
      name: "correctTool",
      toolChoice: "correctTool",
    });

    const request = "Generate a structured response with incorrect schema.";
    const response = await structuredLlm.invoke(request);

    console.log("Schema Mismatch Response:", response);
    expect(response.tool_calls?.[0]?.name).toBe("correctTool");
  });

  it("should fail if the prompt is ambiguous", async () => {
    const schema = z.object({ result: z.string() });

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    const structuredLlm = model.withStructuredOutput(schema, {
      name: "targetTool",
      toolChoice: "targetTool",
    });

    const ambiguousRequest = "Do something interesting.";

    const response = await structuredLlm.invoke(ambiguousRequest);

    console.log("Ambiguous Prompt Response:", response);

    expect(response).toHaveProperty("result");
    expect(response.tool_calls?.[0]?.name).toBe("targetTool");
  });
});
