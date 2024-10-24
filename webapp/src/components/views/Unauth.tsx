import { Body1, Title3 } from '@fluentui/react-components';
import React from 'react';
import { useSharedClasses } from '../../styles';
import { ChatWarningRegular } from '@fluentui/react-icons';

/** Simple component to display when the user is not authorized to view the page. */
export const Unauth: React.FC = () => {
    const classes = useSharedClasses();

    return (
        <div className={classes.informativeView}>
            <ChatWarningRegular fontSize={50} />
            <Title3 className="title">Your account does not belong to the appropriate security group.</Title3>
            <Body1>{'Contact your administrator to verify your account belongs to the "q-pilot" group.'}</Body1>
        </div>
    );
};
