import {
    makeStyles,
    SelectTabEventHandler,
    shorthands,
    Tab,
    TabList,
    TabValue,
    tokens,
} from '@fluentui/react-components';
import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { setAdminSelected, setIndexSelected, setUserFeedbackSelected } from '../../../redux/features/admin/adminSlice';
import { setSearchSelected } from '../../../redux/features/search/searchSlice';
import { Breakpoints } from '../../../styles';
import { SearchList } from '../../search/search-list/SearchList';
import { ChatList } from './ChatList';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexShrink: 0,
        width: '320px',
        backgroundColor: tokens.colorNeutralBackground4,
        flexDirection: 'column',
        ...shorthands.overflow('hidden'),
        ...Breakpoints.small({
            width: '64px',
        }),
    },
    innerTabs: {
        marginLeft: '1rem',
        marginRight: '1rem',
        marginTop: '2rem',
    },
});

export const ChatType: FC = () => {
    const classes = useClasses();
    const dispatch = useAppDispatch();
    const { conversations, selectedId } = useAppSelector((state: RootState) => state.conversations);
    const activeUserInfo = useAppSelector((state: RootState) => state.app.activeUserInfo);
    const [selectedTab, setSelectedTab] = React.useState<TabValue>('chat');
    const [selectedAdminSubTab, setSelectedAdminSubTab] = React.useState<TabValue>('specializations');
    const [hasAdmin, setHasAdmin] = useState(false);
    const onTabSelect: SelectTabEventHandler = (_event, data) => {
        setSelectedTab(data.value);
    };
    useEffect(() => {
        if (activeUserInfo) {
            setHasAdmin(activeUserInfo.hasAdmin);
        }
    }, [activeUserInfo]);

    useEffect(() => {
        if (selectedTab === 'search') {
            const selectedConversation = conversations[selectedId];
            if (selectedConversation.specializationId) {
                const chatSpecializationId = selectedConversation.specializationId;
                void dispatch(setSearchSelected({ selected: true, specializationId: chatSpecializationId }));
            } else {
                dispatch(setSearchSelected({ selected: true, specializationId: '' }));
            }
            dispatch(setAdminSelected(false));
            dispatch(setIndexSelected(false));
            dispatch(setUserFeedbackSelected(false));
        } else if (selectedTab === 'admin') {
            dispatch(setSearchSelected({ selected: false, specializationId: '' }));
            if (selectedAdminSubTab === 'specializations') {
                dispatch(setAdminSelected(true));
                dispatch(setIndexSelected(false));
                dispatch(setUserFeedbackSelected(false));
            } else if (selectedAdminSubTab === 'indexes') {
                dispatch(setAdminSelected(false));
                dispatch(setIndexSelected(true));
                dispatch(setUserFeedbackSelected(false));
            } else if (selectedAdminSubTab === 'userFeedback') {
                dispatch(setAdminSelected(false));
                dispatch(setIndexSelected(false));
                dispatch(setUserFeedbackSelected(true));
            }
        } else {
            dispatch(setSearchSelected({ selected: false, specializationId: '' }));
            dispatch(setAdminSelected(false));
            dispatch(setIndexSelected(false));
        }
    }, [selectedTab, selectedAdminSubTab, conversations, selectedId, dispatch]);

    return (
        <div className={classes.root}>
            <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                <Tab data-testid="chatTab" id="chat" value="chat" aria-label="Chat Tab" title="Chat Tab">
                    Chat
                </Tab>
                <Tab data-testid="searchTab" id="search" value="search" aria-label="Search Tab" title="Search Tab">
                    Search - Beta
                </Tab>
                <Tab
                    disabled={!hasAdmin}
                    data-testid="adminTab"
                    id="admin"
                    value="admin"
                    aria-label="admin Tab"
                    title="Admin Tab"
                >
                    Admin
                </Tab>
            </TabList>
            {selectedTab === 'chat' && <ChatList />}
            {selectedTab === 'search' && <SearchList />}
            {selectedTab === 'admin' && (
                <div className={classes.innerTabs}>
                    <TabList
                        vertical
                        selectedValue={selectedAdminSubTab}
                        onTabSelect={(_event, data) => {
                            setSelectedAdminSubTab(data.value);
                        }}
                    >
                        <Tab id="specializations" value={'specializations'}>
                            Specializations
                        </Tab>
                        <Tab id="indexes" value={'indexes'}>
                            Indexes
                        </Tab>
                        <Tab id="userFeedback" value={'userFeedback'}>
                            User Feedback
                        </Tab>
                    </TabList>
                </div>
            )}
        </div>
    );
};
