import { IChatCompletionDeployment, ISpecialization } from '../../../libs/models/Specialization';
import { ISpecializationIndex } from '../../../libs/models/SpecializationIndex';

export type Specializations = Record<string, AdminState>;

export interface AdminState {
    isAdminSelected: boolean;
    isIndexSelected: boolean;
    chatSpecialization: ISpecialization | undefined;
    specializations: ISpecialization[];
    specializationIndexes: ISpecializationIndex[];
    chatCompletionDeployments: IChatCompletionDeployment[];
    selectedId: string;
    selectedIndexId: string;
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
        deployment: '',
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
        canGenImages: false,
    },
];
export const initialState: AdminState = {
    isAdminSelected: false,
    isIndexSelected: false,
    chatSpecialization: undefined,
    specializations: Specializations,
    specializationIndexes: [],
    chatCompletionDeployments: [],
    selectedId: '',
    selectedIndexId: '',
};
