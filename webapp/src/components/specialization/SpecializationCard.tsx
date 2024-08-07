import * as React from 'react';
import { makeStyles, Button, Caption1, tokens, Text, Tooltip } from '@fluentui/react-components';
import { MoreHorizontal20Regular } from '@fluentui/react-icons';
import { Card, CardHeader, CardPreview } from '@fluentui/react-components';
import { ISpecialization } from '../../libs/models/Specialization';
import { useChat } from '../../libs/hooks';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import {
    editConversationSpecialization,
    editConversationSystemDescription,
} from '../../redux/features/conversations/conversationsSlice';

const useStyles = makeStyles({
    main: {
        display: 'flex',
        flexWrap: 'wrap',
    },

    card: {
        width: '350px',
        maxWidth: '100%',
        height: '300px',
    },

    root: {
        padding: tokens.spacingHorizontalXS,
    },

    caption: {
        color: tokens.colorNeutralForeground3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    smallRadius: { borderRadius: tokens.borderRadiusSmall },

    grayBackground: {
        backgroundColor: tokens.colorNeutralBackground3,
    },

    logoBadge: {
        padding: '5px',
        borderRadius: tokens.borderRadiusSmall,
        backgroundColor: '#FFF',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
    },

    showTooltip: {
        display: 'show',
    },

    hideTooltip: {
        display: 'none',
    },
});

interface SpecializationItemProps {
    /* eslint-disable 
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-member-access,
        @typescript-eslint/no-unsafe-call 
    */
    specialization: ISpecialization;
}

export const SpecializationCard: React.FC<SpecializationItemProps> = ({ specialization }) => {
    const styles = useStyles();
    const chat = useChat();
    const cardDivId = React.useId();
    const cardId = React.useId();
    const specializationId = React.useId();
    const dispatch = useAppDispatch();
    const { selectedId } = useAppSelector((state: RootState) => state.conversations);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const onAddChat = () => {
        void chat.editChatSpecialization(selectedId, specialization.key).finally(() => {
            dispatch(editConversationSpecialization({ id: selectedId, newSpecializationKey: specialization.key }));
            dispatch(
                editConversationSystemDescription({
                    id: selectedId,
                    newSystemDescription: specialization.roleInformation,
                }),
            );
        });
    };

    const truncate = (str: string) => {
        return str.length > 250 ? str.substring(0, 250) : str;
    };

    const getimagefilepath = (str: any): string => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return str;
    };

    return (
        <div className={styles.root} key={cardDivId}>
            <Card className={styles.card} data-testid="addNewBotMenuItem" onClick={onAddChat} key={cardId}>
                <CardPreview className={styles.grayBackground}>
                    <img
                        className={styles.smallRadius}
                        src={getimagefilepath(specialization.imageFilepath)}
                        alt="Presentation Preview"
                    />
                </CardPreview>

                <CardHeader
                    header={<Text weight="semibold"> {specialization.name}</Text>}
                    description={<Caption1 className={styles.caption}>{truncate(specialization.description)}</Caption1>}
                    action={
                        <div
                            className={
                                specialization.description.length > 250 ? styles.showTooltip : styles.hideTooltip
                            }
                            key={specializationId}
                        >
                            <Tooltip content={specialization.description} relationship="label">
                                <Button
                                    appearance="transparent"
                                    icon={<MoreHorizontal20Regular />}
                                    aria-label="More actions"
                                ></Button>
                            </Tooltip>
                        </div>
                    }
                ></CardHeader>
            </Card>
        </div>
    );
};
