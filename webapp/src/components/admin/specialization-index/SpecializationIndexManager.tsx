import { Button, Input, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import React, { useState } from 'react';
import { useSpecializationIndex } from '../../../libs/hooks/useSpecializationIndex';

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

/**
 * "IndexName": "david-probate-files",
  "QueryType": "vector_simple_hybrid", //Supported Options: simple, semantic, vector, vector_simple_hybrid, vector_semantic_hybrid
  "AISearchDeploymentConnection": "searchs-ncus-qsl-openai-001",
  "OpenAIDeploymentConnection": "ncus-qsl-openai-poc",
  "EmbeddingDeployment": "text-embedding-ada-002"
 */

export const SpecializationIndexManager: React.FC = () => {
    const classes = useClasses();
    const indexes = useSpecializationIndex();
    const [name, setName] = useState('');
    const [queryType, setQueryType] = useState('');
    const [aiSearchDeploymentConnection, setAiSearchDeploymentConnection] = useState('');
    const [openAIDeploymentConnection, setOpenAIDeploymentConnection] = useState('');
    const [embeddingDeployment, setEmbeddingDeployment] = useState('');

    const onSaveSpecializationIndex = (): void => {
        void indexes.saveSpecialization({
            id: '',
            name,
            queryType,
            aiSearchDeploymentConnection,
            openAIDeploymentConnection,
            embeddingDeployment,
        });
    };

    return (
        <div className={classes.scrollableContainer}>
            <div className={classes.root}>
                <div className={classes.horizontal}></div>
                <label htmlFor="name">Name</label>
                <Input
                    id="name"
                    required
                    value={name}
                    onChange={(_event, data) => {
                        setName(data.value);
                    }}
                />
                <label htmlFor="queryType">Query Type</label>
                <Input
                    id="queryType"
                    required
                    value={queryType}
                    onChange={(_event, data) => {
                        setQueryType(data.value);
                    }}
                />
                <label htmlFor="aiSearchDeploymentConnection">Search Deployment Connection</label>
                <Input
                    id="aiSearchDeploymentConnection"
                    required
                    value={aiSearchDeploymentConnection}
                    onChange={(_event, data) => {
                        setAiSearchDeploymentConnection(data.value);
                    }}
                />
                <label htmlFor="openAIDeploymentConnection">Open AI Deployment Connection</label>
                <Input
                    id="openAIDeploymentConnection"
                    required
                    value={openAIDeploymentConnection}
                    onChange={(_event, data) => {
                        setOpenAIDeploymentConnection(data.value);
                    }}
                />
                <label htmlFor="embeddingDeployment">Embedding Deployment</label>
                <Input
                    id="embeddingDeployment"
                    required
                    value={embeddingDeployment}
                    onChange={(_event, data) => {
                        setEmbeddingDeployment(data.value);
                    }}
                />
                <div className={classes.controls}>
                    <Button appearance="secondary">Delete</Button>

                    <Button appearance="primary" onClick={onSaveSpecializationIndex}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
