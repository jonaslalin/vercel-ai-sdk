import { createAnthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { fireworks } from '@ai-sdk/fireworks';
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
  wrapLanguageModel,
} from 'ai';
import { z } from 'zod/v4';

const anthropic = createAnthropic({
  // example fetch wrapper that logs the input to the API call:
  fetch: async (url, options) => {
    console.log('URL', url);
    console.log('Headers', JSON.stringify(options!.headers, null, 2));
    console.log(
      `Body ${JSON.stringify(JSON.parse(options!.body! as string), null, 2)}`,
    );
    return await fetch(url, options);
  },
});

export type ReasoningToolsMessage = UIMessage<
  never, // could define metadata here
  UIDataTypes, // could define data parts here
  {
    getWeatherInformation: {
      input: { city: string };
      output: string;
    };
    askForConfirmation: {
      input: { message: string };
      output: string;
    };
    getLocation: {
      input: {};
      output: string;
    };
  }
>;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log(JSON.stringify(messages, null, 2));

  const result = streamText({
    model: wrapLanguageModel({
      model: fireworks('accounts/fireworks/models/qwen3-30b-a3b'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // multi-steps for server-side tools
    tools: {
      // server-side tool with execute function:
      getWeatherInformation: tool({
        description: 'show the weather in a given city to the user',
        inputSchema: z.object({ city: z.string() }),
        execute: async ({ city }: { city: string }) => {
          // Add artificial delay of 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));

          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
      }),
      // client-side tool that starts user interaction:
      askForConfirmation: tool({
        description: 'Ask the user for confirmation.',
        inputSchema: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      }),
      // client-side tool that is automatically executed on the client:
      getLocation: tool({
        description:
          'Get the user location. Always ask for confirmation before using this tool.',
        inputSchema: z.object({}),
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
