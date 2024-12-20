// Copyright (c) Microsoft. All rights reserved.

import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSupersub from 'remark-supersub';
import { IChatMessage } from '../../../libs/models/ChatMessage';
import * as utils from './../../utils/TextUtils';
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
    const content = utils.replaceMathBracketsWithDollarSigns(
        utils.replaceBracketStyleCitationsWithCaret(
            utils.replaceCitationLinksWithIndices(utils.formatChatTextContent(message.content), message),
        ),
    );

    return (
        <div className={classes.content}>
            <ReactMarkdown rehypePlugins={[rehypeMathjax]} remarkPlugins={[remarkGfm, remarkSupersub, remarkMath]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};
