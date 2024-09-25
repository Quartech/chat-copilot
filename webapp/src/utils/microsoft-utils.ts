import { Client, ResponseType } from '@microsoft/microsoft-graph-client';
import { AccountInfo, InteractionRequiredAuthError, IPublicClientApplication, PopupRequest } from '@azure/msal-browser';

// A type wrapper for base64 encoded strings
type Base64String = string;

/**
 * Converts a Blob to a base64 string.
 *
 * @param {Blob} blob - The Blob to convert.
 * @returns {Promise<Base64String>} The base64 encoded string.
 */
const _blobToBase64 = async (blob: Blob): Promise<Base64String> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (_) => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
    });
};

/**
 * Gets an authenticated client.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @returns {Client} The authenticated client.
 */
const _getAuthenticatedClient = (accessToken: string): Client => {
    return Client.init({
        authProvider: (done: (any: any, accessToken: string) => void) => {
            done(null, accessToken);
        },
    });
};

/**
 * Gets the user image from Microsoft.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @returns {Promise<Base64String | undefined>} The base64 encoded image.
 */
export const getMicrosoftUserImage = async (accessToken: string): Promise<Base64String | undefined> => {
    try {
        const client = _getAuthenticatedClient(accessToken);

        const response = (await client.api('/me/photo/$value').responseType(ResponseType.RAW).get()) as Response;

        const blob = await response.blob();

        return await _blobToBase64(blob);
    } catch (e) {
        return;
    }
};

export const getMicrosoftAuth = async (
    instance: IPublicClientApplication,
    account: AccountInfo | null,
    tokenRequest: PopupRequest,
) => {
    if (!account) {
        return;
    }

    try {
        const authAccount = await instance.acquireTokenSilent({
            ...tokenRequest,
            account: account,
        });

        return authAccount;
    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            return instance.acquireTokenPopup(tokenRequest);
        }
        return;
    }
};
