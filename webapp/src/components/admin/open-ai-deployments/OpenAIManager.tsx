/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button, Input, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useSpecializationIndex } from '../../../libs/hooks/useSpecializationIndex';
import { ISpecializationIndex } from '../../../libs/models/SpecializationIndex';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { ConfirmationDialog } from '../../shared/ConfirmationDialog';
import FieldArray from '../../shared/FieldArray';

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
        '&:hover': {
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: tokens.colorScrollbarOverlay,
                visibility: 'visible',
            },
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: tokens.colorSubtleBackground,
        },
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

export const OpenAIManager: React.FC = () => {
    const classes = useClasses();
    const indexes = useSpecializationIndex();
    const { selectedIndexId, specializationIndexes } = useAppSelector((state: RootState) => state.admin);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [secretName, setSecretName] = useState('');
    const [chatCompletionDeployments, setChatCompletionDeployments] = useState<Array<Record<string, any>>>([]);
    const [embeddingDeployments, setEmbeddingDeployments] = useState<string[]>([]);
    const [imageGenerationDeployments, setImageGenerationDeployments] = useState<string[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [order, setOrder] = useState(0);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isValid =
        !!name &&
        !!endpoint &&
        !!secretName &&
        !!chatCompletionDeployments.length &&
        !!embeddingDeployments.length &&
        !!imageGenerationDeployments;

    const onSaveOpenAIDeployment = (editMode: boolean): void => {
        // const index: ISpecializationIndex = {
        //     id: '',
        //     name,
        //     queryType,
        //     aiSearchDeploymentConnection,
        //     openAIDeploymentConnection,
        //     embeddingDeployment,
        //     order: editMode ? order : specializationIndexes.length,
        // };

        if (editMode) {
            //void indexes.updateSpecializationIndex(selectedIndexId, index);
        } else {
            //void indexes.saveSpecializationIndex(index);
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
        // setId(index.id);
        // setName(index.name);
        // setQueryType(index.queryType);
        // setAiSearchDeploymentConnection(index.aiSearchDeploymentConnection);
        // setOpenAIDeploymentConnection(index.openAIDeploymentConnection);
        // setEmbeddingDeployment(index.embeddingDeployment);
        // setOrder(index.order);
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
                <label htmlFor="endpoint">
                    Endpoint<span className={classes.required}>*</span>
                </label>
                <Input
                    id="endpoint"
                    required
                    value={name}
                    onChange={(_event, data) => {
                        setEndpoint(data.value);
                    }}
                />
                <label htmlFor="secretName">
                    Secret Name<span className={classes.required}>*</span>
                </label>
                <Input
                    id="secretName"
                    required
                    value={secretName}
                    onChange={(_event, data) => {
                        setSecretName(data.value);
                    }}
                />
                <label htmlFor="openAIDeploymentConnection">
                    Open AI Deployment Connection<span className={classes.required}>*</span>
                </label>
                {chatCompletionDeployments.map((deployment, idx) => {
                    return (
                        <div key={`deployment-completion-${idx}`}>
                            <Input
                                value={deployment.name}
                                onChange={(_, data) => {
                                    console.log(data);
                                }}
                            />
                            <Input
                                value={deployment.completionTokenLimit}
                                onChange={(_, data) => {
                                    console.log(data);
                                }}
                            />
                            <Button>Remove</Button>
                        </div>
                    );
                })}
                <label htmlFor="embeddingDeployment">
                    Embedding Deployments<span className={classes.required}>*</span>
                </label>
                <FieldArray
                    values={embeddingDeployments}
                    maxItems={4}
                    onFieldChanged={function (index: number, newValue: string): void {
                        throw new Error('Function not implemented.');
                    }}
                    onFieldAdded={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    onFieldRemoved={function (index: number): void {
                        throw new Error('Function not implemented.');
                    }}
                />
                <label htmlFor="imageGenerationDeployments">
                    Image Generation Deployments<span className={classes.required}>*</span>
                </label>
                <FieldArray
                    values={imageGenerationDeployments}
                    maxItems={4}
                    onFieldChanged={function (index: number, newValue: string): void {
                        throw new Error('Function not implemented.');
                    }}
                    onFieldAdded={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    onFieldRemoved={function (index: number): void {
                        throw new Error('Function not implemented.');
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
                            onSaveOpenAIDeployment(editMode);
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
