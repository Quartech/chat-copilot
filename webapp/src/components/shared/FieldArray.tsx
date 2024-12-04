import { Button, Input, makeStyles } from '@fluentui/react-components';
import { Add20, Dismiss20 } from './BundledIcons';

interface IFieldArray<T> {
    values: T[];
    maxItems: number;
    onFieldChanged: (index: number, newValue: string) => void;
    onFieldAdded: () => void;
    onFieldRemoved: (index: number) => void;
    className?: string;
}

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    fieldElement: {
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
    },
    inputElement: {
        flexGrow: 1,
    },
    addButton: {
        width: '110px',
    },
});

const FieldArray = <T,>(props: IFieldArray<T>) => {
    const classes = useClasses();
    const { values, maxItems, onFieldChanged, onFieldAdded, onFieldRemoved } = props;
    const disableAddButton = values.some((value) => String(value).length < 1) || values.length >= maxItems;
    return (
        <div className={classes.root}>
            {values.map((value, idx) => (
                <div key={`fieldArray-inner-${idx}`} className={classes.fieldElement}>
                    <Input
                        className={props.className}
                        value={String(value)}
                        onChange={(_, data) => {
                            onFieldChanged(idx, data.value);
                        }}
                    />
                    <Button
                        icon={<Dismiss20 />}
                        onClick={() => {
                            onFieldRemoved(idx);
                        }}
                    >
                        Remove
                    </Button>
                </div>
            ))}
            <Button
                disabled={disableAddButton}
                className={classes.addButton}
                onClick={() => {
                    onFieldAdded();
                }}
                icon={<Add20 />}
            >
                Add
            </Button>
        </div>
    );
};

export default FieldArray;
