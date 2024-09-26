// Copyright (c) Microsoft. All rights reserved.

import { AnyAction, combineReducers, createAction, Reducer } from '@reduxjs/toolkit';
import adminReducer from '../features/admin/adminSlice';
import appReducer from '../features/app/appSlice';
import conversationsReducer from '../features/conversations/conversationsSlice';
import pluginsReducer from '../features/plugins/pluginsSlice';
import searchReducer from '../features/search/searchSlice';
import toastReducer from '../features/toast/toastSlice';
import usersReducer from '../features/users/usersSlice';

import { RootState } from './store';

// Define a top-level root state reset action
export const resetApp = createAction('resetApp');

// Define a root reducer that combines all the reducers
const rootReducer: Reducer<RootState> = combineReducers({
    app: appReducer,
    conversations: conversationsReducer,
    plugins: pluginsReducer,
    users: usersReducer,
    search: searchReducer,
    admin: adminReducer,
    toast: toastReducer,
});

// Define a special resetApp reducer that handles resetting the entire state
export const resetAppReducer = (state: RootState | undefined, action: AnyAction) => {
    if (action.type === resetApp.type) {
        state = {
            // Explicitly call each individual reducer with undefined state.
            // This allows the reducers to handle the reset logic and return the initial state with the correct type.
            app: appReducer(undefined, action),
            conversations: conversationsReducer(undefined, action),
            plugins: pluginsReducer(undefined, action),
            users: usersReducer(undefined, action),
            search: searchReducer(undefined, action),
            admin: adminReducer(undefined, action),
            toast: toastReducer(undefined, action),
        };
    }

    return rootReducer(state, action);
};

export default resetAppReducer;
