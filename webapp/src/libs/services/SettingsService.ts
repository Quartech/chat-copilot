import { IUserSettings, UserSettingsResponse } from '../models/UserSettings';
import { BaseService } from './BaseService';

export class SettingService extends BaseService {
    public getUserSettingsAsync = async (accessToken: string): Promise<UserSettingsResponse> => {
        return await this.getResponseAsync<UserSettingsResponse>(
            {
                commandPath: 'user-settings',
                method: 'GET',
            },
            accessToken,
        );
    };

    public saveUserSettings = async (accessToken: string, body: any): Promise<IUserSettings> => {
        return await this.getResponseAsync<IUserSettings>(
            {
                commandPath: 'user-settings',
                method: 'POST',
                body,
            },
            accessToken,
        );
    };
}
