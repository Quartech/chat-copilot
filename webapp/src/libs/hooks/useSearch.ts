// Copyright (c) Microsoft. All rights reserved.

import { useMsal } from '@azure/msal-react';
import { getErrorDetails } from '../../components/utils/TextUtils';
import { useAppDispatch } from '../../redux/app/hooks';
import { addAlert } from '../../redux/features/app/appSlice';
import { setSearch } from '../../redux/features/search/searchSlice';
import { SearchResponse } from '../../redux/features/search/SearchState';
import { AuthHelper } from '../auth/AuthHelper';
import { AlertType } from '../models/AlertType';
import { ChatMessageType } from '../models/ChatMessage';
import { IAskSearch, IAskVariables } from '../semantic-kernel/model/Ask';
import { SearchService } from '../services/SearchService';

export interface GetResponseOptions {
    messageType: ChatMessageType;
    value: string;
    chatId: string;
    kernelArguments?: IAskVariables[];
    processPlan?: boolean;
}

export const useSearch = () => {
    const dispatch = useAppDispatch();
    const { instance, inProgress } = useMsal();
    const searchService = new SearchService();

    // We want to get every instance of a placeholder tag, plus a few tokens of context for display in the sidebar.
    const findPlaceholderWithContext = (text: string, contextWords = 4) => {
        const pattern = /<PLACEHOLDER_\d+>(.*?)<\/PLACEHOLDER_\d+>/gi;

        // Find all matches
        const matches = [];
        let match;

        while ((match = pattern.exec(text)) !== null) {
            // Calculate the context tokens before and after the match
            const startTokens = text.slice(0, match.index).trim().split(/\s+/);
            const endTokens = text
                .slice(match.index + match[0].length)
                .trim()
                .split(/\s+/);

            // Get the required number of context words
            const contextBefore = startTokens.slice(-contextWords).join(' ');
            const contextAfter = endTokens.slice(0, contextWords).join(' ');

            // Construct the full context string
            const fullMatch = `${contextBefore} <b>${match[0]}</b> ${contextAfter}`.trim();
            matches.push(fullMatch);
        }

        return matches;
    };

    const replaceMarksWithPlaceholders = (inputString: string, startingIncrement = 0) => {
        let count = startingIncrement;

        // Regex to match <mark>anytextthere</mark>
        const regex = /<mark>(.*?)<\/mark>/g;

        // Replace function that increments the count and keeps the inner text
        // So for every <mark></mark>, we instead get <PLACEHOLDER_1></PLACEHOLDER_1>, <PLACEHOLDER_2></PLACEHOLDER_2>, etc...
        const result = inputString.replace(regex, (_match, p1) => {
            count++;
            return `<PLACEHOLDER_${count}>${p1}</PLACEHOLDER_${count}>`;
        });

        return result;
    };

    const removePlaceholders = (inputString: string) => {
        // Regex to match <PLACEHOLDER_X>...<PLACEHOLDER_X>
        const regex = /<PLACEHOLDER_\d+>(.*?)<\/PLACEHOLDER_\d+>/g;

        // Replace function that returns the inner content
        const result = inputString.replace(regex, (_match, p1: string) => {
            return p1; // Return the inner text
        });

        return result;
    };

    const getResponse = async (specializationId: string, value: string) => {
        const searchAsk: IAskSearch = {
            specializationId,
            search: value,
        };
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await searchService
                .getSearchResponseAsync(searchAsk, await AuthHelper.getSKaaSAccessToken(instance, inProgress))
                .then((searchResult: SearchResponse) => {
                    const searchResultTransform = searchResult.value.map((value) => {
                        const matches = value.matches
                            .sort((a, b) => (a.metadata.page_number ?? 0) - (b.metadata.page_number ?? 0))
                            .map((match) => match.content)
                            .flat(2);
                        const placeHolders = replaceMarksWithPlaceholders(matches.join('<br><br>'));
                        return {
                            ...value,
                            placeholderMarkedText: placeHolders,
                            entryPointList: findPlaceholderWithContext(placeHolders.replace(/<br\s*\/?>/gi, '')).map(
                                (plc) => removePlaceholders(plc),
                            ),
                        };
                    });
                    dispatch(setSearch({ count: searchResult.count, value: searchResultTransform }));
                });
        } catch (e: any) {
            const errorMessage = `Unable to search. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
        }
    };
    return {
        getResponse,
    };
};
