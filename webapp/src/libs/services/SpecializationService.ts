import { ISpecialization, ISpecializationRequest, ISpecializationSwapOrder } from '../models/Specialization';
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

    public getAllChatCompletionDeploymentsAsync = async (accessToken: string): Promise<string[]> => {
        const result = await this.getResponseAsync<string[]>(
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
        formData.append('indexName', body.indexName);
        formData.append('deployment', body.deployment);
        formData.append('initialChatMessage', body.initialChatMessage);
        formData.append('restrictResultScope', body.restrictResultScope.toString());
        formData.append('strictness', body.strictness.toString());
        formData.append('documentCount', body.documentCount.toString());
        formData.append('order', body.order.toString());
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
        formData.append('indexName', body.indexName);
        formData.append('roleInformation', body.roleInformation);
        formData.append('deployment', body.deployment);
        formData.append('initialChatMessage', body.initialChatMessage);
        formData.append('restrictResultScope', body.restrictResultScope.toString());
        formData.append('strictness', body.strictness.toString());
        formData.append('documentCount', body.documentCount.toString());
        formData.append('order', body.order.toString());
        // This will need to be parsed on the backend
        formData.append('groupMemberships', body.groupMemberships.join(','));

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
     * Swaps the order of specializations by sending a POST request to the server.
     *
     * @param {ISpecializationSwapOrder} body - The request body containing the details for swapping specialization orders.
     * @param {string} accessToken - The access token required for authentication with the API.
     * @returns {Promise<object>} A promise that resolves to an object representing the result of the swap operation from the server.
     * @throws {Error} Throws an error if the network request fails or if the server returns an error response.
     */
    async swapSpecializationOrder(body: ISpecializationSwapOrder, accessToken: string): Promise<void> {
        await this.getResponseAsync(
            {
                commandPath: `specializations/order`,
                method: 'POST',
                body: body,
            },
            accessToken,
        );
    }
}
