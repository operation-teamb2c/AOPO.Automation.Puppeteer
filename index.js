import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { parseCommandLineArgs, validateAndLoadTestFile } from './helper/cliHandler.js';
import { runTestCase } from './helper/testRunner.js';
import { generateAndSendReport } from './helper/report/generator.js';
dotenv.config();

(async () => {
    const startDate = new Date();
    const testResults = [];
    const { command, file, filePath, runDescription } = parseCommandLineArgs();
    let inputData = await validateAndLoadTestFile(filePath);


    for (const data of inputData) {
        console.log(`Start ${data.testCase}. . .`);
        const result = await runTestCase(data);
        testResults.push(result);

        console.log(`${data.testCase} done. . .`);
    }

    console.log('testResults >>', testResults);
    
    await generateAndSendReport(testResults, {
        inputData,
        file,
        startDate,
        command,
        runDescription
    });

    // screenshot
    //   await page.screenshot({ path: 'example.png' });
})();