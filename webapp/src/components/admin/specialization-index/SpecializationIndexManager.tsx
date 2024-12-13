import { Button, Dropdown, Input, Option, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useSpecializationIndex } from '../../../libs/hooks/useSpecializationIndex';
import { ISpecializationIndex } from '../../../libs/models/SpecializationIndex';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { ConfirmationDialog } from '../../shared/ConfirmationDialog';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
        ...shorthands.padding('80px'),
    },
    horizontal: {
        display: 'flex',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
        alignItems: 'center',
    },
    controls: {
        display: 'flex',
        marginLeft: 'auto',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
    },
    dialog: {
        maxWidth: '25%',
    },
    required: {
        color: '#990000',
    },
    scrollableContainer: {
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 100px)', // Adjust this value as needed
        ...shorthands.padding('10px'),
    },
    fileUploadContainer: {
        display: 'flex',
        flexDirection: 'row',
        ...shorthands.gap(tokens.spacingHorizontalXXXL),
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
    },
    slidersContainer: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
        ...shorthands.marginInline('10px'),
    },
    slider: {
        display: 'flex',
        ...shorthands.gap(tokens.spacingVerticalSNudge),
        alignItems: 'center',
    },
    input: {
        width: '80px',
    },
});

export const SpecializationIndexManager: React.FC = () => {
    const classes = useClasses();
    const indexes = useSpecializationIndex();
    const { selectedIndexId, specializationIndexes, openAIDeployments } = useAppSelector(
        (state: RootState) => state.admin,
    );
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [queryType, setQueryType] = useState('');
    const [aiSearchDeploymentConnection, setAiSearchDeploymentConnection] = useState('');
    const [openAIDeploymentConnection, setOpenAIDeploymentConnection] = useState('');
    const [embeddingDeployment, setEmbeddingDeployment] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [order, setOrder] = useState(0);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isValid =
        !!name &&
        !!queryType &&
        !!aiSearchDeploymentConnection &&
        !!openAIDeploymentConnection &&
        !!embeddingDeployment;

    const onSaveSpecializationIndex = (editMode: boolean): void => {
        const index: ISpecializationIndex = {
            id: '',
            name,
            queryType,
            aiSearchDeploymentConnection,
            openAIDeploymentConnection,
            embeddingDeployment,
            order: editMode ? order : specializationIndexes.length,
        };

        if (editMode) {
            void indexes.updateSpecializationIndex(selectedIndexId, index);
        } else {
            void indexes.saveSpecializationIndex(index);
        }
    };

    const confirmDelete = () => {
        void indexes.deleteSpecializationIndex(id);
        fillState({
            name: '',
            id: '',
            queryType: '',
            aiSearchDeploymentConnection: '',
            openAIDeploymentConnection: '',
            embeddingDeployment: '',
            order: 0,
        });
        setIsDeleteDialogOpen(false);
    };

    const onDeleteSpecializationIndex = (): void => {
        setIsDeleteDialogOpen(true);
    };

    const fillState = (index: ISpecializationIndex) => {
        setId(index.id);
        setName(index.name);
        setQueryType(index.queryType);
        setAiSearchDeploymentConnection(index.aiSearchDeploymentConnection);
        setOpenAIDeploymentConnection(index.openAIDeploymentConnection);
        setEmbeddingDeployment(index.embeddingDeployment);
        setOrder(index.order);
    };

    useEffect(() => {
        if (selectedIndexId != '') {
            setEditMode(true);
            const specializationIndex = specializationIndexes.find((a) => a.id === selectedIndexId);
            if (specializationIndex) {
                fillState(specializationIndex);
            }
        } else {
            setEditMode(false);
            fillState({
                name: '',
                id: '',
                queryType: '',
                aiSearchDeploymentConnection: '',
                openAIDeploymentConnection: '',
                embeddingDeployment: '',
                order: 0,
            });
        }
    }, [editMode, selectedIndexId, specializationIndexes]);

    return (
        <div className={classes.scrollableContainer}>
            <div className={classes.root}>
                <div className={classes.horizontal}></div>
                <label htmlFor="name">
                    Name<span className={classes.required}>*</span>
                </label>
                <Input
                    id="name"
                    required
                    value={name}
                    onChange={(_event, data) => {
                        setName(data.value);
                    }}
                />
                <label htmlFor="queryType">
                    Query Type<span className={classes.required}>*</span>
                </label>
                <Dropdown
                    clearable
                    id="queryType"
                    aria-labelledby={queryType}
                    onOptionSelect={(_control, data) => {
                        setQueryType(data.optionValue ?? '');
                    }}
                    value={queryType}
                >
                    {['simple', 'semantic', 'vector', 'vector_simple_hybrid', 'vector_semantic_hybrid'].map(
                        (queryType) => (
                            <Option key={queryType} value={queryType}>
                                {queryType}
                            </Option>
                        ),
                    )}
                </Dropdown>
                <label htmlFor="aiSearchDeploymentConnection">
                    Search Deployment Connection<span className={classes.required}>*</span>
                </label>
                <Input
                    id="aiSearchDeploymentConnection"
                    required
                    value={aiSearchDeploymentConnection}
                    onChange={(_event, data) => {
                        setAiSearchDeploymentConnection(data.value);
                    }}
                />
                <label htmlFor="openAIDeploymentConnection">
                    Open AI Deployment Connection<span className={classes.required}>*</span>
                </label>
                <Dropdown
                    clearable
                    id="openAIDeploymentConnection"
                    aria-labelledby={openAIDeploymentConnection}
                    onOptionSelect={(_control, data) => {
                        setOpenAIDeploymentConnection(data.optionValue ?? '');
                    }}
                    value={openAIDeploymentConnection}
                >
                    {openAIDeployments.map((deployment) => (
                        <Option key={deployment.name} value={deployment.name}>
                            {deployment.name}
                        </Option>
                    ))}
                </Dropdown>
                <label htmlFor="embeddingDeployment">
                    Embedding Deployment<span className={classes.required}>*</span>
                </label>
                <Input
                    id="embeddingDeployment"
                    required
                    value={embeddingDeployment}
                    onChange={(_event, data) => {
                        setEmbeddingDeployment(data.value);
                    }}
                />
                <ConfirmationDialog
                    open={isDeleteDialogOpen}
                    title="Delete Index"
                    content={`Are you sure you want to delete the ${name} index?`}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setIsDeleteDialogOpen(false);
                    }}
                />
                <div className={classes.controls}>
                    <Button appearance="secondary" disabled={!id} onClick={onDeleteSpecializationIndex}>
                        Delete
                    </Button>

                    <Button
                        appearance="primary"
                        disabled={!isValid}
                        onClick={() => {
                            onSaveSpecializationIndex(editMode);
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
