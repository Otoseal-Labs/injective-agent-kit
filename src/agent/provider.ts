import { ModelProvider } from "../types";

export function getApiKeyForProvider(
    provider: ModelProvider,
): string | undefined {
    switch (provider) {
        case ModelProvider.ANTHROPIC:
            return process.env.ANTHROPIC_API_KEY;
        case ModelProvider.COHERE:
            return process.env.COHERE_API_KEY;
        case ModelProvider.GOOGLE:
            return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        case ModelProvider.MISTRAL:
            return process.env.MISTRAL_API_KEY;
        case ModelProvider.OPENAI:
            return process.env.OPENAI_API_KEY;
        default:
            const errorMessage = `Failed to get api key - unsupported model provider: ${provider}`;
            throw new Error(errorMessage);
    }
}
