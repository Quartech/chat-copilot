import React, { useEffect, useId, useState } from 'react';

import { Button, Dropdown, Input, makeStyles, Option, shorthands, Textarea, tokens } from '@fluentui/react-components';
import { useSpecialization } from '../../../libs/hooks';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';

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
});

const Rows = 8;

export const SpecializationManager: React.FC = () => {
    const specialization = useSpecialization();
    const classes = useClasses();

    const [editMode, setEditMode] = useState(false);

    const [id, setId] = useState('');
    const [key, setKey] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [roleInformation, setRoleInformation] = useState('');
    const [indexName, setIndexName] = useState('');
    const [imageFilePath, setImageFilePath] = useState('');

    const dropdownId = useId();
    const { specializations, specializationIndexes, selectedKey } = useAppSelector((state: RootState) => state.admin);

    const onSaveSpecialization = () => {
        if (editMode) {
            void specialization.updateSpecialization(
                id,
                key,
                name,
                description,
                roleInformation,
                indexName,
                imageFilePath,
            );
            resetSpecialization();
        } else {
            void specialization.createSpecialization(key, name, description, roleInformation, indexName, imageFilePath);
            resetSpecialization();
        }
    };

    const resetSpecialization = () => {
        setId('');
        setKey('');
        setName('');
        setDescription('');
        setRoleInformation('');
        setImageFilePath('');
        setIndexName('');
    };

    useEffect(() => {
        if (selectedKey != '') {
            setEditMode(true);
            const specializationObj = specializations.find((specialization) => specialization.key === selectedKey);
            if (specializationObj) {
                setId(specializationObj.id);
                setKey(specializationObj.key);
                setName(specializationObj.name);
                setDescription(specializationObj.description);
                setRoleInformation(specializationObj.roleInformation);
                setImageFilePath(specializationObj.imageFilePath);
                setIndexName(specializationObj.indexName ?? '');
            }
        } else {
            setEditMode(false);
            resetSpecialization();
        }
    }, [editMode, selectedKey, specializations]);

    const onDeleteChat = () => {
        void specialization.deleteSpecialization(id);
        resetSpecialization();
    };

    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        const isValid = !!key && !!name && !!roleInformation;
        setIsValid(isValid);
        return () => {};
    }, [specializations, selectedKey, key, name, roleInformation]);

    return (
        <div className={classes.root}>
            <div className={classes.horizontal}></div>
            <label htmlFor="key">
                Key<span className={classes.required}>*</span>
            </label>
            <Input
                id="key"
                required
                value={key}
                onChange={(_event, data) => {
                    setKey(data.value);
                }}
            />
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
            <label htmlFor="index-name">Index</label>
            <Dropdown
                clearable
                id="index-name"
                aria-labelledby={dropdownId}
                onOptionSelect={(_control, data) => {
                    setIndexName(data.optionValue ?? '');
                }}
                value={indexName}
            >
                {specializationIndexes.map((specializationIndex) => (
                    <Option key={specializationIndex}>{specializationIndex}</Option>
                ))}
            </Dropdown>
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
            <label htmlFor="image-url">Image URL</label>
            <Input
                id="image-url"
                value={imageFilePath}
                onChange={(_event, data) => {
                    setImageFilePath(data.value);
                }}
            />
            <div className={classes.controls}>
                <Button appearance="secondary" disabled={!id} onClick={onDeleteChat}>
                    Delete
                </Button>

                <Button appearance="primary" disabled={!isValid} onClick={onSaveSpecialization}>
                    Save
                </Button>
            </div>
        </div>
    );
};
