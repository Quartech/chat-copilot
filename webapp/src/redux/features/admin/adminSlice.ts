import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IOpenAIDeployment } from '../../../libs/models/OpenAIDeployment';
import { ISpecialization } from '../../../libs/models/Specialization';
import { ISpecializationIndex } from '../../../libs/models/SpecializationIndex';
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
        setSpecializationIndexes: (state: AdminState, action: PayloadAction<ISpecializationIndex[]>) => {
            state.specializationIndexes = action.payload;
        },
        setChatCompletionDeployments: (state: AdminState, action: PayloadAction<IOpenAIDeployment[]>) => {
            state.chatCompletionDeployments = action.payload;
        },
        setAdminSelected: (state: AdminState, action: PayloadAction<boolean>) => {
            state.isAdminSelected = action.payload;
        },
        setIndexSelected: (state: AdminState, action: PayloadAction<boolean>) => {
            state.isIndexSelected = action.payload;
        },
        setUserFeedbackSelected: (state: AdminState, action: PayloadAction<boolean>) => {
            state.isUserFeedbackSelected = action.payload;
        },
        setSelectedKey: (state: AdminState, action: PayloadAction<string>) => {
            state.selectedId = action.payload;
        },
        setSelectedIndexKey: (state: AdminState, action: PayloadAction<string>) => {
            state.selectedIndexId = action.payload;
        },
        addSpecialization: (state: AdminState, action: PayloadAction<ISpecialization>) => {
            state.specializations.push(action.payload);
        },
        addSpecializationIndex: (state: AdminState, action: PayloadAction<ISpecializationIndex>) => {
            state.specializationIndexes.push(action.payload);
        },
        editSpecialization: (state: AdminState, action: PayloadAction<ISpecialization>) => {
            const specializations = state.specializations;
            const updatedSpecializations = specializations.filter(
                (specialization: ISpecialization) => specialization.id !== action.payload.id,
            );
            state.specializations = updatedSpecializations;
            state.specializations.push(action.payload);
        },
        editSpecializationIndex: (state: AdminState, action: PayloadAction<ISpecializationIndex>) => {
            const indexes = state.specializationIndexes;
            const updatedIndexes = indexes.filter((index: ISpecializationIndex) => index.id !== action.payload.id);
            state.specializationIndexes = updatedIndexes;
            state.specializationIndexes.push(action.payload);
        },
        removeSpecialization: (state: AdminState, action: PayloadAction<string>) => {
            const specializations = state.specializations;
            const selectedKey = action.payload;
            const updatedSpecializations = specializations.filter(
                (specialization: ISpecialization) => specialization.id !== selectedKey,
            );
            state.specializations = updatedSpecializations;
        },
        removeSpecializationIndex: (state: AdminState, action: PayloadAction<string>) => {
            const indexes = state.specializationIndexes;
            const selectedKey = action.payload;
            const updatedSpecializations = indexes.filter((index: ISpecializationIndex) => index.id !== selectedKey);
            state.specializationIndexes = updatedSpecializations;
        },
    },
});

export const {
    setSpecializations,
    setChatSpecialization,
    setSpecializationIndexes,
    setChatCompletionDeployments,
    setAdminSelected,
    setIndexSelected,
    setUserFeedbackSelected,
    setSelectedKey,
    setSelectedIndexKey,
    addSpecialization,
    addSpecializationIndex,
    editSpecialization,
    editSpecializationIndex,
    removeSpecialization,
    removeSpecializationIndex,
} = adminSlice.actions;

export default adminSlice.reducer;
