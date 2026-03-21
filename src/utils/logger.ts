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
    static logColumns(rows: unknown[][]) {
        // rows: array of arrays, each inner array is one row of values
        const colCount = rows[0].length;

        // Find max width for each column
        const colWidths = Array(colCount).fill(0);
        rows.forEach((row) => {
            row.forEach((cell, i) => {
                colWidths[i] = Math.max(colWidths[i], String(cell).length);
            });
        });

        // Print each row with padding
        rows.forEach((row) => {
            const line = row
                .map((cell, i) => String(cell).padEnd(colWidths[i] + 2, ' '))
                .join('');
            console.log(line);
        });
    }
}

export const logger = Logger;
