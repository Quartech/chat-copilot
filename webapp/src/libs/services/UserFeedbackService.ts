import { IChatMessage } from '../models/ChatMessage';
import { IUserFeedbackFilterRequest } from '../models/UserFeedback';
import { BaseService } from './BaseService';

export class UserFeedbackService extends BaseService {
    public fetchFeedback = async (filter: IUserFeedbackFilterRequest, accessToken: string): Promise<IChatMessage[]> => {
        const result = await this.getResponseAsync<IChatMessage[]>(
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
