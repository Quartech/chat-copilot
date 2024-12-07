import { useMsal } from '@azure/msal-react';
import { useDispatch } from 'react-redux';
import { getErrorDetails } from '../../components/utils/TextUtils';
import {
    addOpenAIDeployment,
    editOpenAIDeployment,
    removeOpenAIDeployment,
    setOpenAIDeployments,
} from '../../redux/features/admin/adminSlice';
import { addAlert } from '../../redux/features/app/appSlice';
import { AuthHelper } from '../auth/AuthHelper';
import { AlertType } from '../models/AlertType';
import { IOpenAIDeployment } from '../models/OpenAIDeployment';
import { OpenAIDeploymentService } from '../services/OpenAIDeploymentService';

export const useOpenAIDeployments = () => {
    const dispatch = useDispatch();
    const { instance, inProgress } = useMsal();
    const openAIDeploymentService = new OpenAIDeploymentService();

    const loadOpenAIDeployments = async (): Promise<IOpenAIDeployment[] | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const deployments = await openAIDeploymentService.getAllOpenAIDeploymentsAsync(accessToken);
            dispatch(setOpenAIDeployments(deployments));
            return deployments;
        } catch (e: any) {
            return undefined;
        }
    };

    const saveOpenAIDeployment = async (body: IOpenAIDeployment): Promise<IOpenAIDeployment | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const openAIDeployment = await openAIDeploymentService.createOpenAIDeployment(body, accessToken);
            dispatch(addOpenAIDeployment(openAIDeployment));
            dispatch(
                addAlert({
                    message: `Open AI Deployment ${openAIDeployment.name} was created successfully.`,
                    type: AlertType.Success,
                }),
            );
            return openAIDeployment;
        } catch (e: any) {
            return undefined;
        }
    };

    const updateOpenAIDeployment = async (
        id: string,
        body: IOpenAIDeployment,
    ): Promise<IOpenAIDeployment | undefined> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const openAIDeployment = await openAIDeploymentService.updateOpenAIDeployment(id, body, accessToken);
            dispatch(editOpenAIDeployment(openAIDeployment));
            dispatch(
                addAlert({
                    message: `Open AI Deployment ${openAIDeployment.name} was updated successfully.`,
                    type: AlertType.Success,
                }),
            );
            return openAIDeployment;
        } catch (e: any) {
            return undefined;
        }
    };

    const deleteOpenAIDeployment = async (id: string): Promise<boolean> => {
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            const success = await openAIDeploymentService.deleteOpenAIDeployment(id, accessToken);
            dispatch(removeOpenAIDeployment(id));
            dispatch(
                addAlert({
                    message: `Open AI Deployment was deleted successfully.`,
                    type: AlertType.Success,
                }),
            );
            return success;
        } catch (e: any) {
            return false;
        }
    };

    const setOpenAIDeploymentOrder = async (deployments: IOpenAIDeployment[]) => {
        dispatch(setOpenAIDeployments(deployments));
        try {
            const accessToken = await AuthHelper.getSKaaSAccessToken(instance, inProgress);
            await openAIDeploymentService.setOpenAIDeploymentOrder(deployments, accessToken);
        } catch (e: any) {
            dispatch(
                addAlert({
                    message: `Failed to swap deployment order: Details: ${getErrorDetails(e)}`,
                    type: AlertType.Error,
                }),
            );
        }
    };

    return {
        loadOpenAIDeployments,
        saveOpenAIDeployment,
        updateOpenAIDeployment,
        deleteOpenAIDeployment,
        setOpenAIDeploymentOrder,
    };
};
