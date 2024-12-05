import { IOpenAIDeployment } from '../models/OpenAIDeployment';
import { BaseService } from './BaseService';

export class OpenAIDeploymentService extends BaseService {
    public getAllOpenAIDeploymentsAsync = async (accessToken: string): Promise<IOpenAIDeployment[]> => {
        const result = await this.getResponseAsync<IOpenAIDeployment[]>(
            { commandPath: 'openAIDeployments', method: 'GET' },
            accessToken,
        );
        return result;
    };

    public createOpenAIDeployment = async (
        body: IOpenAIDeployment,
        accessToken: string,
    ): Promise<IOpenAIDeployment> => {
        const formData = new FormData();
        formData.append('name', body.name);
        formData.append('endpoint', body.endpoint);
        formData.append('secretName', body.secretName);
        formData.append('chatCompletionDeployments', JSON.stringify(body.chatCompletionDeployments));
        formData.append('embeddingDeployments', JSON.stringify(body.embeddingDeployments));
        formData.append('imageGenerationDeployments', JSON.stringify(body.imageGenerationDeployments));

        const result = await this.getResponseAsync<IOpenAIDeployment>(
            { commandPath: 'openAIDeployments', method: 'POST', body: formData },
            accessToken,
        );
        return result;
    };

    public updateOpenAIDeployment = async (id: string, body: IOpenAIDeployment, accessToken: string) => {
        const formData = new FormData();
        formData.append('name', body.name);
        formData.append('endpoint', body.endpoint);
        formData.append('secretName', body.secretName);
        formData.append('chatCompletionDeployments', JSON.stringify(body.chatCompletionDeployments));
        formData.append('embeddingDeployments', JSON.stringify(body.embeddingDeployments));
        formData.append('imageGenerationDeployments', JSON.stringify(body.imageGenerationDeployments));

        const result = await this.getResponseAsync<IOpenAIDeployment>(
            { commandPath: `openAIDeployments/${id}`, method: 'PATCH', body: formData },
            accessToken,
        );
        return result;
    };

    public deleteOpenAIDeployment = async (id: string, accessToken: string) => {
        const result = await this.getResponseAsync<boolean>(
            { commandPath: `openAIDeployments/${id}`, method: 'DELETE' },
            accessToken,
        );
        return result;
    };

    public setOpenAIDeploymentOrder = async (body: IOpenAIDeployment[], accessToken: string): Promise<void> => {
        const deploymentsOrder = {
            ordering: body.reduce<Record<string, number>>((acc, index) => {
                acc[index.id] = index.order;
                return acc;
            }, {}),
        };

        await this.getResponseAsync(
            {
                commandPath: `openAIDeployments/order`,
                method: 'POST',
                body: deploymentsOrder,
            },
            accessToken,
        );
    };
}
