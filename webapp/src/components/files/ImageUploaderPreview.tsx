import {
    Body1Strong,
    Button,
    Card,
    CardFooter,
    CardHeader,
    Image,
    makeStyles,
    Subtitle2,
} from '@fluentui/react-components';
import { DismissFilled, ImageAddRegular } from '@fluentui/react-icons';
import { useRef, useState } from 'react';
import { FileUploader } from '../FileUploader';
import { getFormattedFileSize } from './utils';

const useStyles = makeStyles({
    card: {
        maxWidth: '400px',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    uploadBtn: {
        maxWidth: 'fit-content',
        minWidth: '150px',
    },
});

interface ImageUploaderPreviewProps {
    /**
     * Initial image file to display if exists.
     *
     * @type {File | null | undefined} file
     * @memberof ImageUploaderPreviewProps
     */
    initialFile?: File | null;
    /**
     * The label for the upload button.
     *
     * @type {string} buttonLabel
     * @memberof ImageUploaderPreviewProps
     */
    buttonLabel?: string;
    /**
     * Callback function for file updates ie: file upload or removal.
     *
     * @type {(file: File | null, src: string) => void} onFileUpdate
     * @memberof ImageUploaderPreviewProps
     */
    onFileUpdate?: (file: File | null, src: string) => void;
}

/**
 * ImageUploaderPreview component, handles image upload with preview.
 *
 * @param {ImageUploaderPreviewProps} props
 * @returns {*}
 */
export const ImageUploaderPreview = (props: ImageUploaderPreviewProps) => {
    const classes = useStyles();

    // Set the file state to the initial file if it exists
    const [file, setFile] = useState<File | null>(props.initialFile ?? null);

    const imageUploaderRef = useRef<HTMLInputElement>(null);

    return (
        <>
            {file ? (
                <Card className={classes.card}>
                    <CardHeader
                        action={
                            <Button
                                appearance="transparent"
                                icon={<DismissFilled />}
                                onClick={() => {
                                    setFile(null);
                                    props.onFileUpdate?.(null, '');
                                    // Reset the ref value to allow re-uploading the same file
                                    if (imageUploaderRef.current) {
                                        imageUploaderRef.current.value = '';
                                    }
                                }}
                            >
                                Remove
                            </Button>
                        }
                        header={<Subtitle2>Image Preview</Subtitle2>}
                    />
                    <Image src={URL.createObjectURL(file)} shadow block shape={'rounded'} />
                    <CardFooter className={classes.cardFooter}>
                        <Body1Strong>{file.name}</Body1Strong>
                        <Body1Strong>{getFormattedFileSize(file.size)}</Body1Strong>
                    </CardFooter>
                </Card>
            ) : (
                <Button
                    id="image-upload"
                    className={classes.uploadBtn}
                    icon={<ImageAddRegular />}
                    iconPosition="after"
                    onClick={() => imageUploaderRef.current?.click()}
                >
                    {props.buttonLabel ?? 'Upload Image'}
                </Button>
            )}
            <FileUploader
                ref={imageUploaderRef}
                acceptedExtensions={['.png', '.jpg']}
                onSelectedFile={(file: File) => {
                    const src = URL.createObjectURL(file);
                    props.onFileUpdate?.(file, src);
                    setFile(file);
                }}
            />
        </>
    );
};
