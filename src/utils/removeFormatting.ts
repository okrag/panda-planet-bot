export const removeFormatting = (string: string) => string.replace(/[_`*\[\]]/g, "\\$&");
