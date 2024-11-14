import { useMsal } from '@azure/msal-react';
import { getErrorDetails } from '../../components/utils/TextUtils';
import { useAppDispatch } from '../../redux/app/hooks';
import {
    addSpecializationIndex,
    editSpecializationIndex,
    removeSpecializationIndex,
    setSpecializationIndexes,
} from '../../redux/features/admin/adminSlice';
import { addAlert } from '../../redux/features/app/appSlice';
import { AuthHelper } from '../auth/AuthHelper';
import { AlertType } from '../models/AlertType';
import { ISpecializationIndex } from '../models/SpecializationIndex';
import { SpecializationIndexService } from '../services/SpecializationIndexService';

export const useSpecializationIndex = () => {
    const dispatch = useAppDispatch();
    const { instance, inProgress } = useMsal();
    const specializationIndexService = new SpecializationIndexService();

    const loadSpecializationIndexes = async (): Promise<ISpecializationIndex[] | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const indexes = await specializationIndexService.getAllSpecializationIndexesAsync(accessToken);
            dispatch(setSpecializationIndexes(indexes));
            return indexes;
        } catch (e: any) {
            return undefined;
        }
    };

    const saveSpecializationIndex = async (body: ISpecializationIndex): Promise<ISpecializationIndex | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const index = await specializationIndexService.createSpecializationIndex(body, accessToken);
            dispatch(addSpecializationIndex(index));
            dispatch(addAlert({ message: `Index ${index.name} was created successfully.`, type: AlertType.Success }));
            return index;
        } catch (e: any) {
            return undefined;
        }
    };

    const updateSpecializationIndex = async (
        id: string,
        body: ISpecializationIndex,
    ): Promise<ISpecializationIndex | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const index = await specializationIndexService.updateSpecializationIndex(id, body, accessToken);
            dispatch(editSpecializationIndex(index));
            dispatch(addAlert({ message: `Index ${index.name} was updated successfully.`, type: AlertType.Success }));
            return index;
        } catch (e: any) {
            return undefined;
        }
    };

    const deleteSpecializationIndex = async (id: string): Promise<boolean> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const index = await specializationIndexService.deleteSpecializationIndex(id, accessToken);
            dispatch(removeSpecializationIndex(id));
            dispatch(addAlert({ message: `Index was deleted successfully.`, type: AlertType.Success }));
            return index;
        } catch (e: any) {
            return false;
        }
    };

    const setSpecializationIndexOrder = async (specializations: ISpecializationIndex[]) => {
        dispatch(setSpecializationIndexes(specializations));
        try {
            await specializationIndexService.setSpecializationIndexOrder(
                specializations,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
        } catch (e: any) {
            const errorMessage = `Failed to swap specialization order. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
        }
    };

    return {
        loadSpecializationIndexes,
        saveSpecializationIndex,
        updateSpecializationIndex,
        deleteSpecializationIndex,
        setSpecializationIndexOrder,
    };
};
