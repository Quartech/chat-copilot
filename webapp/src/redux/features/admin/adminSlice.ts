import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ISpecialization, ISpecializationSwapOrder } from '../../../libs/models/Specialization';
import { AdminState, initialState } from './AdminState';

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // Set the currently selected chat specialization
        setChatSpecialization: (state: AdminState, action: PayloadAction<ISpecialization>) => {
            state.chatSpecialization = action.payload;
        },
        setSpecializations: (state: AdminState, action: PayloadAction<ISpecialization[]>) => {
            // const updatedSpecializations = action.payload.filter(
            //     (specialization: ISpecialization) => specialization.isActive,
            // );
            state.specializations = action.payload;
        },
        setSpecializationIndexes: (state: AdminState, action: PayloadAction<string[]>) => {
            state.specializationIndexes = action.payload;
        },
        setChatCompletionDeployments: (state: AdminState, action: PayloadAction<string[]>) => {
            state.chatCompletionDeployments = action.payload;
        },
        setAdminSelected: (state: AdminState, action: PayloadAction<boolean>) => {
            state.isAdminSelected = action.payload;
        },
        setSelectedKey: (state: AdminState, action: PayloadAction<string>) => {
            state.selectedId = action.payload;
        },
        addSpecialization: (state: AdminState, action: PayloadAction<ISpecialization>) => {
            state.specializations.push(action.payload);
        },
        editSpecialization: (state: AdminState, action: PayloadAction<ISpecialization>) => {
            const specializations = state.specializations;
            const updatedSpecializations = specializations.filter(
                (specialization: ISpecialization) => specialization.id !== action.payload.id,
            );
            state.specializations = updatedSpecializations;
            state.specializations.push(action.payload);
        },
        removeSpecialization: (state: AdminState, action: PayloadAction<string>) => {
            const specializations = state.specializations;
            const selectedKey = action.payload;
            const updatedSpecializations = specializations.filter(
                (specialization: ISpecialization) => specialization.id !== selectedKey,
            );
            state.specializations = updatedSpecializations;
        },
        swapSpecialization: (state: AdminState, action: PayloadAction<ISpecializationSwapOrder>) => {
            const { fromId, fromOrder, toId, toOrder } = action.payload;

            if (fromId === toId || fromOrder === -1 || toOrder === -1 || fromOrder === toOrder) {
                return state;
            }

            const newSpecializations = [...state.specializations];
            for (let i = 0; i < newSpecializations.length; i++) {
                if (newSpecializations[i].id === fromId) {
                    newSpecializations[i] = { ...newSpecializations[i], order: toOrder };
                } else if (newSpecializations[i].id === toId) {
                    newSpecializations[i] = { ...newSpecializations[i], order: fromOrder };
                }
            }

            return { ...state, specializations: newSpecializations };
        },
    },
});

export const {
    setSpecializations,
    setChatSpecialization,
    setSpecializationIndexes,
    setChatCompletionDeployments,
    setAdminSelected,
    setSelectedKey,
    addSpecialization,
    editSpecialization,
    removeSpecialization,
    swapSpecialization,
} = adminSlice.actions;

export default adminSlice.reducer;
