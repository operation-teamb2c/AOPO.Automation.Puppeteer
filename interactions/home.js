import { TIMEOUT_CONFIG } from "../helper/config.js";
import { execute, waitTextExists } from "../helper/baseService.js";

export const accessScanCharging = async (page, data) => {
    return execute(page, 'accessScanCharging', async (img) => {
        const scanIcon = await page.waitForSelector(
            'a[href*="scan-charging"]',
            { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR }
        );

        await scanIcon.click();

        const alertResult = await Promise.race([
            page.waitForFunction(() =>
                window.location.pathname === '/user/scan-charging'
            ).then(() => 'path_changed'),
            page.waitForSelector('#qr-video', { visible: true }).then(() => 'qr_video_found'),
            waitTextExists(
                page,
                'button',
                'Mulai Pengisian',
                TIMEOUT_CONFIG.SELECTOR).then(() => 'order_placed'),
        ]).catch(() => 'timeout');

        if (alertResult === 'order_placed') {
            throw new Error('Cannot access scan charging page because previous order already placed');
        }
        // await page.waitForSelector('#qr-video', { visible: true});


        return {
            status: 200,
            message: 'Successfully accessed scan charging page'
        };
    });
}