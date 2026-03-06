import path from 'path';
import fs from 'fs';
import { readExcelFilebyRow } from './excelReader.js';

export function parseCommandLineArgs() {
    const nodeCmd = path.basename(process.argv[0]);
    const script = path.basename(process.argv[1]);
    const args = process.argv.slice(2);

    const command = [nodeCmd, script, ...args].join(' ');
    const file = process.argv[2];

    if (!file) {
        console.error('❌ Error: Please provide test file name');
        console.log('Usage: node index.js <filename> [paralel]');
        console.log('Example: node index.js login');
        process.exit(1);
    }

    const runDescription = `Run automation to execute scenarios defined in ${file}.xlsx.`;

    const fileExtension = path.extname(file);
    const baseName = path.basename(file, fileExtension);
    const fileName = fileExtension === '.xlsx' ? file : `${baseName}.xlsx`;
    const filePath = `./test-data/${fileName}`;

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File not found: ${filePath}`);
        process.exit(1);
    }

    return {
        command,
        file,
        fileName,
        filePath,
        runDescription
    };
}

export async function validateAndLoadTestFile(filePath) {
    const inputData = await readExcelFilebyRow(filePath);
    return inputData;
}