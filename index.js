import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { parseCommandLineArgs, validateAndLoadTestFile } from './helper/cliHandler.js';
import { runTestCase } from './helper/testRunner.js';
dotenv.config();

(async () => {
    const testResults = [];
    const { command, file, filePath, runDescription } = parseCommandLineArgs();
    let inputData = await validateAndLoadTestFile(filePath);
    console.log('inputData: ', inputData);


    for (const data of inputData) {
        console.log(`Start ${data.testCase}. . .`);
        const result = await runTestCase(data);
        testResults.push(result);

        console.log(`${data.testCase} done. . .`);
    }


    // screenshot
    //   await page.screenshot({ path: 'example.png' });
})();