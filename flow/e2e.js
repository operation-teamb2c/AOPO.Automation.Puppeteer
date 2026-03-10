import { runStep, summarizeResult } from "../helper/baseService.js";
import { accessEVChargingStep } from "../helper/core/accessWeb.js";
import { fetchUserLocation } from "../helper/fetch.js";
import { login } from "../interactions/account.js";
import { chooseCharger, submitDataCharging } from "../interactions/charging.js";
import { accessScanCharging } from "../interactions/home.js";

export const orderProcess = async (page, data, browser, step = [], stepResult = {}) => {
    const { isMobileWeb = false, id: scenarioId } = data;
    let products = {}
    const options = {
        __options: true,
        merge: false,
        mergeInternal: true,
        scenarioId
    };

    const stop = () => summarizeResult(stepResult, step);

    const accessLoginPage = await runStep(stepResult, step, 'Navigate to Charging Portal', accessEVChargingStep, page, data, { __options: true, scenarioId: data.id });
    if (accessLoginPage.status !== 200) return stop();

    const loginResult = await runStep(stepResult, step, 'Login', login, page, data, { __options: true, scenarioId });
    if (loginResult.status !== 200) return stop();

    const accessScanChargingResult = await runStep(stepResult, step, 'Access Scan Charging Page', accessScanCharging, page, { __options: true, scenarioId });
    if (accessScanChargingResult.status !== 200) return stop();

    const chooseChargerResult = await runStep(stepResult, step, 'Select Charger & Connector', chooseCharger, page, data, { __options: true, scenarioId });
    if (chooseChargerResult.status !== 200) return stop();

    const orderCharging = await runStep(stepResult, step, 'Confirm Payment & Submit Order', submitDataCharging, page, data, { __options: true, scenarioId });
    if (orderCharging.status !== 200) return stop();
    
    return {
        summary: stop(),
        products: products,
        orderDetail: orderCharging?.data || {}
    };
}