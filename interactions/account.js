import { execute, responseUrl, runStep } from "../helper/baseService.js";

export const login = async (page, data, browser) => {
    return execute(page, 'login', async (img) => {
        const { loginType, username, password, testCase } = data;
        let child = [];
        let childResult = {};

        await runStep(childResult, child, 'Input Username', async () => {
            await page.waitForSelector('#email_phone', {
                visible: true,
                timeout: 5000,
            });
            await page.type('#email_phone', username);
            return {
                status: 200,
                message: 'Successfully input username'
            };
        }, { __options: true, child: true });

        await runStep(childResult, child, 'Input Password', async () => {
            await page.type('#password', password);
            return {
                status: 200,
                message: 'Successfully input password'
            };
        }, { __options: true, child: true });

        const result = await runStep(childResult, child, 'Submit Data Login', async () => {
            const loginButton = await page.waitForSelector('#bLogin', { visible: true, timeout: 7500 });
            const [res] = await Promise.all([
                responseUrl(page, '/auth-login'),
                loginButton.click()
            ]);

            res.status = res.status === 'success' ? 200 : 500;
            if (res.status === 200) res.message = 'Successfully login.'
            return res;
        }, { __options: true, child: true });

        await page.waitForTimeout(500);
        const OKButton = await page.waitForXPath('//button[normalize-space()="OK"]', { visible: true, timeout: 5000 }).catch(() => null);
        if (OKButton) {
            await OKButton.click();
        }

        return {
            status: result.status ,
            message: `${result?.title ||''} ${result?.message || ''}`,
            img,
            child,
            childResult
        };
    });
};