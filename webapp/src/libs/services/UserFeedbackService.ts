import { IUserFeedbackFilterRequest, IUserFeedbackResult } from '../models/UserFeedback';
import { BaseService } from './BaseService';

export class UserFeedbackService extends BaseService {
    public fetchFeedback = async (
        filter: IUserFeedbackFilterRequest,
        accessToken: string,
    ): Promise<IUserFeedbackResult> => {
        const queryParams = new URLSearchParams();
        if (filter.startDate) queryParams.append('StartDate', filter.startDate.toISOString().split('T')[0]);
        if (filter.endDate) queryParams.append('EndDate', filter.endDate.toISOString().split('T')[0]);
        if (filter.isPositive !== undefined) queryParams.append('IsPositive', filter.isPositive.toString());
        if (filter.specializationId) queryParams.append('SpecializationId', filter.specializationId);
        if (filter.chatId) queryParams.append('ChatId', filter.chatId);
        if (filter.sortBy) queryParams.append('SortBy', filter.sortBy);

        const result = await this.getResponseAsync<IUserFeedbackResult>(
            {
                commandPath: `userfeedback/search?${queryParams.toString()}`,
                method: 'GET',
            },
            accessToken,
        );
        return result;
    };
}
