import { RootState } from '../../redux/app/store';
import { useAppSelector } from '../../redux/app/hooks';
import { useMemo } from 'react';

export const useChatSpecilization = () => {
    const { conversations, selectedId } = useAppSelector((state: RootState) => state.conversations);
    const { specializations } = useAppSelector((state: RootState) => state.app);

    const specialization = useMemo(() => {
        if (!selectedId) return;
        const specializationKey = conversations[selectedId].specializationKey;
        return specializations.find((spec) => spec.key === specializationKey);
    }, [selectedId, conversations, specializations]);

    return specialization;
};
