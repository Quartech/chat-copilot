// Copyright (c) Microsoft. All rights reserved.

import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import { IChatMessage } from '../../../libs/models/ChatMessage';
import * as utils from './../../utils/TextUtils';
import MarkdownWithLatex from './../../utils/MarkdownWithLatex';
const useClasses = makeStyles({
    content: {
        wordBreak: 'break-word',
    },
});

interface ChatHistoryTextContentProps {
    message: IChatMessage;
}

export const ChatHistoryTextContent: React.FC<ChatHistoryTextContentProps> = ({ message }) => {
    const classes = useClasses();
    const content = utils.replaceCitationLinksWithIndices(utils.formatChatTextContent(message.content), message);
    return (
        <div className={classes.content}>
            <MarkdownWithLatex markdownText={content} />
        </div>
    );
};
