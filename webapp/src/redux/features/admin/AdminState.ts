import { IOpenAIDeployment } from '../../../libs/models/OpenAIDeployment';
import { ISpecialization } from '../../../libs/models/Specialization';
import { ISpecializationIndex } from '../../../libs/models/SpecializationIndex';

export type Specializations = Record<string, AdminState>;

export enum AdminScreen {
    NONE,
    SPECIALIZATION,
    INDEX,
    FEEDBACK,
    OPENAIDEPLOYMENT,
}

export interface AdminState {
    selectedAdminScreen: AdminScreen;
    chatSpecialization: ISpecialization | undefined;
    specializations: ISpecialization[];
    specializationIndexes: ISpecializationIndex[];
    chatCompletionDeployments: IOpenAIDeployment[];
    selectedId: string;
    selectedIndexId: string;
    selectedOpenAIDeploymentId: string;
}
export const Specializations = [
    {
        // Basic settings
        id: '',
        label: 'general',
        name: 'General',
        description: 'General',
        roleInformation: '',
        indexId: '',
        openAIDeploymentId: '',
        completionDeploymentName: '',
        imageFilePath: '',
        iconFilePath: '',
        isActive: true,
        groupMemberships: [],
        isDefault: false,
        restrictResultScope: false,
        strictness: 3,
        documentCount: 20,
        pastMessagesIncludedCount: 10,
        maxResponseTokenLimit: 1024,
        initialChatMessage: '',
        order: 0,
        suggestions: [],
        canGenImages: false,
    },
];
export const initialState: AdminState = {
    selectedAdminScreen: AdminScreen.NONE,
    chatSpecialization: undefined,
    specializations: Specializations,
    specializationIndexes: [],
    chatCompletionDeployments: [],
    selectedId: '',
    selectedIndexId: '',
    selectedOpenAIDeploymentId: '',
    openAIDeployments: [],
};
