import { endOfHTML, endOfSummary, htmlHeader } from "../../templates/html.js";
import { dateDifference, utcToJakartaISO } from "../date/formatDate.js";
import { constructDetail, constructSummary } from "./builder.js";
import puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { convertToBase64 } from "../baseService.js";

const base64Image = await convertToBase64('./assets/images/AstraOtopower.png');

export function calculateOverallSummary(testResults) {
    const summary = {
        totalScenario: testResults.length,
        passedPositiveScenario: 0,
        passedNegativeExpectedScenario: 0,
        failedScenario: 0,
        totalSteps: 0,
        stepsPassed: 0,
        stepsPassedNegativeExpected: 0,
        stepsFailed: 0,
        stepsWarning: 0,
        stepsSkipped: 0
    };

    for (const result of testResults) {
        const scenario = result?.dbScenario || result?.summary?.dbScenario || '';
        if (scenario) {
            switch (scenario.resultCategory) {
                case 'passed':
                    summary.passedPositiveScenario += 1;
                    break;
                case 'passed_negative_expected':
                    summary.passedNegativeExpectedScenario += 1;
                    break;
                case 'failed':
                    summary.failedScenario += 1;
                    break;
            }

            summary.totalSteps += scenario.total_step || 0;
            summary.stepsPassed += scenario.total_passed || 0;
            summary.stepsPassedNegativeExpected += scenario.total_failed_expected || 0;
            summary.stepsFailed += scenario.total_failed_unexpected || 0;
            summary.stepsWarning += scenario.total_warning || 0;
            summary.stepsSkipped += scenario.total_skipped || 0;
        }
    }

    return summary;
}

const contentHeader = `
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; width: 100%;padding: 0 15px; ">
        <span>
            <i>This is a generated PDF for Automation Test Result B2C AstraOtoshop (https://astraotoshop.com)</i>
        </span>
        <img src="${base64Image}" style="height: 25px; width: auto; margin-left: auto;" />
    </div>
 `;

const contentFooter = `
 <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; width: 100%; padding: 0 20px;">
     <span> <i> Generated on: <span class="date"></span> </i> </span>
     <!-- <span style="text-align: right;"> Page <span class="pageNumber"></span> of <span class="totalPages"></span></span> -->
     <span style="text-align: right;"> Page | <span class="pageNumber"></span></span>
</div>
`
export function collectAllScenarios(testResults) {
    const allTestScenarios = [];

    for (const result of testResults) {
        const scenario = result?.dbScenario || result?.summary?.dbScenario || '';
        if (scenario) {
            const { userAgent, isMobile, total_step, resultCategory, total_failed_expected, total_failed_unexpected, ...cleanScenario } = scenario;
            allTestScenarios.push(cleanScenario);
        }
    }

    return allTestScenarios;
}

export function groupTestResultsByPrefix(testResults) {
    const groupedByPrefix = {};

    testResults.forEach(result => {
        const prefix = result?.input?.testCase?.substring(0, 3) || 'UNK';
        if (!groupedByPrefix[prefix]) {
            groupedByPrefix[prefix] = [];
        }
        groupedByPrefix[prefix].push(result);
    });

    return groupedByPrefix;
}

export function buildReportData({
    command,
    runDescription,
    startDate,
    endDate,
    firstScenario = {},
    scenarios = []
}) {
    const userAgent = firstScenario.userAgent || 'N/A';

    return {
        data: [
            {
                command,
                description: runDescription,
                environment: process.env.ENVIRONMENT,
                user_agent: userAgent,
                channel: firstScenario.isMobile !== undefined ? firstScenario.isMobile ? 'mobile_web' : 'desktop_web' : 'N/A',
                platform: 'Web Desktop',
                start_time: utcToJakartaISO(startDate),
                end_time: utcToJakartaISO(endDate),
                status: 'Passed',
                created_by: process.env.CREATED_BY || 'automation_system',
                duration_ms: new Date(endDate) - new Date(startDate),
                test_scenarios: scenarios
            }
        ]
    };
}
export async function generatePDFReports(prefixes, groupedByPrefix, file, runId) {
    const attachments = [];

    for (const prefix of prefixes) {
        const prefixResults = groupedByPrefix[prefix];

        let totalDurationMs = prefixResults.reduce((sum, item) => {
            return sum + (item?.dbScenario?.duration_ms ?? 0);
        }, 0);
        totalDurationMs = `${(totalDurationMs / 1000).toFixed(2)}s`;

        let summaryHTML = htmlHeader(prefix, totalDurationMs, runId);
        let detailHTML = '';

        for (const result of prefixResults) {
            let data = (({ duration, status, message }) => ({ duration, status, message }))(result);
            // if (result?.input?.testCase?.includes('ODR')) data = fillDefaultAfterFailure(data);

            summaryHTML += await constructSummary(result);
            detailHTML += await constructDetail(result);
        }

        summaryHTML += endOfSummary;
        const finalHTML = summaryHTML + detailHTML + endOfHTML;

        console.log(`generating pdf report for ${prefix}...`);
        const prefixFileName = prefixes.length > 1 ? `${file}_${prefix}` : file;
        const pdfFile = await generatePdf(finalHTML, prefixFileName.toUpperCase());

        attachments.push({
            filename: path.basename(pdfFile),
            path: pdfFile
        });
    }

    return attachments;
}

export async function generateAndSendReport(testResults, params) {
    const { inputData, file, startDate, command, runDescription } = params;

    // Collect scenarios
    const allTestScenarios = collectAllScenarios(testResults);

    // Group results by prefix
    const groupedByPrefix = groupTestResultsByPrefix(testResults);
    const prefixes = Object.keys(groupedByPrefix);

    // Build report data
    const firstScenario = testResults[0]?.dbScenario || {};
    const endDate = new Date();
    const reportData = buildReportData({
        command,
        runDescription,
        startDate,
        endDate,
        firstScenario,
        scenarios: allTestScenarios
    });

    // Save report and get runId
    // console.log('📤 Posting report to API...');
    let runId = '';
    // runId = await saveTestDocument(reportData);
    // console.log(`✅ Retrieved runId: ${runId}`);

    // Generate PDF reports
    const attachments = await generatePDFReports(prefixes, groupedByPrefix, file, runId);

    // Calculate overall summary
    const overallSummary = calculateOverallSummary(testResults);

    // Save report.json
    fs.writeFileSync(
        './report.json',
        JSON.stringify(reportData, null, 2),
        'utf8'
    );

    const dateDiff = dateDifference(endDate, startDate);
    const runtime = { startDate, endDate, dateDiff };

    // Extract failed scenarios
    const failedScenarios = testResults.filter(result =>
        result?.dbScenario?.resultCategory === 'failed'
    );

    console.log('sending email ...');
    // await sendMail(attachments, runtime, failedScenarios, overallSummary);

    return {
        reportData,
        runId,
        attachments,
        overallSummary,
        runtime
    };
}

export const generatePdf = async (content, scenario, paymentMethod, pointAmount, couponUsed) => {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: false,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    let htmlFilePath = "";
    let pdfFilePath = "";

    const date = new Date();
    // const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    // let folder = process.env.BASE_DIRECTORY + formattedDate;

    const folder = path.join(
        process.env.BASE_DIRECTORY,
        date.getFullYear().toString(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    );

    // await fs.access(folder, function (err) {
    //     if (err && err.code === 'ENOENT') {
    //         fs.mkdir(folder, { recursive: true }, (err) => {
    //             if (err) throw err;
    //         })
    //     }
    // });
    fs.mkdir(folder, { recursive: true }, (err) => {
        if (err) {
            console.error('Create folder failed:', err);
            return;
        }
    });

    pdfFilePath = folder + '/' + scenario + '_' + date.toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/:/g, '') + '.pdf';

    await page.setContent(content, {
        waitUntil: "networkidle2"
    });


    await page.waitForTimeout(1000);

    await fs.promises.writeFile(folder + '/' + scenario + '.html', content);
    await page.waitForTimeout(150)

    await page.pdf({
        path: pdfFilePath,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: contentHeader,
        footerTemplate: contentFooter,
        margin: {
            top: '90px',
            bottom: '90px'
        }
    });
    console.log('PDF file has been generated!');
    await browser.close();
    return pdfFilePath;
}
