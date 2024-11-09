import { IUserFeedback, IUserFeedbackFilterRequest } from '../models/UserFeedback';
import { BaseService } from './BaseService';

export class UserFeedbackService extends BaseService {
    public fetchFeedback = async (filter: IUserFeedbackFilterRequest, accessToken: string): Promise<IUserFeedback> => {
        const result = await this.getResponseAsync<IUserFeedback>(
            {
                commandPath: 'userfeedback/search',
                method: 'POST',
                body: filter,
            },
            accessToken,
        );
        return result;
    };
}
