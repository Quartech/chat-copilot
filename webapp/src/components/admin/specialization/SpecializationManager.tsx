import {
    Button,
    Checkbox,
    CheckboxOnChangeData,
    Dropdown,
    Input,
    InputOnChangeData,
    makeStyles,
    Option,
    OptionOnSelectData,
    SelectionEvents,
    shorthands,
    Slider,
    SliderOnChangeData,
    Textarea,
    tokens,
    Tooltip,
} from '@fluentui/react-components';
import { Info20Regular } from '@fluentui/react-icons';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useSpecialization } from '../../../libs/hooks';
import { AlertType } from '../../../libs/models/AlertType';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { addAlert } from '../../../redux/features/app/appSlice';
import { ImageUploaderPreview } from '../../files/ImageUploaderPreview';
import { ConfirmationDialog } from '../../shared/ConfirmationDialog';
import FieldArray from '../../shared/FieldArray';
import { Row } from '../../shared/Row';
import { ChatMessageType } from '../../../libs/models/ChatMessage';
import { IAsk } from '../../../libs/semantic-kernel/model/Ask';
import { NoChatMessageService } from '../../../libs/services/OneOffChatService';
import { AuthHelper } from '../../../libs/auth/AuthHelper';
import { useMsal } from '@azure/msal-react';
import { IAskResult } from '../../../libs/semantic-kernel/model/AskResult';
//import { NoChatMessageService } from '../../../libs/services/OneOffChatService';

interface ISpecializationFile {
    file: File | null;
    src: string | null;
}

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
    needsAttention: {
        backgroundColor: '#FFCCCB',
        flexGrow: 1,
    },
});

const Rows = 8;

/**
 * Specialization Manager component.
 *
 * @returns {*}
 */
export const SpecializationManager: React.FC = () => {
    const classes = useClasses();
    const specialization = useSpecialization();
    const dispatch = useAppDispatch();
    const {
        specializations,
        specializationIndexes,
        openAIDeployments: chatCompletionDeployments,
        selectedId,
    } = useAppSelector((state: RootState) => state.admin);

    interface FormattedOpenAIDeployment {
        id: string;
        deploymentName: string;
        completionName: string;
    }

    const completionDeploymentsFormatted = useMemo(() => {
        const formatted: FormattedOpenAIDeployment[] = [];
        chatCompletionDeployments.forEach((dep) =>
            formatted.push(
                ...dep.chatCompletionDeployments.map((comp) => ({
                    id: dep.id,
                    deploymentName: dep.name,
                    completionName: comp.name,
                })),
            ),
        );
        return formatted;
    }, [chatCompletionDeployments]);

    const [editMode, setEditMode] = useState(false);
    const defaultSpecializationId = specializations.find((spec) => spec.isDefault)?.id;
    const [id, setId] = useState('');
    const [indexId, setIndexId] = useState('');
    const [deploymentId, setDeploymentId] = useState('');
    const [completionDeploymentName, setCompletionDeploymentName] = useState('');
    const [deploymentOutputTokens, setDeploymentOutputTokens] = useState(0);

    // Required fields
    const [name, setName] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [roleInformation, setRoleInformation] = useState<string>('');
    const [initialChatMessage, setInitialChatMessage] = useState<string>('');
    const [membershipId, setMembershipId] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>(['']);

    const [imageFile, setImageFile] = useState<ISpecializationFile>({ file: null, src: null });
    const [iconFile, setIconFile] = useState<ISpecializationFile>({ file: null, src: null });
    const [restrictResultScope, setRestrictResultScope] = useState<boolean | null>(false);
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [strictness, setStrictness] = useState<number | null>(0);
    const [documentCount, setDocumentCount] = useState<number | null>(0);
    const [pastMessagesIncludedCount, setPastMessagesIncludedCount] = useState<number | null>(0);
    const [maxResponseTokenLimit, setMaxResponseTokenLimit] = useState<number | null>(0);
    const [order, setOrder] = useState(0);
    const [canGenImages, setCanGenImages] = useState(false);

    const [isValid, setIsValid] = useState(false);
    const [saveAttempted, setSaveAttempted] = useState(false);
    const dropdownId = useId();

    const hasEnrichmentIndex = !!indexId;
    const { instance, inProgress } = useMsal();

    const getMarkdown = async (roleInformation: string): Promise<IAskResult> => {
        const markDownPrompt = `
            Take the provided text, which serves as instructions about the role behavior of a chat model,
            and convert it into a well-structured Markdown document.
            Use appropriate titles and paragraphs to organize the information in a way that is clear and easy
            for the chatbot to interpret and apply. IMPORTANT: REPLY ONLY WITH THE UPDATED MARKDOWN DO NOT WRITE ANYTHING ELSE IN YOUR RESPONSE.
            HERE IS THE INPUT TEXT for you to convert:
 
            ${roleInformation}
        `;

        //Configure ask object for service function request
        const ask: IAsk = {
            input: markDownPrompt,
            variables: [
                {
                    key: 'messageType',
                    value: ChatMessageType.Message.toString(),
                },
            ],
        };

        //passing ask object, auth token, and plugins
        const noChatMessageService = new NoChatMessageService();
        return noChatMessageService.getBotResponseNoChat(
            ask,
            await AuthHelper.getSKaaSAccessToken(instance, inProgress),
        );
    };

    /**
     * Save specialization by creating or updating.
     *
     * Note: When we save a specialization we send the actual files (image / icon) to the server.
     * On fetch we get the file paths from the Specialization payload and display them.
     *
     * @returns {void}
     */
    const onSaveSpecialization = () => {
        if (!isValid) {
            setSaveAttempted(true);
            dispatch(
                addAlert({
                    message: 'Please fill in all required fields.',
                    type: AlertType.Warning,
                }),
            );
            return;
        }
        setSaveAttempted(false);

        //temp
        getMarkdown(roleInformation)
            .then((roleInformation) => {
                console.log(roleInformation);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        if (editMode) {
            void specialization.updateSpecialization(id, {
                label,
                name,
                description,
                roleInformation,
                indexId,
                imageFile: imageFile.file,
                iconFile: iconFile.file,
                deleteImage: !imageFile.src, // Set the delete flag if the src is null
                deleteIcon: !iconFile.src, // Set the delete flag if the src is null,
                openAIDeploymentId: deploymentId,
                completionDeploymentName,
                groupMemberships: membershipId,
                initialChatMessage,
                isDefault,
                restrictResultScope,
                strictness,
                documentCount,
                pastMessagesIncludedCount,
                maxResponseTokenLimit,
                order,
                suggestions,
                canGenImages,
            });
        } else {
            void specialization.createSpecialization({
                label,
                name,
                description,
                roleInformation,
                indexId,
                imageFile: imageFile.file,
                iconFile: iconFile.file,
                openAIDeploymentId: deploymentId,
                completionDeploymentName,
                groupMemberships: membershipId,
                initialChatMessage,
                isDefault,
                restrictResultScope,
                strictness,
                documentCount,
                pastMessagesIncludedCount,
                maxResponseTokenLimit,
                order: specializations.length,
                suggestions,
                canGenImages,
            });
        }
    };

    const resetSpecialization = () => {
        setId('');
        setLabel('');
        setName('');
        setDescription('');
        setRoleInformation('');
        setMembershipId([]);
        setImageFile({ file: null, src: null });
        setIconFile({ file: null, src: null });
        setIndexId('');
        setDeploymentId('');
        setCompletionDeploymentName('');
        setDeploymentOutputTokens(4096);
        setInitialChatMessage('');
        setIsDefault(false);
        setRestrictResultScope(false);
        setStrictness(3);
        setDocumentCount(5);
        setPastMessagesIncludedCount(10);
        setMaxResponseTokenLimit(1024);
        setSuggestions(['']);
    };

    useEffect(() => {
        if (selectedId != '') {
            setEditMode(true);
            const specializationObj = specializations.find((specialization) => specialization.id === selectedId);
            if (specializationObj) {
                setId(specializationObj.id);
                setLabel(specializationObj.label);
                setName(specializationObj.name);
                setDescription(specializationObj.description);
                setRoleInformation(specializationObj.roleInformation);
                setMembershipId(specializationObj.groupMemberships);
                setDeploymentId(specializationObj.openAIDeploymentId);
                setCompletionDeploymentName(specializationObj.completionDeploymentName);
                setDeploymentOutputTokens(
                    chatCompletionDeployments
                        .find((d) => d.id === specializationObj.openAIDeploymentId)
                        ?.chatCompletionDeployments.find((a) => a.name === specializationObj.completionDeploymentName)
                        ?.outputTokens ?? 4096,
                );
                setInitialChatMessage(specializationObj.initialChatMessage);
                setIndexId(specializationObj.indexId);
                setIsDefault(specializationObj.isDefault);
                setRestrictResultScope(specializationObj.restrictResultScope ?? false);
                setStrictness(specializationObj.strictness ?? 3);
                setDocumentCount(specializationObj.documentCount ?? 5);
                setPastMessagesIncludedCount(specializationObj.pastMessagesIncludedCount ?? 10);
                setMaxResponseTokenLimit(specializationObj.maxResponseTokenLimit ?? 1024);
                /**
                 * Set the image and icon file paths
                 * Note: The file is set to null because we only retrieve the file path from the server
                 */
                setImageFile({ file: null, src: specializationObj.imageFilePath });
                setIconFile({ file: null, src: specializationObj.iconFilePath });
                setOrder(specializationObj.order);
                setSuggestions(specializationObj.suggestions);
                setCanGenImages(specializationObj.canGenImages);
            }
        } else {
            setEditMode(false);
            resetSpecialization();
        }
    }, [editMode, selectedId, specializations, chatCompletionDeployments]);

    useEffect(() => {
        const isValid =
            !!label &&
            !!name &&
            !!roleInformation &&
            !!description &&
            !!initialChatMessage &&
            membershipId.length > 0 &&
            !!deploymentId;
        setIsValid(isValid);
        return () => {};
    }, [
        specializations,
        selectedId,
        label,
        name,
        roleInformation,
        membershipId,
        description,
        initialChatMessage,
        deploymentId,
    ]);

    const onDeleteSpecialization = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (isDefault && specializations.length > 1) {
            dispatch(
                addAlert({
                    message: 'Please set another specialization as default before deleting this one.',
                    type: AlertType.Warning,
                }),
            );
            setIsDeleteDialogOpen(false);
            return;
        }
        void specialization.deleteSpecialization(id, name);
        resetSpecialization();
        setIsDeleteDialogOpen(false);
    };

    /**
     * Callback function for handling changes to the "Enrichment Index" dropdown.
     */
    const onChangeIndexName = (_event?: SelectionEvents, data?: OptionOnSelectData) => {
        setIndexId(data?.optionValue ?? '');
    };

    /**
     * Callback function for handling changes to the "Limit responses to you data content" checkbox.
     */
    const onChangeRestrictResultScope = (_event?: React.ChangeEvent<HTMLInputElement>, data?: CheckboxOnChangeData) => {
        setRestrictResultScope(!!data?.checked);
    };

    /**
     * Automatically set the first specialization as default
     */
    useEffect(() => {
        if (specializations.length === 0) {
            setIsDefault(true);
        }
    }, [specializations]);

    /**
     * Callback function for handling changes to the "Set as Default Specialization" checkbox.
     */
    const onChangeIsDefault = (_event?: React.ChangeEvent<HTMLInputElement>, data?: CheckboxOnChangeData) => {
        const isCurrentlyDefault = id === defaultSpecializationId;
        if ((isCurrentlyDefault && !data?.checked) || specializations.length === 0) {
            dispatch(
                addAlert({
                    message: 'Having a default specialization is a requirement.',
                    type: AlertType.Warning,
                }),
            );
            return;
        }

        if (!isCurrentlyDefault && data?.checked) {
            dispatch(
                addAlert({
                    message: `You are trying to set ${name} as the default specialization.`,
                    type: AlertType.Info,
                }),
            );
            setIsDefault(true);
        } else if (!isCurrentlyDefault && !data?.checked) {
            setIsDefault(false);
        }
    };

    /**
     * Callback function for handling changes to the "Strictness" slider.
     */
    const onChangeStrictness = (_event?: React.ChangeEvent<HTMLInputElement>, data?: SliderOnChangeData) => {
        setStrictness(data?.value ?? 0);
    };

    /**
     * Callback function for handling changes to the "Retrieved Documents" input.
     */
    const onInputChangeStrictness = (_event?: React.ChangeEvent<HTMLInputElement>, data?: InputOnChangeData) => {
        const value = data?.value;
        const intValue = parseInt(value !== undefined ? value.toString() : '0', 10) || 0;
        setStrictness(intValue);
    };

    /**
     * Callback function for handling changes to the "Retrieved Documents" slider.
     */
    const onChangeDocumentCount = (_event?: React.ChangeEvent<HTMLInputElement>, data?: SliderOnChangeData) => {
        setDocumentCount(data?.value ?? 0);
    };

    /**
     * Callback function for handling changes to the "Retrieved Documents" input.
     */
    const onInputChangeDocumentCount = (_event?: React.ChangeEvent<HTMLInputElement>, data?: InputOnChangeData) => {
        const value = data?.value;
        const intValue = parseInt(value !== undefined ? value.toString() : '0', 10) || 0;
        setDocumentCount(intValue);
    };

    /**
     * Callback function for handling changes to the "Past messages included" slider.
     */
    const onChangePastMessagesIncludedCount = (
        _event?: React.ChangeEvent<HTMLInputElement>,
        data?: SliderOnChangeData,
    ) => {
        setPastMessagesIncludedCount(data?.value ?? 0);
    };

    /**
     * Callback function for handling changes to the "Past messages included" input.
     */
    const onInputChangePastMessagesIncludedCount = (
        _event?: React.ChangeEvent<HTMLInputElement>,
        data?: InputOnChangeData,
    ) => {
        const value = data?.value;
        const intValue = parseInt(value !== undefined ? value.toString() : '0', 10) || 0;
        setPastMessagesIncludedCount(intValue);
    };

    /**
     * Callback function for handling changes to the "Max Response" slider.
     */
    const onChangeMaxResponseTokenLimit = (_event?: React.ChangeEvent<HTMLInputElement>, data?: SliderOnChangeData) => {
        setMaxResponseTokenLimit(data?.value ?? 0);
    };

    /**
     * Callback function for handling changes to the "Max Response" input.
     */
    const onInputChangeMaxResponseTokenLimit = (
        _event?: React.ChangeEvent<HTMLInputElement>,
        data?: InputOnChangeData,
    ) => {
        const value = data?.value;
        const intValue = parseInt(value !== undefined ? value.toString() : '0', 10) || 0;
        setMaxResponseTokenLimit(intValue);
    };

    /**
     * Callback function for handling changes to the "Deployment" dropdown.
     */
    const onDeploymentChange = (_event: SelectionEvents, data: OptionOnSelectData) => {
        const obj = JSON.parse(data.optionValue ?? '{}') as unknown as FormattedOpenAIDeployment;
        setDeploymentId(obj.id);
        setCompletionDeploymentName(obj.completionName);
        const outputTokens = chatCompletionDeployments
            .find((d) => d.id === obj.id)
            ?.chatCompletionDeployments.find((a) => a.name === obj.deploymentName)?.outputTokens;
        setDeploymentOutputTokens(outputTokens ?? 4096);
        if (maxResponseTokenLimit && outputTokens && maxResponseTokenLimit > outputTokens) {
            setMaxResponseTokenLimit(outputTokens);
        }
    };

    const determineIfNeedsAttention = React.useCallback(
        (value: string | string[]) => {
            // friendly reminder that !![] === true
            let needsAttention = false;
            if (typeof value === 'string') needsAttention = !value && saveAttempted;
            if (Array.isArray(value))
                needsAttention = (!value.length && saveAttempted) || (value.length === 1 && !value[0] && saveAttempted);

            return needsAttention ? classes.needsAttention : '';
        },
        [classes.needsAttention, saveAttempted],
    );

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
                    className={determineIfNeedsAttention(name)}
                    onChange={(_event, data) => {
                        setName(data.value);
                    }}
                />
                <label htmlFor="label">
                    Label<span className={classes.required}>*</span>
                </label>
                <Input
                    id="label"
                    required
                    className={determineIfNeedsAttention(label)}
                    value={label}
                    onChange={(_event, data) => {
                        setLabel(data.value);
                    }}
                />
                <label htmlFor="deployment">
                    Deployment<span className={classes.required}>*</span>
                </label>
                <Dropdown
                    clearable
                    id="deployment"
                    className={determineIfNeedsAttention(deploymentId)}
                    aria-labelledby={dropdownId}
                    onOptionSelect={onDeploymentChange}
                    value={`${completionDeploymentName} (${chatCompletionDeployments.find((a) => a.id === deploymentId)?.name})`}
                >
                    {completionDeploymentsFormatted.map((deployment) => (
                        <Option key={deployment.id} value={JSON.stringify(deployment)}>
                            {`${deployment.completionName} (${deployment.deploymentName})`}
                        </Option>
                    ))}
                </Dropdown>
                <label htmlFor="index-name">Enrichment Index</label>
                <Dropdown
                    clearable
                    id="index-name"
                    onOptionSelect={onChangeIndexName}
                    value={specializationIndexes.find((index) => index.id === indexId)?.name ?? 'None'}
                >
                    <Option value="">None</Option>
                    {specializationIndexes.map((specializationIndex) => (
                        <Option
                            value={specializationIndex.id}
                            key={specializationIndex.id}
                            text={specializationIndex.name}
                        >
                            {specializationIndex.name}
                        </Option>
                    ))}
                </Dropdown>
                <Row>
                    <Checkbox label="Set as Default Specialization" checked={isDefault} onChange={onChangeIsDefault} />
                    <Checkbox
                        label="Can Generate Images"
                        checked={canGenImages}
                        onChange={(_event, data) => {
                            setCanGenImages(!!data.checked);
                        }}
                    />
                </Row>
                <ConfirmationDialog
                    open={isDeleteDialogOpen}
                    title="Delete Specialization"
                    content={`Are you sure you want to delete the ${name} specialization?`}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setIsDeleteDialogOpen(false);
                    }}
                />
                {hasEnrichmentIndex && (
                    <>
                        <div>
                            <Checkbox
                                label="Limit responses to your data content"
                                checked={restrictResultScope ?? false}
                                onChange={onChangeRestrictResultScope}
                            />
                            <Tooltip
                                content={'Enabling this will limit responses specific to your data content'}
                                relationship="label"
                            >
                                <Button icon={<Info20Regular />} appearance="transparent" />
                            </Tooltip>
                        </div>
                        <div className={classes.slidersContainer}>
                            <label htmlFor="strictness">Strictness (1-5)</label>
                            <div className={classes.slider}>
                                <Slider
                                    id="strictness"
                                    min={1}
                                    max={5}
                                    value={strictness ?? 3}
                                    onChange={onChangeStrictness}
                                />
                                <Input
                                    value={strictness?.toString()}
                                    onChange={onInputChangeStrictness}
                                    type="number"
                                    min={1}
                                    max={5}
                                    className={classes.input}
                                ></Input>
                                <Tooltip
                                    content={
                                        'Strictness sets the threshold to categorize documents as relevant to your queries. Raising strictness means a higher threshold for relevance and filtering out more documents that are less relevant for responses. Very high strictness could cause failure to generate responses due to limited available documents. The default strictness is 3.'
                                    }
                                    relationship="label"
                                >
                                    <Button icon={<Info20Regular />} appearance="transparent" />
                                </Tooltip>
                            </div>
                            <label htmlFor="documentCount">Retrieved Documents (3-20)</label>
                            <div className={classes.slider}>
                                <Slider
                                    id="documentCount"
                                    min={3}
                                    max={20}
                                    value={documentCount ?? 5}
                                    onChange={onChangeDocumentCount}
                                />
                                <Input
                                    value={documentCount?.toString()}
                                    onChange={onInputChangeDocumentCount}
                                    type="number"
                                    min={3}
                                    max={20}
                                    className={classes.input}
                                ></Input>
                                <Tooltip
                                    content={
                                        'This specifies the number of top-scoring documents from your data index used to generate responses. You want to increase the value when you have short documents or want to provide more context. The default value is 5. Note: if you set the value to 20 but only have 10 documents in your index, only 10 will be used.'
                                    }
                                    relationship="label"
                                >
                                    <Button icon={<Info20Regular />} appearance="transparent" />
                                </Tooltip>
                            </div>
                            <label htmlFor="maxResponse">Past messages included (1-100)</label>
                            <div id="maxResponse" className={classes.slider}>
                                <Slider
                                    min={1}
                                    max={100}
                                    value={pastMessagesIncludedCount ?? 10}
                                    onChange={onChangePastMessagesIncludedCount}
                                />
                                <Input
                                    value={pastMessagesIncludedCount?.toString()}
                                    onChange={onInputChangePastMessagesIncludedCount}
                                    type="number"
                                    min={1}
                                    max={100}
                                    className={classes.input}
                                ></Input>
                                <Tooltip
                                    content={
                                        'Select the number of past messages to include in each new API request. This helps give the model context for new user queries. Setting this number to 10 will include 5 user queries and 5 system responses.'
                                    }
                                    relationship="label"
                                >
                                    <Button icon={<Info20Regular />} appearance="transparent" />
                                </Tooltip>
                            </div>
                            <label htmlFor="maxResponse">Max Response (1-{deploymentOutputTokens})</label>
                            <div id="maxResponse" className={classes.slider}>
                                <Slider
                                    min={1}
                                    max={deploymentOutputTokens}
                                    value={maxResponseTokenLimit ?? 1024}
                                    onChange={onChangeMaxResponseTokenLimit}
                                />
                                <Input
                                    value={maxResponseTokenLimit?.toString()}
                                    onChange={onInputChangeMaxResponseTokenLimit}
                                    type="number"
                                    min={1}
                                    max={deploymentOutputTokens}
                                    className={classes.input}
                                ></Input>
                                <Tooltip
                                    content={
                                        "Set a limit on the number of tokens per model response. The supported number of tokens are shared between the prompt (including system message, examples, message history, and user query) and the model's response. One token is roughly 4 characters for typical English text."
                                    }
                                    relationship="label"
                                >
                                    <Button icon={<Info20Regular />} appearance="transparent" />
                                </Tooltip>
                            </div>
                        </div>
                    </>
                )}
                <label htmlFor="description">
                    Short Description<span className={classes.required}>*</span>
                </label>
                <Textarea
                    id="description"
                    required
                    resize="vertical"
                    value={description}
                    className={determineIfNeedsAttention(description)}
                    rows={2}
                    onChange={(_event, data) => {
                        setDescription(data.value);
                    }}
                />
                <label htmlFor="context">
                    Chat Context<span className={classes.required}>*</span>
                </label>
                <Textarea
                    id="context"
                    required
                    resize="vertical"
                    className={determineIfNeedsAttention(roleInformation)}
                    value={roleInformation}
                    rows={Rows}
                    onChange={(_event, data) => {
                        setRoleInformation(data.value);
                    }}
                />
                <label htmlFor="initialMessage">
                    Initial Chat Message<span className={classes.required}>*</span>
                </label>
                <Textarea
                    id="initialMessage"
                    required
                    resize="vertical"
                    value={initialChatMessage}
                    className={determineIfNeedsAttention(initialChatMessage)}
                    rows={2}
                    onChange={(_event, data) => {
                        setInitialChatMessage(data.value);
                    }}
                />
                <label htmlFor="initialMessage">
                    Initial Chat Suggestions<span className={classes.required}>*</span>
                </label>
                <FieldArray
                    values={suggestions}
                    maxItems={4}
                    className={determineIfNeedsAttention(suggestions)}
                    onFieldChanged={(index, newValue) => {
                        const values = suggestions.slice(0);
                        values[index] = newValue;
                        setSuggestions(values);
                    }}
                    onFieldAdded={() => {
                        const values = suggestions.slice(0);
                        values.push('');
                        setSuggestions(values);
                    }}
                    onFieldRemoved={(index) => {
                        setSuggestions(suggestions.slice(0, index).concat(suggestions.slice(index + 1)));
                    }}
                />
                <label htmlFor="membership">
                    Entra Membership IDs<span className={classes.required}>*</span>
                </label>
                <Input
                    id="membership"
                    className={determineIfNeedsAttention(membershipId)}
                    required
                    value={membershipId.join(', ')}
                    onChange={(_event, data) => {
                        if (!data.value) {
                            setMembershipId([]);
                            return;
                        }
                        setMembershipId(data.value.split(', '));
                    }}
                />
                <div className={classes.fileUploadContainer}>
                    <div className={classes.imageContainer}>
                        <label>Specialization Image</label>
                        <ImageUploaderPreview
                            buttonLabel="Upload Image"
                            file={imageFile.file ?? imageFile.src}
                            onFileUpdate={(file, src) => {
                                setImageFile({ file, src });
                            }}
                        />
                    </div>
                    <div className={classes.imageContainer}>
                        <label>Specialization Icon</label>
                        <ImageUploaderPreview
                            buttonLabel="Upload Icon"
                            file={iconFile.file ?? iconFile.src}
                            onFileUpdate={(file, src) => {
                                // Set the src to null if the file is falsy ie: '' or null
                                setIconFile({ file, src: src || null });
                            }}
                        />
                    </div>
                </div>
                <div className={classes.controls}>
                    <Button appearance="secondary" disabled={!id} onClick={onDeleteSpecialization}>
                        Delete
                    </Button>

                    <Button appearance="primary" onClick={onSaveSpecialization}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
