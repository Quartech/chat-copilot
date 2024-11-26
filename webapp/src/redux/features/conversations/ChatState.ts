// Copyright (c) Microsoft. All rights reserved.

import { IChatMessage } from '../../../libs/models/ChatMessage';
import { IChatUser } from '../../../libs/models/ChatUser';
/**
 * The interface has been modified to support specialization.
 */
export interface ChatState {
    id: string;
    title: string;
    systemDescription: string;
    memoryBalance: number;
    users: IChatUser[];
    messages: IChatMessage[];
    enabledHostedPlugins: string[];
    botProfilePicture: string;
    lastUpdatedTimestamp?: number;
    input: string;
    botResponseStatus: string | undefined;
    userDataLoaded: boolean;
    importingDocuments?: string[];
    disabled: boolean; // For labeling a chat has been deleted
    hidden: boolean; // For hiding a chat from the list
    specializationId?: string;
    createdOnServer: boolean; //Flag used to check whether this piece of state has been persisted to the server store yet or not
    generatedSuggestions: string[];
    loadingMessages: boolean;
}
