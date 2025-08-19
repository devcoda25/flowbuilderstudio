'use server';

/**
 * @fileOverview AI-powered flow configuration suggestions.
 *
 * - generateFlowSuggestions - A function that generates AI-driven suggestions for optimizing flow configuration.
 * - GenerateFlowSuggestionsInput - The input type for the generateFlowSuggestions function.
 * - GenerateFlowSuggestionsOutput - The return type for the generateFlowSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlowSuggestionsInputSchema = z.object({
  flowDescription: z.string().describe('A description of the current flow.'),
  flowData: z.string().describe('The JSON representation of the current flow data.'),
});
export type GenerateFlowSuggestionsInput = z.infer<typeof GenerateFlowSuggestionsInputSchema>;

const GenerateFlowSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('AI-driven suggestions for optimizing the flow configuration.'),
});
export type GenerateFlowSuggestionsOutput = z.infer<typeof GenerateFlowSuggestionsOutputSchema>;

export async function generateFlowSuggestions(input: GenerateFlowSuggestionsInput): Promise<GenerateFlowSuggestionsOutput> {
  return generateFlowSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlowSuggestionsPrompt',
  input: {schema: GenerateFlowSuggestionsInputSchema},
  output: {schema: GenerateFlowSuggestionsOutputSchema},
  prompt: `You are an AI expert in omni-channel flow design. Given the flow description and data, provide suggestions for optimizing the flow configuration, focusing on node sequence, content enhancement, and channel-specific best practices, such as alternative node sequences or content enhancements.

Flow Description: {{{flowDescription}}}
Flow Data: {{{flowData}}}

Suggestions:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateFlowSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateFlowSuggestionsFlow',
    inputSchema: GenerateFlowSuggestionsInputSchema,
    outputSchema: GenerateFlowSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {suggestions: output!.suggestions};
  }
);
