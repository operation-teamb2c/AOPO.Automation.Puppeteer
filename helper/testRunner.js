import { loginProcess } from "../flow/account.js";
import { orderProcess } from "../flow/e2e.js";
import { durationCalculation, runStep } from "./baseService.js";
import { launchPuppeteerStep } from "./core/launchPuppeteer.js";
import { utcToJakartaISO } from "./date/formatDate.js";

export async function runTestCase(data) {
    const step = [];
    const stepResult = {};
    let result = { start: new Date(), input: data };
    let browser;
    let page;
    let isPageLoaded = false;

    try {
        await runStep(stepResult, step, 'Launch Puppeteer', async () => {
            const { browser: br, page: pg, response } = await launchPuppeteerStep(data);
            browser = br;
            page = pg;
            return response;
        }, { __options: true, scenarioId: data.id });

        const userAgent = await page.evaluate(() => navigator.userAgent);
        const isMobile = await page.evaluate(() => /Mobi|Android|iPhone/i.test(navigator.userAgent));

        isPageLoaded = true;
        const mappingProcess = {
            LOG: loginProcess,
            ODR: orderProcess
        };

        const key = Object.keys(mappingProcess).find(k => data.testCase.includes(k));
        if (key) {
            const testResult = await mappingProcess[key](page, data, browser, step, stepResult);
            Object.assign(result, testResult);
        } else {
            const summaryResult = summarizeResult(stepResult, step);
            Object.assign(result, summaryResult);
        }

        // result = flattenObjectKeys(result, ['summary']);
        result.end = new Date();
        result.timeExecution = await durationCalculation(result.end, result.start);
        // result.dbScenario = buildReportScenario(result, data, userAgent, isMobile);

    } catch (error) {
        console.error(`Error in runTestCase ${data.testCase}:`, error);
        const errorEndTime = new Date();
        const failDuration = durationCalculation(errorEndTime, result.start);

        const errorStepName = !isPageLoaded
            ? 'Launch Puppeteer and Load Site'
            : 'Test Case Failed';
        const errorMessage = !isPageLoaded
            ? `Failed to launch puppeteer or load site: ${error.message}`
            : `Error while running test steps: ${error.message}`;

        const errorStep = {
            name: errorStepName,
            order: 1,
            status: 'Failed',
            log_message: errorMessage,
            start_time: utcToJakartaISO(result.start),
            end_time: utcToJakartaISO(errorEndTime),
            duration_ms: errorEndTime - result.start,
            created_by: process.env.CREATED_BY || 'automation_system',
            test_sub_steps: []
        };

        result.end = errorEndTime;
        result.timeExecution = await durationCalculation(result.end, result.start);

        result.dbScenario = {
            userAgent: 'N/A',
            isMobile: 'N/A',
            code: data.testCase,
            scenario: data.scenario,
            type: data.type,
            status: 'Failed',
            resultCategory: 'failed',
            total_step: 1,
            total_passed: 0,
            total_failed: 1,
            total_failed_expected: 0,
            total_failed_unexpected: 1,
            total_warning: 0,
            total_skipped: 0,
            start_time: utcToJakartaISO(result.start),
            end_time: utcToJakartaISO(result.end),
            created_by: process.env.CREATED_BY || 'automation_system',
            duration_ms: result.end - result.start,
            test_steps: [errorStep]
        };

        result.duration = { [errorStepName]: failDuration };
        result.message = { [errorStepName]: errorMessage };
        result.status = { [errorStepName]: 500 };
    } finally {
        if (browser) await browser.close();
    }

    return result;
}
