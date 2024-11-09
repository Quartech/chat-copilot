export interface IUserFeedbackFilterRequest {
    startDate?: Date;
    endDate?: Date;
    isPositive?: boolean;
    chatId?: string;
    userId?: string;
    sortBy?: UserFeedbackSortOptions;
}

export interface IUserFeedback {
    message: string[];
}

export enum UserFeedbackSortOptions {
    dateAsc,
    dateDesc,
    feedbackPosNeg,
}
