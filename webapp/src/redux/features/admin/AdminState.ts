import { ISpecialization } from '../../../libs/models/Specialization';

export type Specializations = Record<string, AdminState>;

export interface AdminState {
    isAdminSelected: boolean;
    specializations: ISpecialization[];
    specializationIndexes: string[];
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
        imageFilePath: '',
        iconFilePath: '',
        isActive: true,
        groupMemberships: [],
        strictness: 3,
        documentCount: 20,
    },
];
export const initialState: AdminState = {
    isAdminSelected: false,
    specializations: Specializations,
    specializationIndexes: [],
    selectedId: '',
};
