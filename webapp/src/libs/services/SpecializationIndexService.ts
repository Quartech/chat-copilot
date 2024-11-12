import { ISpecializationIndex } from '../models/SpecializationIndex';
import { BaseService } from './BaseService';

export class SpecializationIndexService extends BaseService {
    public getAllSpecializationIndexesAsync = async (accessToken: string): Promise<ISpecializationIndex[]> => {
        const result = await this.getResponseAsync<ISpecializationIndex[]>(
            {
                commandPath: 'indexes',
                method: 'GET',
            },
            accessToken,
        );
        return result;
    };

    public createSpecializationIndex = async (
        body: ISpecializationIndex,
        accessToken: string,
    ): Promise<ISpecializationIndex> => {
        const formData = new FormData();

        formData.append('name', body.name);
        formData.append('queryType', body.queryType);
        formData.append('searchDeploymentConnection', body.searchDeploymentConnection);
        formData.append('openAIDeploymentConnection', body.openAIDeploymentConnection);
        formData.append('embeddingDeployment', body.embeddingDeployment);

        const result = await this.getResponseAsync<ISpecializationIndex>(
            { commandPath: 'indexes', method: 'POST', body: formData },
            accessToken,
        );
        return result;
    };
}
