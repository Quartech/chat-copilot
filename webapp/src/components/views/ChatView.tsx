import { makeStyles, shorthands } from '@fluentui/react-components';
import { FC } from 'react';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { AdminWindow } from '../admin/shared/AdminWindow';
import { SpecializationIndexList } from '../admin/specialization-index/SpecializationIndexList';
import { SpecializationIndexManager } from '../admin/specialization-index/SpecializationIndexManager';
import { SpecializationList } from '../admin/specialization/SpecializationList';
import { SpecializationManager } from '../admin/specialization/SpecializationManager';
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
    const { isAdminSelected, isIndexSelected } = useAppSelector((state: RootState) => state.admin);

    return (
        <div className={classes.container}>
            <ChatType />
            {isAdminSelected && (
                <>
                    <SpecializationList />
                    <AdminWindow>
                        <SpecializationManager />
                    </AdminWindow>
                </>
            )}
            {selected && <SearchWindow />}
            {selectedId !== '' && !selected && !isAdminSelected && !isIndexSelected && <ChatWindow />}
            {isIndexSelected && (
                <>
                    <SpecializationIndexList />
                    <AdminWindow>
                        <SpecializationIndexManager />
                    </AdminWindow>
                </>
            )}
        </div>
    );
};
