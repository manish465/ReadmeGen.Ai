export const unescapeString = (escapedStr: string) => {
    return escapedStr.replace(/\\n/g, '\n');
};
