// Copyright (c) Microsoft. All rights reserved.
import { Plugin } from '../../redux/features/plugins/PluginsState';
import { IAsk } from '../semantic-kernel/model/Ask';
import { IAskResult } from '../semantic-kernel/model/AskResult';
import { BaseService } from './BaseService';

/**
 * A class for interactging with chat bot WITHOUT a particular chat.
 */
export class NoChatMessageService extends BaseService {
    /**
     * getBotResponseNoChat - Calling this with a valid ask object will query the chatbot through a POST request,
     * chat id and other chat paramters not required as this is simply a message and response
     * @param ask query for the chat bot
     * @param accessToken valid access token
     * @param enabledPlugins plugins, if any
     */
    public getBotResponseNoChat = async (
        ask: IAsk,
        accessToken: string,
        enabledPlugins?: Plugin[],
    ): Promise<IAskResult> => {
        const result = await this.getResponseAsync<IAskResult>(
            {
                commandPath: `chats/${'chatId'}/messages?silent=true`, // to be updated to a valid path when it is created.. removing chat id
                method: 'POST',
                body: ask,
            },
            accessToken,
            enabledPlugins,
        );
        return result;
    };
}
