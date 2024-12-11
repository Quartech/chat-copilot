import { Button, Field, Input, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useOpenAIDeployments } from '../../../libs/hooks/useOpenAIDeployment';
import { IChatCompletionDeployment, IOpenAIDeployment } from '../../../libs/models/OpenAIDeployment';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { setSelectedOpenAIDeploymentKey } from '../../../redux/features/admin/adminSlice';
import { Add20, Dismiss20 } from '../../shared/BundledIcons';
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
    tripleFieldArrayRoot: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    tripleFieldElement: {
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
    },
    tripleFieldInputElement: {
        flexGrow: 1,
    },
    tripleFieldAddButton: {
        width: '110px',
    },
    tripleFieldRemoveButton: {
        height: '32px',
        alignSelf: 'end',
    },
});

export const OpenAIManager: React.FC = () => {
    const classes = useClasses();
    const deploymentServices = useOpenAIDeployments();
    const { selectedOpenAIDeploymentId, openAIDeployments } = useAppSelector((state: RootState) => state.admin);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [secretName, setSecretName] = useState('');
    const [chatCompletionDeployments, setChatCompletionDeployments] = useState<IChatCompletionDeployment[]>([]);
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
        const deployment: IOpenAIDeployment = {
            id: '',
            name,
            endpoint,
            secretName,
            chatCompletionDeployments,
            embeddingDeployments,
            imageGenerationDeployments,
            order: editMode ? order : openAIDeployments.length,
        };

        if (editMode) {
            void deploymentServices.updateOpenAIDeployment(selectedOpenAIDeploymentId, deployment);
        } else {
            void deploymentServices.saveOpenAIDeployment(deployment);
        }
    };

    const confirmDelete = () => {
        void deploymentServices.deleteOpenAIDeployment(id);
        setSelectedOpenAIDeploymentKey('');
        fillState({
            name: '',
            id: '',
            endpoint: '',
            secretName: '',
            chatCompletionDeployments: [],
            embeddingDeployments: [],
            imageGenerationDeployments: [],
            order: 0,
        });
        setIsDeleteDialogOpen(false);
    };

    const onDeleteOpenAIDeployment = (): void => {
        setIsDeleteDialogOpen(true);
    };

    const fillState = (deployment: IOpenAIDeployment) => {
        setId(deployment.id);
        setName(deployment.name);
        setEndpoint(deployment.endpoint);
        setSecretName(deployment.secretName);
        setChatCompletionDeployments(deployment.chatCompletionDeployments);
        setImageGenerationDeployments(deployment.imageGenerationDeployments);
        setEmbeddingDeployments(deployment.embeddingDeployments);
        setOrder(deployment.order);
    };

    useEffect(() => {
        if (selectedOpenAIDeploymentId != '') {
            setEditMode(true);
            const deployment = openAIDeployments.find((a) => a.id === selectedOpenAIDeploymentId);
            if (deployment) {
                fillState(deployment);
            }
        } else {
            setEditMode(false);
            fillState({
                name: '',
                id: '',
                endpoint: '',
                secretName: '',
                chatCompletionDeployments: [],
                embeddingDeployments: [],
                imageGenerationDeployments: [],
                order: 0,
            });
        }
    }, [editMode, selectedOpenAIDeploymentId, openAIDeployments]);

    const onTripleFieldAdded = () => {
        const items = chatCompletionDeployments.slice();
        items.push({ name: '', completionTokenLimit: 0, outputTokens: 0 });
        setChatCompletionDeployments(items);
    };

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
                    value={endpoint}
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
                <div className={classes.tripleFieldArrayRoot}>
                    {chatCompletionDeployments.map((deployment, idx) => {
                        return (
                            <div key={`deployment-completion-${idx}`} className={classes.tripleFieldElement}>
                                <Field label="Deployment Name" className={classes.tripleFieldInputElement}>
                                    <Input
                                        value={deployment.name}
                                        onChange={(_, data) => {
                                            const arrayClone = chatCompletionDeployments.slice();
                                            arrayClone[idx] = { ...arrayClone[idx], name: data.value };
                                            setChatCompletionDeployments(arrayClone);
                                        }}
                                    />
                                </Field>
                                <Field label="Completion Token Limit" className={classes.tripleFieldInputElement}>
                                    <Input
                                        value={String(deployment.completionTokenLimit)}
                                        onChange={(_, data) => {
                                            const arrayClone = chatCompletionDeployments.slice();
                                            const numericRepresentation = parseInt(data.value);
                                            if (isNaN(numericRepresentation)) {
                                                return;
                                            }
                                            arrayClone[idx] = {
                                                ...arrayClone[idx],
                                                completionTokenLimit: numericRepresentation,
                                            };
                                            setChatCompletionDeployments(arrayClone);
                                        }}
                                    />
                                </Field>
                                <Field label="Output Tokens" className={classes.tripleFieldInputElement}>
                                    <Input
                                        placeholder="Output Tokens"
                                        value={String(deployment.outputTokens)}
                                        onChange={(_, data) => {
                                            const arrayClone = chatCompletionDeployments.slice();
                                            const numericRepresentation = parseInt(data.value);
                                            if (isNaN(numericRepresentation)) {
                                                return;
                                            }
                                            arrayClone[idx] = {
                                                ...arrayClone[idx],
                                                outputTokens: numericRepresentation,
                                            };
                                            setChatCompletionDeployments(arrayClone);
                                        }}
                                    />
                                </Field>
                                <Button
                                    className={classes.tripleFieldRemoveButton}
                                    icon={<Dismiss20 />}
                                    onClick={() => {
                                        setChatCompletionDeployments([
                                            ...chatCompletionDeployments.slice(0, idx),
                                            ...chatCompletionDeployments.slice(idx + 1),
                                        ]);
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        );
                    })}
                    <Button
                        disabled={false}
                        className={classes.tripleFieldAddButton}
                        onClick={() => {
                            onTripleFieldAdded();
                        }}
                        icon={<Add20 />}
                    >
                        Add
                    </Button>
                </div>
                <label htmlFor="embeddingDeployment">
                    Embedding Deployments<span className={classes.required}>*</span>
                </label>
                <FieldArray
                    values={embeddingDeployments}
                    maxItems={4}
                    onFieldChanged={(index: number, newValue: string) => {
                        const items = embeddingDeployments.slice();
                        items[index] = newValue;
                        setEmbeddingDeployments(items);
                    }}
                    onFieldAdded={() => {
                        const items = embeddingDeployments.concat(['']);
                        setEmbeddingDeployments(items);
                    }}
                    onFieldRemoved={(index: number) => {
                        setEmbeddingDeployments([
                            ...embeddingDeployments.slice(0, index),
                            ...embeddingDeployments.slice(index + 1),
                        ]);
                    }}
                />
                <label htmlFor="imageGenerationDeployments">
                    Image Generation Deployments<span className={classes.required}>*</span>
                </label>
                <FieldArray
                    values={imageGenerationDeployments}
                    maxItems={4}
                    onFieldChanged={(index: number, newValue: string) => {
                        const items = imageGenerationDeployments.slice();
                        items[index] = newValue;
                        setImageGenerationDeployments(items);
                    }}
                    onFieldAdded={() => {
                        const items = imageGenerationDeployments.concat(['']);
                        setImageGenerationDeployments(items);
                    }}
                    onFieldRemoved={(index: number) => {
                        setImageGenerationDeployments([
                            ...imageGenerationDeployments.slice(0, index),
                            ...imageGenerationDeployments.slice(index + 1),
                        ]);
                    }}
                />
                <ConfirmationDialog
                    open={isDeleteDialogOpen}
                    title="Delete Open AI Deployment"
                    content={`Are you sure you want to delete the ${name} Open AI Deployment?`}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setIsDeleteDialogOpen(false);
                    }}
                />
                <div className={classes.controls}>
                    <Button appearance="secondary" disabled={!id} onClick={onDeleteOpenAIDeployment}>
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
