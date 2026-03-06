import { runStep, summarizeResult } from "../helper/baseService.js";
import { accessEVChargingStep } from "../helper/core/accessWeb.js";
import { login } from "../interactions/account.js";

export const loginProcess = async (page, data, browser, step = [], stepResult = {}) => {
    const { id: scenarioId, isMobileWeb = false, type, testCase } = data;
    const stop = () => summarizeResult(stepResult, step);


    const accessLoginPage = await runStep(stepResult, step, 'Access Astra Otopower', accessEVChargingStep, page, data, { __options: true, scenarioId: data.id });
    if (accessLoginPage.status !== 200) return stop();

    const loginResult = await runStep(stepResult, step, 'Login', login, page, data, { __options: true, scenarioId });
    
    return {
        userID: loginResult?.userID || '',
        loginStatus: loginResult.status === 200 ? 200 : 500,
        loginMessage: loginResult.message || '',
        step,
        stepResult
    }
}