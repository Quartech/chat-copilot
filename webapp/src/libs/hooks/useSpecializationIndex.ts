import { useMsal } from '@azure/msal-react';
import { AuthHelper } from '../auth/AuthHelper';
import { ISpecializationIndex } from '../models/SpecializationIndex';
import { SpecializationIndexService } from '../services/SpecializationIndexService';

export const useSpecializationIndex = () => {
    //const dispatch = useAppDispatch();
    const { instance, inProgress } = useMsal();
    const specializationIndexService = new SpecializationIndexService();

    const loadSpecializationIndexes = async (): Promise<ISpecializationIndex[] | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const indexes = await specializationIndexService.getAllSpecializationIndexesAsync(accessToken);
            return indexes;
        } catch (e: any) {
            return undefined;
        }
    };

    const saveSpecialization = async (body: ISpecializationIndex): Promise<ISpecializationIndex | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const indexes = await specializationIndexService.createSpecializationIndex(body, accessToken);
            return indexes;
        } catch (e: any) {
            return undefined;
        }
    };

    return {
        loadSpecializationIndexes,
        saveSpecialization,
    };
};
