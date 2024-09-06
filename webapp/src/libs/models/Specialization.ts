export interface ISpecialization {
    id: string;
    label: string;
    name: string;
    description: string;
    roleInformation: string;
    indexName: string | undefined;
    imageFilePath: string;
    iconFilePath: string;
    isActive: boolean;
    groupMemberships: string[];
    strictness: number;
    documentCount: number;
}

export interface ISpecializationRequest {
    label: string;
    name: string;
    description: string;
    roleInformation: string;
    indexName: string;
    imageFile: File | null;
    iconFile: File | null;
    groupMemberships: string[];
}

export interface ISpecializationToggleRequest {
    isActive: boolean;
}
