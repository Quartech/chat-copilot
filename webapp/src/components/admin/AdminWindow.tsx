import {
    makeStyles,
    SelectTabEventHandler,
    shorthands,
    Tab,
    TabList,
    TabValue,
    tokens,
} from '@fluentui/react-components';

import React from 'react';

import { SpecializationManager } from './specialization/SpecializationManager';

enum AdminWindowTabEnum {
    SPECIALIZATION = 'SPECIALIZATION',
    USERFEEDBACK = 'USERFEEDBACK',
}

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: tokens.colorNeutralBackground3,
        boxShadow: 'rgb(0 0 0 / 25%) 0 0.2rem 0.4rem -0.075rem',
    },
    header: {
        ...shorthands.borderBottom('1px', 'solid', 'rgb(0 0 0 / 10%)'),
        ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
        backgroundColor: tokens.colorNeutralBackground4,
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box',
        width: '100%',
        justifyContent: 'space-between',
    },
    title: {
        ...shorthands.gap(tokens.spacingHorizontalM),
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
    },
});

export const AdminWindow: React.FC = () => {
    const classes = useClasses();
    const [selectedTab, setSelectedTab] = React.useState<TabValue>(AdminWindowTabEnum.SPECIALIZATION);
    const onTabSelect: SelectTabEventHandler = (_event, data) => {
        setSelectedTab(data.value);
    };

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <div className={classes.title}>
                    <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                        <Tab
                            data-testid="specializationTab"
                            id="specialization"
                            value={AdminWindowTabEnum.SPECIALIZATION}
                            aria-label="Specialization Tab"
                            title="Specialization Tab"
                        >
                            Specializations
                        </Tab>
                        <Tab
                            data-testid="userFeedbackTab"
                            id="userFeedback"
                            value={AdminWindowTabEnum.USERFEEDBACK}
                            aria-label="User Feedback Tab"
                            title="User Feedback Tab"
                        >
                            User Feedback
                        </Tab>
                    </TabList>
                </div>
            </div>
            {selectedTab === AdminWindowTabEnum.SPECIALIZATION && <SpecializationManager />}
            {selectedTab === AdminWindowTabEnum.USERFEEDBACK && <></>}
        </div>
    );
};
