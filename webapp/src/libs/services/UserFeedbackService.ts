import { IUserFeedbackFilterRequest, IUserFeedbackResult } from '../models/UserFeedback';
import { BaseService } from './BaseService';

export class UserFeedbackService extends BaseService {
    public fetchFeedback = async (
        filter: IUserFeedbackFilterRequest,
        accessToken: string,
    ): Promise<IUserFeedbackResult> => {
        const result = await this.getResponseAsync<IUserFeedbackResult>(
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
