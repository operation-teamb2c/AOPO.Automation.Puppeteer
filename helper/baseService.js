import { utcToJakartaISO } from "./date/formatDate.js";

export const runStep = async (stepResult, step, name, fn, ...argsAndOptions) => {
    let options = {};
    const lastArgs = argsAndOptions[argsAndOptions.length - 1];

    if (typeof lastArgs === 'object' && lastArgs?.__options === true) {
        options = argsAndOptions.pop();
        delete options.__options;
    }
    const {
        merge = true,
        mergeInternal = false,
        child = false,
        scenarioId = null
    } = options;
    const stepId = crypto.randomUUID();

    const startTime = new Date();
    const res = await fn(...argsAndOptions);
    const endTime = new Date();


    let finalRes = res;
    if (child) {
        finalRes = {
            status: res.status ?? 500,
            message: res.message ?? (res.status === 200 ? 'success' : 'failed'),
            stepId: stepId,
            subStepId: crypto.randomUUID()
        };
        console.log(`--- ${name}`);
    } else {
        finalRes.stepId = stepId;
        finalRes.scenarioId = scenarioId;
        console.log(`✅ Step done: ${name}`);
    }
    finalRes.start_time = utcToJakartaISO(startTime);
    finalRes.end_time = utcToJakartaISO(endTime);
    finalRes.durationMs = endTime - startTime;

    if (merge) {
        stepResult[name] = finalRes;
        step.push(name);
    }

    if (mergeInternal && res) {
        if (res.stepResult) Object.assign(stepResult, res.stepResult);
        if (Array.isArray(res.step)) step.push(...res.step);
    }

    return res;
};

export const durationCalculation = (end, start) => {
    let diff = end - start;
    let duration;

    if (diff > 1000) {
        duration = (diff / 1000).toFixed(2);

        return `${duration} s`
    }

    return `${diff.toFixed(2)} ms`;
}

export const summarizeResult = (stepResult, step) => {

    const result = { duration: {}, message: {}, status: {}, img: {}, child: {}, childResult: {}, dbStep: [] };

    step.forEach((stepName, stepOrder) => {
        const r = stepResult[stepName] ?? {};
        // result.duration[s] = r.duration;
        result.duration[stepName] = formatDuration(r.durationMs);
        result.message[stepName] = r.message;
        result.status[stepName] = r.status;

        if (r.img && Object.keys(r.img).length > 0) {
            result.img[stepName] = r.img;
        }

        result.child[stepName] = r.child ?? [];
        result.childResult[stepName] = r.childResult ?? {};

        const test_sub_steps = [];
        if (Array.isArray(r.child) && r.child.length > 0) {
            r.child.forEach((childName, order) => {
                const childData = r.childResult?.[childName];
                if (childData) {
                    test_sub_steps.push({
                        name: childName,
                        order: order + 1,
                        status: mapStatusCode(childData.status),
                        log_message: childData.message || '',
                        start_time: childData.start_time,
                        end_time: childData.end_time,
                        duration_ms: childData.durationMs,
                        created_by: process.env.CREATED_BY || 'automation_system'
                    });
                }
            });
        }

        result.dbStep.push({
            // id: r.stepId,
            // scenario_id: r.scenarioId,
            name: stepName,
            order: stepOrder + 1,
            status: r.status,
            // status: mapStatusCode(r.status),
            log_message: r.message,
            start_time: r.start_time,
            end_time: r.end_time,
            duration_ms: r.durationMs,
            created_by: process.env.CREATED_BY || 'automation_system',
            test_sub_steps: test_sub_steps
        });
    });

    return result;
};

export const formatDuration = (durationMs) => {
    if (durationMs == null) return '';
    return durationMs >= 1000
        ? `${(durationMs / 1000).toFixed(2)} s` // konversi ke detik, 2 desimal
        : `${durationMs} ms`; // tetap milidetik
}
export const execute = async (page, actionName, fn) => {
    const start = performance.now();
    let img = {};

    try {
        const result = await fn(img);

        return {
            ...result,
            img,
            duration: durationCalculation(performance.now(), start)
        };

    } catch (error) {
        console.log(`Error in ${actionName} : ${error.stack}`);
        img[`${actionName}_failed`] = await takeScreenshot(page);

        return {
            status: 500,
            message: error.message,
            img,
            duration: durationCalculation(performance.now(), start)
        };
    }
};

export const responseUrl = async (page, xhr, payloadKey = null, payloadValue = null) => {
    const checkUrl = page.waitForResponse(async (r) => {
        if (r.request().method() === "OPTIONS") return false;

        const urlMatch = r.request().url().includes(xhr);
        if (!urlMatch) return false;

        // jika tidak filtering payload → return true langsung
        if (!payloadKey) return true;

        const postData = r.request().postData();
        if (!postData) return false;

        let body;
        try {
            body = JSON.parse(postData);
        } catch (err) {
            return false;
        }

        return body?.[payloadKey] === payloadValue;
    });

    const res = await checkUrl;
    return res.json();
};

export const validateVisibleSelectors = async (page, selectors, timeout = 5000) => {
    try {
        for (const selector of selectors) {
            await page.waitForSelector(selector, { visible: true, timeout });
        }
        return true;
    } catch {
        return false;
    }
};

export async function waitTextExists(page, selector, text, timeout = 5000) {
    try {
        await page.waitForFunction(
            ({ selector, text }) => {
                const elements = [...document.querySelectorAll(selector)];
                return elements.some(el =>
                    el.textContent.toLowerCase().includes(text.toLowerCase())
                );
            },
            { timeout },
            { selector, text }
        );

        return true;
    } catch {
        return false;
    }
}