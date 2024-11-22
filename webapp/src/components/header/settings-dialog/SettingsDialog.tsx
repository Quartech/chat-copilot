// Copyright (c) Microsoft. All rights reserved.

import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Body1,
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogOpenChangeData,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Divider,
    Label,
    makeStyles,
    shorthands,
    Spinner,
    tokens,
} from '@fluentui/react-components';
import React from 'react';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { SharedStyles, useDialogClasses } from '../../../styles';
import { TokenUsageGraph } from '../../token-usage/TokenUsageGraph';
import { SettingSection } from './SettingSection';
import { useChat } from '../../../libs/hooks';
import { Modal } from '../../shared/Modal';

const useClasses = makeStyles({
    root: {
        ...shorthands.overflow('hidden'),
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
    },
    outer: {
        paddingRight: tokens.spacingVerticalXS,
    },
    content: {
        height: '100%',
        ...SharedStyles.scroll,
        paddingRight: tokens.spacingVerticalL,
    },
    footer: {
        paddingTop: tokens.spacingVerticalL,
    },
    deleteAllChats: {
        marginTop: tokens.spacingVerticalL,
    },
});

interface ISettingsDialogProps {
    open: boolean;
    closeSettingsDialog: () => void;
}

export const SettingsDialog: React.FC<ISettingsDialogProps> = ({ open, closeSettingsDialog }) => {
    const classes = useClasses();
    const dialogClasses = useDialogClasses();
    const { serviceInfo, settings, tokenUsage } = useAppSelector((state: RootState) => state.app);
    const { conversations } = useAppSelector((state: RootState) => state.conversations);
    const chat = useChat();
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    // array of all chat ids that can be used to send to backend to delete
    const chatIds = React.useMemo(() => {
        return Object.keys(conversations);
    }, [conversations]);

    const onDeleteAllChats = () => {
        setDeleting(true);
        void chat.deleteAllChats(chatIds).then(() => {
            setDeleting(false);
            setConfirmDeleteDialogOpen(false);
            // create the default chat when all chats are deleted instead of greeting user with blank screen
            chat.createChat('');
        });
    };

    return (
        <>
            <Dialog
                open={open && !confirmDeleteDialogOpen}
                onOpenChange={(_ev: any, data: DialogOpenChangeData) => {
                    if (!data.open) closeSettingsDialog();
                }}
            >
                <DialogSurface className={classes.outer}>
                    <DialogBody className={classes.root}>
                        <DialogTitle>Settings</DialogTitle>
                        <DialogContent className={classes.content}>
                            <TokenUsageGraph tokenUsage={tokenUsage} />
                            <Accordion collapsible multiple defaultOpenItems={['basic']}>
                                <AccordionItem value="basic">
                                    <AccordionHeader expandIconPosition="end">
                                        <h3>Basic</h3>
                                    </AccordionHeader>
                                    <AccordionPanel>
                                        <SettingSection key={settings[0].title} setting={settings[0]} contentOnly />
                                    </AccordionPanel>
                                </AccordionItem>
                                <Divider />
                                <AccordionItem value="advanced">
                                    <AccordionHeader expandIconPosition="end" data-testid="advancedSettingsFoldup">
                                        <h3>Advanced</h3>
                                    </AccordionHeader>
                                    <AccordionPanel>
                                        <Body1 color={tokens.colorNeutralForeground3}>
                                            Some settings are disabled by default as they are not fully supported yet.
                                        </Body1>
                                        {settings.slice(1).map((setting) => {
                                            return <SettingSection key={setting.title} setting={setting} />;
                                        })}
                                    </AccordionPanel>
                                </AccordionItem>
                                <Divider />
                                <AccordionItem value="about">
                                    <AccordionHeader expandIconPosition="end">
                                        <h3>About</h3>
                                    </AccordionHeader>
                                    <AccordionPanel>
                                        <Body1 color={tokens.colorNeutralForeground3}>
                                            Backend version: {serviceInfo.version}
                                            <br />
                                            Frontend version: {process.env.REACT_APP_SK_VERSION ?? '-'}
                                            <br />
                                            {process.env.REACT_APP_SK_BUILD_INFO}
                                        </Body1>
                                    </AccordionPanel>
                                </AccordionItem>
                                <Divider />
                            </Accordion>
                            <Button
                                className={classes.deleteAllChats}
                                onClick={() => {
                                    setConfirmDeleteDialogOpen(true);
                                }}
                                appearance="primary"
                            >
                                {!deleting ? (
                                    'Delete All Chats'
                                ) : (
                                    <>
                                        <Spinner /> Deleting...
                                    </>
                                )}
                            </Button>
                        </DialogContent>
                    </DialogBody>
                    <DialogActions position="start" className={dialogClasses.footer}>
                        <Label size="small" color="brand" className={classes.footer}>
                            Join the Semantic Kernel open source community!{' '}
                            <a href="https://aka.ms/semantic-kernel" target="_blank" rel="noreferrer">
                                Learn More
                            </a>
                        </Label>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary" data-testid="userSettingsCloseButton">
                                Close
                            </Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogSurface>
            </Dialog>
            <Modal
                inProgress={deleting}
                open={confirmDeleteDialogOpen}
                text={
                    !deleting ? (
                        'Are you sure you wish to delete all chats?'
                    ) : (
                        <div>
                            Deleting all chats...
                            <Spinner size="small" />
                        </div>
                    )
                }
                onClose={() => {
                    setConfirmDeleteDialogOpen(false);
                }}
                onConfirm={onDeleteAllChats}
            />
        </>
    );
};
