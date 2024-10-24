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
    order: number;
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
    order: number;
}

export interface ISpecializationToggleRequest {
    isActive: boolean;
}

export interface ISpecializationSwapOrder {
    fromId: string;
    fromOrder: number;
    toId: string;
    toOrder: number;
}
