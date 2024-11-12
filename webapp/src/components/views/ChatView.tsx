import { makeStyles, shorthands } from '@fluentui/react-components';
import { FC } from 'react';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { SpecializationIndexWindow } from '../admin/specialization-index/SpecializationIndexWindow';
import { AdminWindow } from '../admin/specialization/SpecializationWindow';
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
            {isAdminSelected && <AdminWindow />}
            {selected && <SearchWindow />}
            {selectedId !== '' && !selected && !isAdminSelected && !isIndexSelected && <ChatWindow />}
            {isIndexSelected && <SpecializationIndexWindow />}
        </div>
    );
};
