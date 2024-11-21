import { IChatCompletionDeployment, ISpecialization, ISpecializationRequest } from '../models/Specialization';
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

    public getAllChatCompletionDeploymentsAsync = async (accessToken: string): Promise<IChatCompletionDeployment[]> => {
        const result = await this.getResponseAsync<IChatCompletionDeployment[]>(
            {
                commandPath: 'specialization/deployments',
                method: 'GET',
            },
            accessToken,
        );
        return result;
    };

    /**
     * Create specialization.
     *
     * Note: The backend endpoint expects FormData which only accepts string values.
     *
     * @async
     * @param {ISpecializationRequest} body - The specialization request body.
     * @param {string} accessToken
     * @returns {Promise<ISpecialization>}
     */
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
        formData.append('deployment', body.deployment);
        formData.append('initialChatMessage', body.initialChatMessage);
        formData.append('indexId', body.indexId);
        formData.append('groupMemberships', body.groupMemberships.join(','));
        formData.append('order', body.order.toString());
        formData.append('isDefault', body.isDefault.toString());
        if (body.restrictResultScope) {
            formData.append('restrictResultScope', body.restrictResultScope.toString());
        }
        if (body.strictness) {
            formData.append('strictness', body.strictness.toString());
        }
        if (body.documentCount) {
            formData.append('documentCount', body.documentCount.toString());
        }
        if (body.pastMessagesIncludedCount) {
            formData.append('pastMessagesIncludedCount', body.pastMessagesIncludedCount.toString());
        }
        if (body.maxResponseTokenLimit) {
            formData.append('maxResponseTokenLimit', body.maxResponseTokenLimit.toString());
        }
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

    /**
     * Update specialization.
     *
     * Note: The backend endpoint expects FormData which only accepts string values.
     *
     * @async
     * @param {string} specializationId
     * @param {ISpecializationRequest} body - Specialization request body.
     * @param {string} accessToken
     * @returns {Promise<ISpecialization>}
     */
    public updateSpecializationAsync = async (
        specializationId: string,
        body: ISpecializationRequest,
        accessToken: string,
    ): Promise<ISpecialization> => {
        const formData = new FormData();

        // FormData expects string values for each key
        formData.append('label', body.label);
        formData.append('name', body.name);
        formData.append('description', body.description);
        formData.append('roleInformation', body.roleInformation);
        formData.append('deployment', body.deployment);
        formData.append('initialChatMessage', body.initialChatMessage);
        formData.append('indexId', body.indexId);
        formData.append('groupMemberships', body.groupMemberships.join(','));
        formData.append('order', body.order.toString());
        formData.append('isDefault', body.isDefault.toString());
        if (body.restrictResultScope) {
            formData.append('restrictResultScope', body.restrictResultScope.toString());
        }
        if (body.strictness) {
            formData.append('strictness', body.strictness.toString());
        }
        if (body.documentCount) {
            formData.append('documentCount', body.documentCount.toString());
        }
        if (body.pastMessagesIncludedCount) {
            formData.append('pastMessagesIncludedCount', body.pastMessagesIncludedCount.toString());
        }
        if (body.maxResponseTokenLimit) {
            formData.append('maxResponseTokenLimit', body.maxResponseTokenLimit.toString());
        }
        if (body.deleteImage) {
            formData.append('deleteImageFile', 'True');
        }

        if (body.deleteIcon) {
            formData.append('deleteIconFile', 'True');
        }

        if (body.imageFile) {
            formData.append('imageFile', body.imageFile);
        }

        if (body.iconFile) {
            formData.append('iconFile', body.iconFile);
        }

        const result = await this.getResponseAsync<ISpecialization>(
            {
                commandPath: `specializations/${specializationId}`,
                method: 'PATCH',
                body: formData,
            },
            accessToken,
        );
        return result;
    };

    /**
     * Toggle specialization on or off.
     *
     * Note: The backend endpoint expects FormData which only accepts string values.
     *
     * @async
     * @param {string} specializationId
     * @param {boolean} isActive - Is the specialization active?
     * @param {string} accessToken
     * @returns {Promise<ISpecialization>}
     */
    public onOffSpecializationAsync = async (
        specializationId: string,
        isActive: boolean,
        accessToken: string,
    ): Promise<ISpecialization> => {
        const formData = new FormData();

        formData.append('isActive', isActive.toString());

        const result = await this.getResponseAsync<ISpecialization>(
            {
                commandPath: `specializations/${specializationId}`,
                method: 'PATCH',
                body: formData,
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

    /**
     * Sets the order of specializations on the server by converting an array of specializations into a format
     * suitable for the backend API, then posts this data to update the specialization order.
     *
     * @param {ISpecialization[]} body - An array of specializations where each object includes an `id` and an `order`.
     * @param {string} accessToken - The access token for authentication with the API.
     * @returns {Promise<void>} A promise that resolves when the order has been successfully updated or rejects with an error.
     * @throws Will throw an error if the API request fails or if there's an issue during data conversion.
     */
    async setSpecializationsOrder(body: ISpecialization[], accessToken: string): Promise<void> {
        const specializationOrder = {
            ordering: body.reduce<Record<string, number>>((acc, specialization) => {
                acc[specialization.id] = specialization.order;
                return acc;
            }, {}),
        };

        await this.getResponseAsync(
            {
                commandPath: `specializations/order`,
                method: 'POST',
                body: specializationOrder,
            },
            accessToken,
        );
    }
}
