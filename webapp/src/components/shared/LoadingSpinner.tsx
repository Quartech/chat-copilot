import { makeStyles, Spinner } from '@fluentui/react-components';
import { useAppSelector } from '../../redux/app/hooks';
import { RootState } from '../../redux/app/store';

const useClasses = makeStyles({
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

/**
 * A component that displays a loading spinner overlay when the app is in a loading state.
 * Uses the Fluent UI Spinner component for the loading indicator.
 *
 * @component
 */
const LoadingSpinner = () => {
    const classes = useClasses();

    const isLoading = useAppSelector((state: RootState) => state.app.isLoading);
    if (!isLoading) return null; // Return null if not loading to avoid unnecessary renders

    return (
        <div className={classes.overlay}>
            <Spinner />
        </div>
    );
};

export default LoadingSpinner;
