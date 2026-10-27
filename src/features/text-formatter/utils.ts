/** Converts physical line endings into visible, copyable newline escapes. */
export const escapeLineBreaks = (value: string) => value.replace(/\r\n|\r|\n/g, '\\n')

/** Restores newline escape sequences without changing other backslash sequences. */
export const restoreLineBreaks = (value: string) => value.replace(/\\r\\n|\\n|\\r/g, '\n')
