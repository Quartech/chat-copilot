import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState, SearchResponseFormatted, SearchState } from './SearchState';

export const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearch: (state: SearchState, action: PayloadAction<SearchResponseFormatted>) => {
            state.searchData = action.payload;
        },
        setSelectedSearchItem: (state: SearchState, action: PayloadAction<{ filename: string; id: number }>) => {
            state.selectedSearchItem = action.payload;
        },
        setSearchSelected: (
            state: SearchState,
            action: PayloadAction<{ selected: boolean; specializationId: string }>,
        ) => {
            state.selected = action.payload.selected;
            state.selectedSpecializationId = action.payload.specializationId;
        },
    },
});

export const { setSearch, setSelectedSearchItem, setSearchSelected } = searchSlice.actions;

export default searchSlice.reducer;
