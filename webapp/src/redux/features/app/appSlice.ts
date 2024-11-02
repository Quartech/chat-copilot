// Copyright (c) Microsoft. All rights reserved.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Constants } from '../../../Constants';
import { ServiceInfo } from '../../../libs/models/ServiceInfo';
import { TokenUsage, TokenUsageFunctionNameMap } from '../../../libs/models/TokenUsage';
import { getUUID } from '../../../libs/utils/HelperMethods';
import { ActiveUserInfo, Alert, AppState, Dialog, FeatureKeys, initialState } from './AppState';
/**
 * Modified to support specialization.
 */
export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setMaintenance: (state: AppState, action: PayloadAction<boolean>) => {
            state.isMaintenance = action.payload;
        },
        setAlerts: (state: AppState, action: PayloadAction<Alert[]>) => {
            state.alerts = action.payload;
        },
        addAlert: (state: AppState, action: PayloadAction<Alert>) => {
            const isConnectionAlert =
                action.payload.id === Constants.app.CONNECTION_ALERT_ID ||
                isServerConnectionError(action.payload.message);

            if (isConnectionAlert) {
                updateConnectionStatus(state, action.payload);
            } else {
                const alert = {
                    ...action.payload,
                    id: getUUID(),
                };
                addNewAlert(state.alerts, alert);
            }
        },
        removeAlert: (state: AppState, action: PayloadAction<string | undefined>) => {
            const index = state.alerts.findIndex((alert) => alert.id === action.payload);
            if (index !== -1) {
                state.alerts.splice(index, 1);
            }
        },
        addDialog: (state: AppState, action: PayloadAction<Dialog>) => {
            state.dialog = action.payload;
        },
        removeDialog: (state: AppState) => {
            state.dialog = undefined;
        },
        updateActiveUserInfo: (state: AppState, action: PayloadAction<Partial<ActiveUserInfo>>) => {
            state.activeUserInfo = Object.assign({}, state.activeUserInfo, action.payload);
        },
        updateTokenUsage: (state: AppState, action: PayloadAction<TokenUsage>) => {
            Object.keys(TokenUsageFunctionNameMap).forEach((key) => {
                action.payload[key] = getTotalTokenUsage(state.tokenUsage[key], action.payload[key]);
            });
            state.tokenUsage = action.payload;
        },
        // This sets the feature flag based on end user input
        toggleFeatureFlag: (state: AppState, action: PayloadAction<FeatureKeys>) => {
            const feature = state.features[action.payload];
            state.features = {
                ...state.features,
                [action.payload]: {
                    ...feature,
                    enabled: !feature.enabled,
                },
            };
        },
        // This sets the feature flag based on end user input
        setFeatureFlag: (state: AppState, action: PayloadAction<{ key: FeatureKeys; enabled: boolean }>) => {
            const feature = state.features[action.payload.key];
            state.features = {
                ...state.features,
                [action.payload.key]: {
                    ...feature,
                    enabled: action.payload.enabled,
                },
            };
        },
        // This controls feature availability based on the state of backend
        toggleFeatureState: (
            state: AppState,
            action: PayloadAction<{
                feature: FeatureKeys;
                deactivate: boolean;
                enable: boolean;
            }>,
        ) => {
            const feature = state.features[action.payload.feature];
            state.features = {
                ...state.features,
                [action.payload.feature]: {
                    ...feature,
                    enabled: action.payload.deactivate ? false : action.payload.enable,
                    inactive: action.payload.deactivate,
                },
            };
        },
        setServiceInfo: (state: AppState, action: PayloadAction<ServiceInfo>) => {
            state.serviceInfo = action.payload;
        },
        setAuthConfig: (state: AppState, action: PayloadAction<AppState['authConfig']>) => {
            state.authConfig = action.payload;
        },
        showSpinner: (state: AppState) => {
            state.isLoading = true;
        },
        hideSpinner: (state: AppState) => {
            state.isLoading = false;
        },
    },
});

export const {
    addAlert,
    addDialog,
    removeDialog,
    removeAlert,
    setAlerts,
    updateActiveUserInfo,
    toggleFeatureFlag,
    toggleFeatureState,
    updateTokenUsage,
    setServiceInfo,
    setMaintenance,
    setAuthConfig,
    setFeatureFlag,
    showSpinner,
    hideSpinner,
} = appSlice.actions;

export default appSlice.reducer;

const getTotalTokenUsage = (previousSum?: number, current?: number) => {
    if (previousSum === undefined) {
        return current;
    }
    if (current === undefined) {
        return previousSum;
    }

    return previousSum + current;
};

const isServerConnectionError = (message: string) => {
    return (
        message.includes(`Cannot send data if the connection is not in the 'Connected' State.`) ||
        message.includes(`Server timeout elapsed without receiving a message from the server.`)
    );
};

const addNewAlert = (alerts: Alert[], newAlert: Alert) => {
    if (alerts.length === 3) {
        alerts.shift();
    }

    alerts.push(newAlert);
};

const updateConnectionStatus = (state: AppState, statusUpdate: Alert) => {
    if (isServerConnectionError(statusUpdate.message)) {
        statusUpdate.message =
            // Constant message so alert UI doesn't feel glitchy on every connection error from SignalR
            'Cannot send data due to lost connection or server timeout. Try refreshing this page to restart the connection.';
    }

    // There should only ever be one connection alert at a time,
    // so we tag the alert with a unique ID so we can remove if needed
    statusUpdate.id ??= Constants.app.CONNECTION_ALERT_ID;

    // Remove the existing connection alert if it exists
    const connectionAlertIndex = state.alerts.findIndex((alert) => alert.id === Constants.app.CONNECTION_ALERT_ID);
    if (connectionAlertIndex !== -1) {
        state.alerts.splice(connectionAlertIndex, 1);
    }

    addNewAlert(state.alerts, statusUpdate);
};
