import { TIMEOUT_CONFIG } from "../helper/config.js";

export const accessScanCharging = async (page, data) => {
    try {

        const scanIcon = await page.waitForSelector(
            'a[href*="scan-charging"]',
            { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR }
        );

        await scanIcon.click();
        await page.waitForFunction(() =>
            window.location.pathname === '/user/scan-charging'
        );
        await page.waitForSelector('#qr-video', { visible: true});

        return {
            status: 200,
            message: 'Successfully accessed scan charging page',
            img: {}
        }

    } catch (error) {
        console.log(error.stack);

        return {
            status: 500,
            message: 'Failed to access scan charging page',
            img: {}
        }
    }
}