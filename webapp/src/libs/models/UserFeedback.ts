import { UserFeedback } from './ChatMessage';

export interface IUserFeedbackFilterRequest {
    startDate?: Date;
    endDate?: Date;
    isPositive?: boolean;
    chatId?: string;
    userId?: string;
    sortBy?: UserFeedbackSortOptions;
}

export enum UserFeedbackSortOptions {
    dateAsc,
    dateDesc,
    feedbackPosNeg,
}

export interface IUserFeedbackResult {
    count: number;
    items: IUserFeedbackItem[];
}

export interface IUserFeedbackItem {
    userId: string;
    userName: string;
    chatId: string;
    messageId: string;
    specializationId: string;
    userFeedback: UserFeedback;
    content: string;
    prompt: string;
    timestamp: number;
}
