export interface IOpenAIDeployment {
    id: string;
    name: string;
    chatCompletionDeployments: IChatCompletionDeployment[];
}

export interface IChatCompletionDeployment {
    name: string;
    completionTokenLimit: number;
}
