// Class for logger
class Logger {
    static log(...data: unknown[]) {
        console.log(...data);
    }

    static warn(...data: unknown[]) {
        console.warn(...data);
    }

    static err(...data: unknown[]) {
        console.error(...data);
    }

    static critical(...data: unknown[]) {
        console.error(...data);
    }

    static info(...data: unknown[]) {
        console.info(...data);
    }
}

export const logger = Logger;
