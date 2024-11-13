import { useMsal } from '@azure/msal-react';
import { useAppDispatch } from '../../redux/app/hooks';
import {
    addSpecializationIndex,
    editSpecializationIndex,
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

    return {
        loadSpecializationIndexes,
        saveSpecializationIndex,
        updateSpecializationIndex,
    };
};
