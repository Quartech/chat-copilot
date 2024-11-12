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
}
