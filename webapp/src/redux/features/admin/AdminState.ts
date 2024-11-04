import { ISpecialization } from '../../../libs/models/Specialization';

export type Specializations = Record<string, AdminState>;

export interface AdminState {
    isAdminSelected: boolean;
    chatSpecialization: ISpecialization | undefined;
    specializations: ISpecialization[];
    specializationIndexes: string[];
    chatCompletionDeployments: string[];
    selectedId: string;
}
export const Specializations = [
    {
        // Basic settings
        id: '',
        label: 'general',
        name: 'General',
        description: 'General',
        roleInformation: '',
        indexName: '',
        deployment: '',
        imageFilePath: '',
        iconFilePath: '',
        isActive: true,
        groupMemberships: [],
        restrictResultScope: false,
        strictness: 3,
        documentCount: 20,
        pastMessagesIncludedCount: 10,
        maxResponseTokenLimit: 1024,
        initialChatMessage: '',
        order: 0,
    },
];
export const initialState: AdminState = {
    isAdminSelected: false,
    chatSpecialization: undefined,
    specializations: Specializations,
    specializationIndexes: [],
    chatCompletionDeployments: [],
    selectedId: '',
};
