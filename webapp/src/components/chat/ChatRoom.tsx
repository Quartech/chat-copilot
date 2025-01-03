// Copyright (c) Microsoft. All rights reserved.

import { makeStyles, shorthands, Spinner, Text, tokens } from '@fluentui/react-components';
import React, { useMemo, useState } from 'react';
import { SpecializationCardList } from '../../components/specialization/SpecializationCardList';
import { getFriendlyChatName, GetResponseOptions, useChat } from '../../libs/hooks/useChat';
import { ChatMessageType } from '../../libs/models/ChatMessage';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';
import { FeatureKeys, Features } from '../../redux/features/app/AppState';
import { SharedStyles } from '../../styles';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './chat-history/ChatHistory';
import { ChatSuggestionList } from './suggestions/ChatSuggestionList';

const useClasses = makeStyles({
    root: {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
    },
    scroll: {
        ...shorthands.margin(tokens.spacingVerticalXS),
        ...SharedStyles.scroll,
    },
    history: {
        ...shorthands.padding(tokens.spacingVerticalM),
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        display: 'flex',
        justifyContent: 'center',
    },
    spinner: {
        ...shorthands.padding(tokens.spacingVerticalM),
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        display: 'flex',
        flexDirection: 'row',
        height: '24px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
    },
    input: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingVerticalNone),
    },
    suggestions: {
        display: 'flex',
        flexDirection: 'row',
    },
    carouselroot: {
        display: 'flex',
        justifyContent: 'center',
    },
    carouselwrapper: {
        paddingTop: tokens.spacingHorizontalXXXL,
        display: 'block',
        lineHeight: tokens.lineHeightBase100,
        justifyContent: 'center',
        position: 'relative',
    },
});

export const ChatRoom: React.FC = () => {
    const classes = useClasses();
    const chat = useChat();

    const { conversations, selectedId } = useAppSelector((state: RootState) => state.conversations);
    const messages = conversations[selectedId].messages;

    const scrollViewTargetRef = React.useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };
    const { specializations } = useAppSelector((state: RootState) => state.admin);
    const { activeUserInfo } = useAppSelector((state: RootState) => state.app);

    // Memoize the filtered specializations based on the user's group memberships
    const filteredSpecializations = useMemo(() => {
        const filtered = specializations.filter((_specialization) => {
            const hasMembership =
                activeUserInfo?.groups.some((val) => _specialization.groupMemberships.includes(val)) ?? false;

            // Check if the user has membership to the specialization group and the specialization is active
            const canViewSpecialization =
                ((hasMembership || _specialization.groupMemberships.length === 0) && _specialization.isActive) ||
                _specialization.id == 'general';

            return canViewSpecialization ? _specialization : undefined;
        });
        return [...filtered].sort((a, b) => a.order - b.order);
    }, [activeUserInfo?.groups, specializations]);

    const [showSpecialization, setShowSpecialization] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    React.useEffect(() => {
        if (!shouldAutoScroll) return;
        scrollViewTargetRef.current?.scrollTo(0, scrollViewTargetRef.current.scrollHeight);
    }, [messages, shouldAutoScroll]);

    React.useEffect(() => {
        const onScroll = () => {
            if (!scrollViewTargetRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = scrollViewTargetRef.current;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
            setShouldAutoScroll(isAtBottom);
        };

        if (!scrollViewTargetRef.current) return;

        const currentScrollViewTarget = scrollViewTargetRef.current;

        currentScrollViewTarget.addEventListener('scroll', onScroll);
        return () => {
            currentScrollViewTarget.removeEventListener('scroll', onScroll);
        };
    }, []);

    React.useEffect(() => {
        if (Object.keys(messages).length <= 1 && !conversations[selectedId].loadingMessages) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }

        if (Object.keys(messages).length <= 1 && conversations[selectedId].specializationId === '') {
            setShowSpecialization(true);
        } else {
            setShowSpecialization(false);
        }
    }, [messages, selectedId, conversations, showSpecialization]);

    React.useEffect(() => {
        const conversation = conversations[selectedId];
        const title = getFriendlyChatName(conversation);

        if (title != 'New Chat' && conversation.title != title && conversation.createdOnServer) {
            //eslint-disable-next-line @typescript-eslint/no-floating-promises
            chat.editChat(selectedId, title, conversation.systemDescription, conversation.memoryBalance);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    const handleSubmit = async (options: GetResponseOptions) => {
        await chat.getResponse(options);
        setShouldAutoScroll(true);
    };

    const suggestionClick = (message: string) => {
        const messageBody: GetResponseOptions = {
            messageType: ChatMessageType.Message,
            value: message,
            chatId: selectedId,
        };
        void chat.getResponse(messageBody);
        setShowSuggestions(false);
    };

    if (conversations[selectedId].hidden) {
        return (
            <div className={classes.root}>
                <div className={classes.scroll}>
                    <div className={classes.history}>
                        <h3>
                            This conversation is not visible in the app because{' '}
                            {Features[FeatureKeys.MultiUserChat].label} is disabled. Please enable the feature in the
                            settings to view the conversation, select a different one, or create a new conversation.
                        </h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.root} onDragEnter={onDragEnter} onDragOver={onDragEnter} onDragLeave={onDragLeave}>
            {showSpecialization && (
                <div className={classes.carouselroot}>
                    <div className={classes.carouselwrapper}>
                        <SpecializationCardList specializations={filteredSpecializations} />
                    </div>
                </div>
            )}
            {!showSpecialization && (
                <div ref={scrollViewTargetRef} className={classes.scroll}>
                    <div className={classes.history}>
                        <ChatHistory messages={messages} />
                    </div>
                </div>
            )}
            {conversations[selectedId].loadingMessages && (
                <div className={classes.spinner}>
                    <Spinner />
                    <Text>Retrieving messages...</Text>
                </div>
            )}
            {showSuggestions && (
                <div className={classes.suggestions}>
                    <ChatSuggestionList onClickSuggestion={suggestionClick} />
                </div>
            )}
            <div className={classes.input}>
                <ChatInput
                    disabled={filteredSpecializations.length < 1}
                    isDraggingOver={isDraggingOver}
                    onDragLeave={onDragLeave}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
};
