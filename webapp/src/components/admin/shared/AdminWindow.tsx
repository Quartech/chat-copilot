import { makeStyles, tokens } from '@fluentui/react-components';

import React, { PropsWithChildren } from 'react';

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: tokens.colorNeutralBackground3,
        boxShadow: 'rgb(0 0 0 / 25%) 0 0.2rem 0.4rem -0.075rem',
    },
});

export const AdminWindow: React.FC<PropsWithChildren> = (props) => {
    const classes = useClasses();

    return <div className={classes.root}>{props.children}</div>;
};
