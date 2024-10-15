export interface ISpecialization {
    id: string;
    label: string;
    name: string;
    description: string;
    roleInformation: string;
    indexName: string;
    deployment: string;
    imageFilePath: string;
    iconFilePath: string;
    isActive: boolean;
    groupMemberships: string[];
    restrictResultScope: boolean;
    strictness: number;
    documentCount: number;
    initialChatMessage: string;
}

/**
 * Specialization request interface.
 *
 */
export interface ISpecializationRequest {
    label: string;
    name: string;
    description: string;
    roleInformation: string;
    indexName: string;
    deployment: string;
    imageFile: File | null;
    iconFile: File | null;
    deleteImage?: boolean; // Flag to delete the image
    deleteIcon?: boolean; // Flag to delete the icon
    groupMemberships: string[];
    initialChatMessage: string;
    restrictResultScope: boolean;
    strictness: number;
    documentCount: number;
}

export interface ISpecializationToggleRequest {
    isActive: boolean;
}
