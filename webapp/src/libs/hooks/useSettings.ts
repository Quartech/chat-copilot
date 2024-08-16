import { useMsal } from '@azure/msal-react';
import { useAppDispatch } from '../../redux/app/hooks';
import { addAlert } from '../../redux/features/app/appSlice';

import { getErrorDetails } from '../../components/utils/TextUtils';
import { AuthHelper } from '../auth/AuthHelper';
import { AlertType } from '../models/AlertType';
import { IUserSettings } from '../models/UserSettings';
import { SettingService } from '../services/SettingsService';

export const useSettings = () => {
    const dispatch = useAppDispatch();
    const { instance, inProgress } = useMsal();
    const specializationService = new SettingService();

    const getSettings = async () => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            return specializationService.getUserSettingsAsync(accessToken);
        } catch (e: any) {
            const errorMessage = `Unable to load user settings. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
            return undefined;
        }
    };

    const updateSetting = async (setting: keyof IUserSettings, enabled: boolean) => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            return specializationService.saveUserSettings(accessToken, {
                setting,
                enabled,
            });
        } catch (e: any) {
            const errorMessage = `Unable to load user settings. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
            return undefined;
        }
    };

    return {
        getSettings,
        updateSetting,
    };
};
