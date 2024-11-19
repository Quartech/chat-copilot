import { useMsal } from '@azure/msal-react';
import { Button, Tooltip, makeStyles } from '@fluentui/react-components';
import {
    ThumbDislike20Filled,
    ThumbDislike20Regular,
    ThumbLike20Filled,
    ThumbLike20Regular,
} from '@fluentui/react-icons';
import { useCallback } from 'react';
import { AuthHelper } from '../../../libs/auth/AuthHelper';
import { UserFeedback } from '../../../libs/models/ChatMessage';
import { ChatService } from '../../../libs/services/ChatService';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { updateMessageProperty } from '../../../redux/features/conversations/conversationsSlice';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
});

interface IUserFeedbackProps {
    messageId: string;
    wasHelpful?: string;
}

export const UserFeedbackActions: React.FC<IUserFeedbackProps> = ({
    messageId,
    wasHelpful,
}: IUserFeedbackProps) => {
    const classes = useClasses();

    const { instance, inProgress } = useMsal();
    const dispatch = useAppDispatch();
    const { selectedId } = useAppSelector((state: RootState) => state.conversations);

    const onUserFeedbackProvided = useCallback(
        async (feedback: UserFeedback) => {
            const chatService = new ChatService();
            const token = await AuthHelper.getSKaaSAccessToken(instance, inProgress);

            // Send feedback and update Redux state
            try {
                const isPositive =
                    feedback === UserFeedback.Positive
                        ? true
                        : feedback === UserFeedback.Negative
                        ? false
                        : null;

                await chatService.rateMessageAync(selectedId, messageId, isPositive, token);

                dispatch(
                    updateMessageProperty({
                        chatId: selectedId,
                        messageIdOrIndex: messageId,
                        property: 'userFeedback',
                        value: feedback,
                        frontLoad: true,
                    }),
                );
            } catch (e) {
                console.error(e);
            }
        },
        [instance, inProgress, selectedId, messageId, dispatch],
    );

    // Handlers for Like and Dislike buttons
    const handleLikeClick = () => {
        let newFeedback: UserFeedback;

        if (wasHelpful === UserFeedback.Positive) {
            // If already 'like', deselect it (set to neutral or null)
            newFeedback = UserFeedback.Neutral;
        } else {
            // Otherwise, set 'like' (positive feedback)
            newFeedback = UserFeedback.Positive;
        }

        void onUserFeedbackProvided(newFeedback);
    };

    const handleDislikeClick = () => {
        let newFeedback: UserFeedback;

        if (wasHelpful === UserFeedback.Negative) {
            // If already 'dislike', deselect it (set to neutral or null)
            newFeedback = UserFeedback.Neutral;
        } else {
            // Otherwise, set 'dislike' (negative feedback)
            newFeedback = UserFeedback.Negative;
        }

        void onUserFeedbackProvided(newFeedback);
    };

    return (
        <div className={classes.root}>
            <Tooltip content={'Like'} relationship="label">
                <Button
                    icon={wasHelpful === UserFeedback.Positive ? <ThumbLike20Filled /> : <ThumbLike20Regular />}
                    appearance="transparent"
                    aria-label="Like"
                    onClick={handleLikeClick}
                />
            </Tooltip>
            <Tooltip content={'Dislike'} relationship="label">
                <Button
                    icon={wasHelpful === UserFeedback.Negative ? <ThumbDislike20Filled /> : <ThumbDislike20Regular />}
                    appearance="transparent"
                    aria-label="Dislike"
                    onClick={handleDislikeClick}
                />
            </Tooltip>
        </div>
    );
};
