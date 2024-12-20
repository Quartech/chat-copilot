import { makeStyles, shorthands } from '@fluentui/react-components';
import { FC } from 'react';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { AdminScreen } from '../../redux/features/admin/AdminState';
import { OpenAIList } from '../admin/open-ai-deployments/OpenAIList';
import { OpenAIManager } from '../admin/open-ai-deployments/OpenAIManager';
import { AdminWindow } from '../admin/shared/AdminWindow';
import { SpecializationIndexList } from '../admin/specialization-index/SpecializationIndexList';
import { SpecializationIndexManager } from '../admin/specialization-index/SpecializationIndexManager';
import { SpecializationList } from '../admin/specialization/SpecializationList';
import { SpecializationManager } from '../admin/specialization/SpecializationManager';
import { UserFeedbackManager } from '../admin/user-feedback/UserFeedbackManager';
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
    const { selectedAdminScreen } = useAppSelector((state: RootState) => state.admin);

    return (
        <div className={classes.container}>
            <ChatType />
            {selectedAdminScreen === AdminScreen.SPECIALIZATION && (
                <>
                    <SpecializationList />
                    <AdminWindow>
                        <SpecializationManager />
                    </AdminWindow>
                </>
            )}
            {selected && <SearchWindow />}
            {selectedId !== '' && !selected && selectedAdminScreen === AdminScreen.NONE && <ChatWindow />}
            {selectedAdminScreen === AdminScreen.INDEX && (
                <>
                    <SpecializationIndexList />
                    <AdminWindow>
                        <SpecializationIndexManager />
                    </AdminWindow>
                </>
            )}
            {selectedAdminScreen === AdminScreen.FEEDBACK && (
                <>
                    <AdminWindow>
                        <UserFeedbackManager />
                    </AdminWindow>
                </>
            )}
            {selectedAdminScreen === AdminScreen.OPENAIDEPLOYMENT && (
                <>
                    <OpenAIList />
                    <AdminWindow>
                        <OpenAIManager />
                    </AdminWindow>
                </>
            )}
        </div>
    );
};
