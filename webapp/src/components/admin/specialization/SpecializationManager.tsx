import React, { useEffect, useId, useState } from 'react';

import {
    Button,
    Checkbox,
    CheckboxOnChangeData,
    Dropdown,
    Input,
    InputOnChangeData,
    makeStyles,
    Option,
    shorthands,
    Slider,
    SliderOnChangeData,
    Textarea,
    tokens,
    Tooltip,
} from '@fluentui/react-components';
import { Info20Regular } from '@fluentui/react-icons';
import { useSpecialization } from '../../../libs/hooks';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { ImageUploaderPreview } from '../../files/ImageUploaderPreview';

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

const Rows = 8;

/**
 * Specialization Manager component.
 *
 * @returns {*}
 */
export const SpecializationManager: React.FC = () => {
    const specialization = useSpecialization();
    const classes = useClasses();

    const { specializations, specializationIndexes, chatCompletionDeployments, selectedId } = useAppSelector(
        (state: RootState) => state.admin,
    );

    const [editMode, setEditMode] = useState(false);

    const [id, setId] = useState('');
    const [label, setLabel] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [roleInformation, setRoleInformation] = useState('');
    const [initialChatMessage, setInitialChatMessage] = useState('');
    const [indexName, setIndexName] = useState('');
    const [deployment, setDeployment] = useState('');
    const [membershipId, setMembershipId] = useState<string[]>([]);
    const [imageFile, setImageFile] = useState<ISpecializationFile>({ file: null, src: null });
    const [iconFile, setIconFile] = useState<ISpecializationFile>({ file: null, src: null });
    const [restrictResultScope, setRestrictResultScope] = useState(false);
    const [strictness, setStrictness] = useState(0);
    const [documentCount, setDocumentCount] = useState(0);
    const [pastMessagesIncludedCount, setPastMessagesIncludedCount] = useState(0);
    const [maxResponseTokenLimit, setMaxResponseTokenLimit] = useState(0);

    const [isValid, setIsValid] = useState(false);
    const dropdownId = useId();

    /**
     * Save specialization by creating or updating.
     *
     * Note: When we save a specialization we send the actual files (image / icon) to the server.
     * On fetch we get the file paths from the Specialization payload and display them.
     *
     * @returns {void}
     */
    const onSaveSpecialization = () => {
        if (editMode) {
            void specialization.updateSpecialization(id, {
                label,
                name,
                description,
                roleInformation,
                indexName,
                imageFile: imageFile.file,
                iconFile: iconFile.file,
                deleteImage: !imageFile.src, // Set the delete flag if the src is null
                deleteIcon: !iconFile.src, // Set the delete flag if the src is null,
                deployment,
                groupMemberships: membershipId,
                initialChatMessage,
                restrictResultScope,
                strictness,
                documentCount,
                pastMessagesIncludedCount,
                maxResponseTokenLimit,
            });
        } else {
            void specialization.createSpecialization({
                label,
                name,
                description,
                roleInformation,
                indexName,
                imageFile: imageFile.file,
                iconFile: iconFile.file,
                deployment,
                groupMemberships: membershipId,
                initialChatMessage,
                restrictResultScope,
                strictness,
                documentCount,
                pastMessagesIncludedCount,
                maxResponseTokenLimit,
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
        setIndexName('');
        setDeployment('');
        setInitialChatMessage('');
        setRestrictResultScope(false);
        setStrictness(3);
        setDocumentCount(5);
        setPastMessagesIncludedCount(10);
        setMaxResponseTokenLimit(1024);
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
                setDeployment(specializationObj.deployment);
                setInitialChatMessage(specializationObj.initialChatMessage);
                setRestrictResultScope(specializationObj.restrictResultScope);
                setStrictness(specializationObj.strictness);
                setDocumentCount(specializationObj.documentCount);
                setPastMessagesIncludedCount(specializationObj.pastMessagesIncludedCount);
                setMaxResponseTokenLimit(specializationObj.maxResponseTokenLimit);
                /**
                 * Set the image and icon file paths
                 * Note: The file is set to null because we only retrieve the file path from the server
                 */
                setImageFile({ file: null, src: specializationObj.imageFilePath });
                setIconFile({ file: null, src: specializationObj.iconFilePath });
                setIndexName(specializationObj.indexName);
            }
        } else {
            setEditMode(false);
            resetSpecialization();
        }
    }, [editMode, selectedId, specializations]);

    const onDeleteChat = () => {
        void specialization.deleteSpecialization(id);
        resetSpecialization();
    };

    /**
     * Callback function for handling changes to the "Limit responses to you data content" checkbox.
     */
    const onChangeRestrictResultScope = (_event?: React.ChangeEvent<HTMLInputElement>, data?: CheckboxOnChangeData) => {
        setRestrictResultScope(!!data?.checked);
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

    useEffect(() => {
        const isValid = !!label && !!name && !!roleInformation && membershipId.length > 0;
        setIsValid(isValid);
        return () => {};
    }, [specializations, selectedId, label, name, roleInformation, membershipId]);

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
                <label htmlFor="label">
                    Label<span className={classes.required}>*</span>
                </label>
                <Input
                    id="label"
                    required
                    value={label}
                    onChange={(_event, data) => {
                        setLabel(data.value);
                    }}
                />
                <label htmlFor="index-name">Enrichment Index</label>
                <Dropdown
                    clearable
                    id="index-name"
                    onOptionSelect={(_control, data) => {
                        setIndexName(data.optionValue ?? '');
                    }}
                    value={indexName}
                >
                    {specializationIndexes.map((specializationIndex) => (
                        <Option key={specializationIndex}>{specializationIndex}</Option>
                    ))}
                </Dropdown>
                <label htmlFor="deployment">Deployment</label>
                <Dropdown
                    clearable
                    id="deployment"
                    aria-labelledby={dropdownId}
                    onOptionSelect={(_control, data) => {
                        setDeployment(data.optionValue ?? '');
                    }}
                    value={deployment}
                >
                    {chatCompletionDeployments.map((deployment) => (
                        <Option key={deployment} value={deployment}>
                            {deployment}
                        </Option>
                    ))}
                </Dropdown>
                <div>
                    <Checkbox
                        label="Limit responses to your data content"
                        checked={restrictResultScope}
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
                    <div id="strictness" className={classes.slider}>
                        <Slider min={1} max={5} value={strictness} onChange={onChangeStrictness} />
                        <Input
                            value={strictness.toString()}
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
                    <div id="documentCount" className={classes.slider}>
                        <Slider min={3} max={20} value={documentCount} onChange={onChangeDocumentCount} />
                        <Input
                            value={documentCount.toString()}
                            onChange={onInputChangeDocumentCount}
                            min={3}
                            max={20}
                            type="number"
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
                            value={pastMessagesIncludedCount}
                            onChange={onChangePastMessagesIncludedCount}
                        />
                        <Input
                            value={pastMessagesIncludedCount.toString()}
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
                    <label htmlFor="maxResponse">Max Response (1-4096)</label>
                    <div id="maxResponse" className={classes.slider}>
                        <Slider
                            min={1}
                            max={4096}
                            value={maxResponseTokenLimit}
                            onChange={onChangeMaxResponseTokenLimit}
                        />
                        <Input
                            value={maxResponseTokenLimit.toString()}
                            onChange={onInputChangeMaxResponseTokenLimit}
                            type="number"
                            min={1}
                            max={4096}
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
                <label htmlFor="description">
                    Short Description<span className={classes.required}>*</span>
                </label>
                <Textarea
                    id="description"
                    required
                    resize="vertical"
                    value={description}
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
                    rows={2}
                    onChange={(_event, data) => {
                        setInitialChatMessage(data.value);
                    }}
                />
                <label htmlFor="membership">
                    Entra Membership IDs<span className={classes.required}>*</span>
                </label>
                <Input
                    id="membership"
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
                        <label htmlFor="image-url">Specialization Image</label>
                        <ImageUploaderPreview
                            buttonLabel="Upload Image"
                            file={imageFile.file ?? imageFile.src}
                            onFileUpdate={(file, src) => {
                                setImageFile({ file, src });
                            }}
                        />
                    </div>
                    <div className={classes.imageContainer}>
                        <label htmlFor="image-url">Specialization Icon</label>
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
                    <Button appearance="secondary" disabled={!id} onClick={onDeleteChat}>
                        Delete
                    </Button>

                    <Button appearance="primary" disabled={!isValid} onClick={onSaveSpecialization}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
