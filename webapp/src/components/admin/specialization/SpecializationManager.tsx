import {
    Button,
    Checkbox,
    CheckboxOnChangeData,
    Dropdown,
    Input,
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
import React, { useEffect, useId, useState } from 'react';
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
    const [order, setOrder] = useState(0);

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
                order,
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
                order: specializations.length,
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
                /**
                 * Set the image and icon file paths
                 * Note: The file is set to null because we only retrieve the file path from the server
                 */
                setImageFile({ file: null, src: specializationObj.imageFilePath });
                setIconFile({ file: null, src: specializationObj.iconFilePath });
                setIndexName(specializationObj.indexName);
                setOrder(specializationObj.order);
            }
        } else {
            setEditMode(false);
            resetSpecialization();
        }
    }, [editMode, selectedId, specializations]);

    const onDeleteSpecialization = () => {
        void specialization.deleteSpecialization(id, name);
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
     * Callback function for handling changes to the "Retrieved Documents" slider.
     */
    const onChangeDocumentCount = (_event?: React.ChangeEvent<HTMLInputElement>, data?: SliderOnChangeData) => {
        setDocumentCount(data?.value ?? 0);
    };

    useEffect(() => {
        const isValid =
            !!label && !!name && !!roleInformation && !!description && !!initialChatMessage && membershipId.length > 0;
        setIsValid(isValid);
        return () => {};
    }, [specializations, selectedId, label, name, roleInformation, membershipId, description, initialChatMessage]);

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
                    <div className={classes.slider}>
                        <Slider id="strictness" min={1} max={5} value={strictness} onChange={onChangeStrictness} />
                        <span>{strictness}</span>
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
                            value={documentCount}
                            onChange={onChangeDocumentCount}
                        />
                        <span>{documentCount}</span>
                        <Tooltip
                            content={
                                'This specifies the number of top-scoring documents from your data index used to generate responses. You want to increase the value when you have short documents or want to provide more context. The default value is 5. Note: if you set the value to 20 but only have 10 documents in your index, only 10 will be used.'
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

                    <Button appearance="primary" disabled={!isValid} onClick={onSaveSpecialization}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
