export interface IOpenAIDeployment {
    id: string;
    name: string;
    endpoint: string;
    secretName: string;
    chatCompletionDeployments: IChatCompletionDeployment[];
    embeddingDeployments: string[];
    imageGenerationDeployments: string[];
    order: number;
}

export interface IChatCompletionDeployment {
    name: string;
    completionTokenLimit: number;
    outputTokens: number;
}
