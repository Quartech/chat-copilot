import { v4 } from 'uuid';

const getUUID = (): string => {
    return v4();
};

const maxBy = <T>(array: T[], iteratee: (i: T) => number | string) => {
    let result;
    let computed;
    for (const value of array) {
        const current = iteratee(value);

        if (computed === undefined ? current === current : current > computed) {
            computed = current;
            result = value;
        }
    }
    return result;
};

export { getUUID, maxBy };
