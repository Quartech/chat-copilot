import { useMsal } from '@azure/msal-react';
import React, { useEffect, useRef, useState } from 'react';
import { AuthHelper } from '../../../libs/auth/AuthHelper';
import { IUserFeedback, IUserFeedbackFilterRequest } from '../../../libs/models/UserFeedback';
import { UserFeedbackService } from '../../../libs/services/UserFeedbackService';
/**
 * UserFeedback Manager component.
 *
 * @returns {*}
 */
export const UserFeedbackManager: React.FC = () => {
    const { instance, inProgress } = useMsal();
    const userFeedbackService = new UserFeedbackService();

    const [userFeedbackData, setUserFeedbackData] = useState<IUserFeedback | null>(null);

    const initalFetch = useRef(false);

    const filter: IUserFeedbackFilterRequest = {};

    const fetchData = async () => {
        try {
            const data = await userFeedbackService.fetchFeedback(
                filter,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
            setUserFeedbackData(data);
        } catch (err) {}
    };

    useEffect(() => {
        if (!initalFetch.current) {
            initalFetch.current = true;
            void fetchData();
        }
    });

    return <div>{userFeedbackData?.message}</div>;
};
