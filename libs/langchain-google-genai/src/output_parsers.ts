import type { z } from "zod";
import {
  BaseLLMOutputParser,
  OutputParserException,
} from "@langchain/core/output_parsers";
import { JsonOutputKeyToolsParserParams } from "@langchain/core/output_parsers/openai_tools";
import { ChatGeneration } from "@langchain/core/outputs";
import { ToolCall } from "@langchain/core/messages/tool";

interface GoogleGenerativeAIToolsOutputParserParams<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>
> extends JsonOutputKeyToolsParserParams<T> {
  toolChoice?: string;
}

export class GoogleGenerativeAIToolsOutputParser<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any> = Record<string, any>
> extends BaseLLMOutputParser<T> {
  static lc_name() {
    return "GoogleGenerativeAIToolsOutputParser";
  }

  lc_namespace = ["langchain", "google_genai", "output_parsers"];

  returnId = false;

  /** The type of tool calls to return. */
  keyName: string;

  /** Whether to return only the first tool call. */
  returnSingle = false;

  zodSchema?: z.ZodType<T>;
  
  toolChoice?: string;

  constructor(params: GoogleGenerativeAIToolsOutputParserParams<T>) {
    super(params);
    this.keyName = params.keyName;
    this.returnSingle = params.returnSingle ?? this.returnSingle;
    this.zodSchema = params.zodSchema;
    this.toolChoice = params.toolChoice ?? "any";
  }

  protected async _validateResult(result: unknown): Promise<T> {
    if (this.zodSchema === undefined) {
      return result as T;
    }
    const zodParsedResult = await this.zodSchema.safeParseAsync(result);
    if (zodParsedResult.success) {
      return zodParsedResult.data;
    } else {
      throw new OutputParserException(
        `Failed to parse. Text: "${JSON.stringify(
          result,
          null,
          2
        )}". Error: ${JSON.stringify(zodParsedResult.error.errors)}`,
        JSON.stringify(result, null, 2)
      );
    }
  }

  async parseResult(generations: ChatGeneration[]): Promise<T> {
    const tools = generations.flatMap((generation) => {
      const { message } = generation;
      if (!("tool_calls" in message) || !Array.isArray(message.tool_calls)) {
        return [];
      }
      return message.tool_calls as ToolCall[];
    });
        console.log("Available Tools:", tools);
    console.log("Tool Choice:", this.toolChoice);
    const filteredTools = this.toolChoice && this.toolChoice !== "any"
      ? tools.filter((tool) => tool.name === this.toolChoice)
      : tools;
    if (filteredTools[0] === undefined) {
      throw new Error(
                this.toolChoice
          ? `No tool calls match the specified toolChoice: ${this.toolChoice}`
          : "No parseable tool calls provided to GoogleGenerativeAIToolsOutputParser."
      );
    }
    const [tool] = filteredTools;
    console.log("Selected Tool:", tool);
    const validatedResult = await this._validateResult(tool.args);
    console.log("Validated Result:", validatedResult);
    return validatedResult;
  }
}
