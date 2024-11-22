import { makeStyles } from '@fluentui/react-components';
import React from 'react';

const useClasses = makeStyles({
    col: {
        display: 'flex',
        flexDirection: 'column',
    },
});

export interface IColProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

// Col component that renders a flex column, useful for aligning items vertically and used in tandem with the Row component
export const Col: React.FC<IColProps> = ({ children, ...rest }) => {
    const classes = useClasses();
    return (
        <div className={classes.col} {...rest}>
            {children}
        </div>
    );
};
