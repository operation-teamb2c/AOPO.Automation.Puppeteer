export const accessScanCharging = async (page, data) => {
    try {

        const scanIcon = await page.waitForSelector(
            'a[href*="scan-charging"]',
            { visible: true, timeout: 5000 }
        );

        await scanIcon.click();

        await page.waitForSelector('#pills-scan-qr-tab', { visible: true, timeout: 5000 });
        await page.waitForSelector('#pills-pilih-charger-tab', { visible: true, timeout: 5000 });

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