import { Body1, tokens } from '@fluentui/react-components';
import { IChatMessage } from '../../libs/models/ChatMessage';

/*
 * Function to check if date is today.
 */
export function isToday(date: Date) {
    return new Date(date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
}

/*
 * Function to render the date and/or time of a message.
 */
export function timestampToDateString(timestamp: number, alwaysShowTime = false) {
    const date = new Date(timestamp);
    const dateString = date.toLocaleDateString([], {
        month: 'numeric',
        day: 'numeric',
    });
    const timeString = date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });

    return date.toDateString() !== new Date().toDateString()
        ? alwaysShowTime
            ? dateString + ' ' + timeString // if the date is not today and we are always showing the time, show the date and time
            : dateString // if the date is not today and we are not always showing the time, only show the date
        : timeString; // if the date is today, only show the time
}

/*
 * Function to create a command link
 */
export function createCommandLink(command: string) {
    const escapedCommand = encodeURIComponent(command);
    const createCommandLink = `<span style="text-decoration: underline; cursor: pointer" data-command="${escapedCommand}" onclick="(function(){ let chatInput = document.getElementById('chat-input'); chatInput.value = decodeURIComponent('${escapedCommand}'); chatInput.focus(); return false; })();return false;">${command}</span>`;
    return createCommandLink;
}

/*
 * Function to format chat text content to remove any html tags from it.
 */
export function formatChatTextContent(messageContent: string) {
    const contentAsString = messageContent
        .trim()
        .replace(/^sk:\/\/.*$/gm, (match: string) => createCommandLink(match))
        .replace(/^!sk:.*$/gm, (match: string) => createCommandLink(match));
    return contentAsString;
}

/*
 * Formats text containing `\n` or `\r` into paragraphs.
 */
export function formatParagraphTextContent(messageContent = '') {
    messageContent = messageContent.replaceAll('\r\n', '\n\r');

    return (
        <Body1>
            {messageContent.split('\n').map((paragraph, idx) => (
                <p
                    key={`paragraph-${idx}`}
                    style={
                        paragraph.includes('\r')
                            ? {
                                  display: 'flex',
                                  marginLeft: tokens.spacingHorizontalL,
                              }
                            : {
                                  overflowWrap: 'anywhere',
                              }
                    }
                >
                    {paragraph}
                </p>
            ))}
        </Body1>
    );
}

/*
 * Function to replace citation links with indices matching the citation list.
 */
export function replaceCitationLinksWithIndices(formattedMessageContent: string, message: IChatMessage) {
    const citations = message.citations;
    if (citations) {
        citations.forEach((citation, index) => {
            const citationLink = citation.link;
            formattedMessageContent = formattedMessageContent.replaceAll(citationLink, (index + 1).toString());
        });
    }

    return formattedMessageContent;
}

export function replaceBracketStyleCitationsWithCaret(formattedMessageContent: string) {
    const docX = /\[(doc\d+|chatmemory[^\]]*)\](,)?/gm;
    const citationIndexMap: Record<string, number> = {};
    return formattedMessageContent.replace(docX, (_match, p1: string) => {
        if (!citationIndexMap[p1]) {
            const value = Object.values(citationIndexMap).length + 1;
            citationIndexMap[p1] = value;
        }
        return `^${citationIndexMap[p1]}^`;
    });
}

/**
 * Will first escape all dollar signs present in the original string.
 * Then, replace every occurrence of block style MathJax delimiters \[ and \] with $$ and $$
 * Then, replace every occurrence of inline style MathJax delimiters \( and \) with $ and $.
 */
export function replaceMathBracketsWithDollarSigns(formattedMessageContent: string) {
    const escapeDollars = /\$/gm;
    const inlineDollar = /\\\((.*?)\\\)/gm;
    const doubleDollars = /\\\[(.*?)\\\]/gms;
    const ret = formattedMessageContent
        .replace(escapeDollars, '\\$')
        .replace(inlineDollar, '$$$1$$')
        .replace(doubleDollars, '$$$$$1$$$$');
    return ret;
}

/**
 * Gets message of error
 */
export function getErrorDetails(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}
