import { runStep, summarizeResult } from "../helper/baseService.js";
import { accessEVChargingStep } from "../helper/core/accessWeb.js";
import { login } from "../interactions/account.js";

export const loginProcess = async (page, data, browser, step = [], stepResult = {}) => {
    const { id: scenarioId, isMobileWeb = false, type, testCase } = data;
    const stop = () => summarizeResult(stepResult, step);


    const accessLoginPage = await runStep(stepResult, step, 'Navigate to Charging Portal', accessEVChargingStep, page, data, { __options: true, scenarioId: data.id });
    if (accessLoginPage.status !== 200) return stop();

    const loginResult = await runStep(stepResult, step, 'Login', login, page, data, { __options: true, scenarioId });
    if (testCase.includes('LOG')) return summarizeResult(stepResult, step);
    
    
    return {
        userID: loginResult?.userID || '',
        loginStatus: loginResult.status === 200 ? 200 : 500,
        loginMessage: loginResult.message || '',
        step,
        stepResult
    }
}