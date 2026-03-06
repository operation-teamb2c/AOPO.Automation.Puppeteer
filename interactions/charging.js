import { execute, responseUrl, runStep, waitTextExists } from "../helper/baseService.js";
import { fetchUserLocation } from "../helper/fetch.js";

export const chooseCharger = async (page, data) => {
    const isOffline = data?.scenario?.toLowerCase().includes('offline')
        && data?.type?.toLowerCase() === 'negative'
        && data?.expectedFailAt?.toLowerCase() === 'pilih charger';

    return execute(page, 'pilih charger', async (img) => {
        let child = [];
        let childResult = {};

        const checkLocations = await runStep(childResult, child, 'Cek Lokasi Charger Station', async () => {
            const locationResult = await fetchUserLocation(page, isOffline);
            if (locationResult.isContextError) {
                return {
                    status: 500,
                    message: `Context error while fetching locations: ${locationResult.error}`
                };
            }

            return {
                status: 200,
                message: 'Successfully fetched available locations',
                data: locationResult
            };
        }, { __options: true, child: true });

        const locationName = checkLocations.data.location;
        const dataConnector = checkLocations.data.connectors[0] || [];
        const { charger, type: connectorType } = dataConnector;

        const chargerStation = `${locationName} - ${charger.split(' - ')[0]}`;

        const selectChargerResult = await runStep(childResult, child, 'Select Charger Tab', async () => {
            try {
                const pilihCharger = await page.waitForSelector('#pills-pilih-charger-tab', { visible: true, timeout: 5000 });
                await pilihCharger.click();

                const chargerContainer = await page.waitForSelector('#select2-charger-container', { visible: true, timeout: 5000 });

                await Promise.all([
                    chargerContainer.click(),
                    page.waitForSelector('input[type="search"]', { visible: true, timeout: 5000 })
                ]);

                await page.type('input[type="search"]', chargerStation, { delay: 1 });
                await Promise.all([
                    page.keyboard.press('Enter'),
                    page.waitForTimeout(1000)
                ]);

                const connectorContainer = await page.waitForSelector('#select2-connectors-container', { visible: true, timeout: 5000 });
                await Promise.all([
                    connectorContainer.click(),
                    page.waitForSelector('input[type="search"]', { visible: true, timeout: 5000 })
                ]);

                await page.type('input[type="search"]', connectorType, { delay: 1 });
                await page.keyboard.press('Enter');

                const submitDataCharger = await page.waitForSelector('#kirim', { visible: true, timeout: 5000 });
                await page.evaluate(el => el.scrollIntoView(), submitDataCharger);

                await submitDataCharger.click();

                const chargerUnavailable = await waitTextExists(
                    page,
                    'h2',
                    'Pengisi daya tidak tersedia',
                    2000
                );

                if (chargerUnavailable) {
                    throw new Error('Pengisi daya tidak tersedia');
                }
                
                const successScanQR = await waitTextExists(
                    page,
                    'h3',
                    'Scan QR Berhasil',
                    5000
                );

                console.log('successScanQR >>', successScanQR);
                await page.waitForTimeout(500000);

                return {
                    status: 200,
                    message: 'Successfully scan charger station',
                    data: {
                        chargerStation,
                        connectorType
                    }
                };
            } catch (error) {
                const isTimeoutError = error.name === 'TimeoutError' || error.message.includes('waiting for selector');
                const errorMessage = isTimeoutError
                    ? 'Success message not found after submitting charger selection - timeout waiting for success confirmation'
                    : error.message;

                return {
                    status: 500,
                    message: errorMessage
                };
            }
        }, { __options: true, child: true });

        return {
            status: selectChargerResult.status,
            message: selectChargerResult.message,
            data: selectChargerResult.data,
            img,
            child,
            childResult
        };
    });

}