import Anthropic from "@anthropic-ai/sdk";
import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages";
import type { JSONOutputFormat } from "@anthropic-ai/sdk/resources/messages";
import path from "node:path";
import { resizeImageIfNeeded } from "./images";

const DEFAULT_MODEL = "claude-sonnet-4-5";
const FILES_API_BETA = "files-api-2025-04-14";

type JsonSchema = JSONOutputFormat["schema"];

export async function createImageMessage<T>(
    imagePath: string,
    prompt: string,
    jsonSchema: JsonSchema,
    options?: {
        model?: string;
        maxTokens?: number;
    },
) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { buffer, mediaType } = await resizeImageIfNeeded(imagePath);
    const uploaded = await client.beta.files.upload({
        file: new File([buffer], path.basename(imagePath), { type: mediaType }),
    });

    console.log(`Uploaded file ${imagePath} with id ${uploaded.id}`);

    const outputConfig = {
        format: {
            type: "json_schema",
            schema: jsonSchema,
        } satisfies JSONOutputFormat,
    };

    try {
        const message = await client.beta.messages.create({
            model: options?.model ?? DEFAULT_MODEL,
            max_tokens: options?.maxTokens ?? 1024,
            output_config: outputConfig,
            betas: [FILES_API_BETA],
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "file",
                                file_id: uploaded.id,
                            },
                        },
                        {
                            type: "text",
                            text: prompt,
                        },
                    ],
                },
            ],
        } as Parameters<typeof client.beta.messages.create>[0]) as BetaMessage;

        console.log(
            "Token usage:",
            JSON.stringify(
                {
                    input_tokens: message.usage.input_tokens,
                    output_tokens: message.usage.output_tokens
                },
                null,
                2,
            ),
        );

        const output = message.content[0].type === "text" ? message.content[0].text : null;
        if (!output) {
            throw new Error("Expected text output from the model, but got a different type.");
        }

        return JSON.parse(output) as T;
    } catch (error) {
        console.error(`Failed to process image ${imagePath}:`, error);
        return null;
    } finally {
        await client.beta.files.delete(uploaded.id);
    }
}
