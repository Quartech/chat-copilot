import { makeStyles } from '@fluentui/react-components';
import React from 'react';

const useClasses = makeStyles({
    row: {
        display: 'flex',
        flexDirection: 'row',
    },
});

export interface IRowProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

// Row component that renders a flex row, useful for aligning items horizontally and used in tandem with the Col component
export const Row: React.FC<IRowProps> = ({ children, ...rest }) => {
    const classes = useClasses();
    return (
        <div className={classes.row} {...rest}>
            {children}
        </div>
    );
};
