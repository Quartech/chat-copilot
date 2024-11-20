import { makeStyles, shorthands } from '@fluentui/react-components';
import { FC } from 'react';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { SpecializationIndexWindow } from '../admin/specialization-index/SpecializationIndexWindow';
import { SpecializationIndexList } from '../admin/specialization-index/index-list/SpecializationIndexList';
import { SpecializationWindow } from '../admin/specialization/SpecializationWindow';
import { SpecializationList } from '../admin/specialization/specialization-list/SpecializationList';
import { UserFeedbackWindow } from '../admin/user-feedback/UserFeedbackWindow';
import { ChatWindow } from '../chat/ChatWindow';
import { ChatType } from '../chat/chat-list/ChatType';
import { SearchWindow } from '../search/SearchWindow';

const useClasses = makeStyles({
    container: {
        ...shorthands.overflow('hidden'),
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'start',
        height: '100%',
    },
});

export const ChatView: FC = () => {
    const classes = useClasses();
    const { selectedId } = useAppSelector((state: RootState) => state.conversations);
    const { selected } = useAppSelector((state: RootState) => state.search);
    const { isAdminSelected, isIndexSelected, isUserFeedbackSelected } = useAppSelector(
        (state: RootState) => state.admin,
    );

    return (
        <div className={classes.container}>
            <ChatType />
            {isAdminSelected && (
                <>
                    <SpecializationList />
                    <SpecializationWindow />
                </>
            )}
            {selected && <SearchWindow />}
            {selectedId !== '' && !selected && !isAdminSelected && !isIndexSelected && !isUserFeedbackSelected && (
                <ChatWindow />
            )}
            {isIndexSelected && (
                <>
                    <SpecializationIndexList />
                    <SpecializationIndexWindow />
                </>
            )}
            {isUserFeedbackSelected && (
                <>
                    <UserFeedbackWindow />
                </>
            )}
        </div>
    );
};
