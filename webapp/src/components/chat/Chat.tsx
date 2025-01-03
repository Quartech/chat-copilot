import React from 'react';
import { AuthHelper } from '../..//libs/auth/AuthHelper';
import { AppState, useClasses } from '../../App';
import Header from '../header/Header';
import Alerts from '../shared/Alerts';
import LoadingSpinner from '../shared/LoadingSpinner';
import { BackendProbe, ChatView, Error, Loading, Unauth } from '../views';
import { useAppSelector } from '../../redux/app/hooks';
import { ReloadModal } from '../shared/ReloadModal';

const Chat = ({
    classes,
    appState,
    setAppState,
}: {
    classes: ReturnType<typeof useClasses>;
    appState: AppState;
    setAppState: (state: AppState) => void;
}) => {
    const { activeUserInfo } = useAppSelector((state) => state.app);
    const hasAccess = React.useMemo(
        () => !!activeUserInfo && activeUserInfo.groups.includes(window._env_.SECURITY_GROUP_ID),
        [activeUserInfo],
    );
    const onBackendFound = React.useCallback(() => {
        setAppState(
            AuthHelper.isAuthAAD()
                ? // if AAD is enabled, we need to set the active account before loading chats
                  AppState.SettingUserInfo
                : // otherwise, we can load chats immediately
                  AppState.LoadingChats,
        );
    }, [setAppState]);

    return (
        <div className={classes.container}>
            <Alerts />
            <ReloadModal />
            <LoadingSpinner />
            <Header appState={appState} setAppState={setAppState} showPluginsAndSettings={true} />
            {appState === AppState.ProbeForBackend && <BackendProbe onBackendFound={onBackendFound} />}
            <>
                {hasAccess ? (
                    <>
                        {appState === AppState.SettingUserInfo && (
                            <Loading text={'Hang tight while we fetch your information...'} />
                        )}
                        {appState === AppState.ErrorLoadingUserInfo && (
                            <Error text={'Unable to load user info. Please try signing out and signing back in.'} />
                        )}
                        {appState === AppState.ErrorLoadingChats && (
                            <Error text={'Unable to load chats. Please try refreshing the page.'} />
                        )}
                        {appState === AppState.LoadingChats && <Loading text="Loading chats..." />}
                        {appState === AppState.Chat && <ChatView />}
                    </>
                ) : (
                    // Do not render unauth if the app is probing for backend, signing out, or setting the user info as these states need to be completed in order to determine if it should be displayed.
                    appState !== AppState.ProbeForBackend &&
                    appState !== AppState.SigningOut &&
                    appState !== AppState.SettingUserInfo && <Unauth />
                )}
            </>
        </div>
    );
};
export default Chat;
