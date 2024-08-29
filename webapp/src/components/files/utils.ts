/**
 * Get the formatted file size as string.
 *
 * @param {number} fileSize - Size of file in bytes.
 * @returns {string} Formatted file size.
 */
export const getFormattedFileSize = (fileSize: number) => {
    if (!fileSize) {
        return '0 KB';
    }

    // kilobyte size
    if (fileSize < 1000000) {
        return `${(fileSize / 1000).toFixed(1)} KB`;
    }

    // megabyte size
    if (fileSize < 1000000000) {
        return `${(fileSize / 1000000).toFixed(1)} MB`;
    }

    // gigabyte size
    return `${(fileSize / 1000000000).toFixed(1)} GB`;
};
