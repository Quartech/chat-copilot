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
    isDefault: boolean;
    restrictResultScope: boolean | null;
    strictness: number | null;
    documentCount: number | null;
    pastMessagesIncludedCount: number | null;
    maxResponseTokenLimit: number | null;
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
    isDefault: boolean;
    restrictResultScope: boolean | null;
    strictness: number | null;
    documentCount: number | null;
    pastMessagesIncludedCount: number | null;
    maxResponseTokenLimit: number | null;
    order: number;
}

export interface ISpecializationToggleRequest {
    indexName: string;
    isActive: boolean;
}
