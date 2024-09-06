import { ISpecialization, ISpecializationRequest, ISpecializationToggleRequest } from '../models/Specialization';
import { BaseService } from './BaseService';

export class SpecializationService extends BaseService {
    public getAllSpecializationsAsync = async (accessToken: string): Promise<ISpecialization[]> => {
        const result = await this.getResponseAsync<ISpecialization[]>(
            {
                commandPath: 'specializations',
                method: 'GET',
            },
            accessToken,
        );
        return result;
    };

    public getAllSpecializationIndexesAsync = async (accessToken: string): Promise<string[]> => {
        const result = await this.getResponseAsync<string[]>(
            {
                commandPath: 'specialization/indexes',
                method: 'GET',
            },
            accessToken,
        );
        return result;
    };

    public createSpecializationAsync = async (
        body: ISpecializationRequest,
        accessToken: string,
    ): Promise<ISpecialization> => {
        const formData = new FormData();

        // FormData expects string values for each key
        formData.append('label', body.label);
        formData.append('name', body.name);
        formData.append('description', body.description);
        formData.append('roleInformation', body.roleInformation);
        // This will need to be parsed on the backend
        formData.append('groupMemberships', body.groupMemberships.join(','));

        if (body.imageFile) {
            formData.append('imageFile', body.imageFile);
        }

        if (body.iconFile) {
            formData.append('iconFile', body.iconFile);
        }

        const result = await this.getResponseAsync<ISpecialization>(
            {
                commandPath: 'specializations',
                method: 'POST',
                body: formData,
            },
            accessToken,
        );
        return result;
    };

    public updateSpecializationAsync = async (
        specializationId: string,
        body: ISpecializationRequest,
        accessToken: string,
    ): Promise<ISpecialization> => {
        const result = await this.getResponseAsync<ISpecialization>(
            {
                commandPath: `specializations/${specializationId}`,
                method: 'PATCH',
                body,
            },
            accessToken,
        );
        return result;
    };

    public onOffSpecializationAsync = async (
        specializationId: string,
        isActive: boolean,
        accessToken: string,
    ): Promise<ISpecialization> => {
        const body: ISpecializationToggleRequest = {
            isActive,
        };
        const result = await this.getResponseAsync<ISpecialization>(
            {
                commandPath: `specializations/${specializationId}`,
                method: 'PATCH',
                body,
            },
            accessToken,
        );
        return result;
    };

    public deleteSpecializationAsync = async (specializationId: string, accessToken: string): Promise<object> => {
        const result = await this.getResponseAsync<object>(
            {
                commandPath: `specializations/${specializationId}`,
                method: 'DELETE',
            },
            accessToken,
        );

        return result;
    };
}
