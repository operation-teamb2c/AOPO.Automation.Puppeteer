import { execute, responseUrl, runStep, waitTextExists } from "../helper/baseService.js";
import { fetchUserLocation } from "../helper/fetch.js";

export const chooseCharger = async (page, data) => {
    const isOffline = data?.scenario?.toLowerCase().includes('offline')
        && data?.type?.toLowerCase() === 'negative'
        && data?.expectedFailAt?.toLowerCase() === 'pilih charger';

    return execute(page, 'pilih charger', async (img) => {
        let child = [];
        let childResult = {};

        const checkLocations = await runStep(childResult, child, 'Cek Charger Station', async () => {
            const locationResult = await fetchUserLocation(page, isOffline);
            if (locationResult.isContextError) {
                return {
                    status: 500,
                    message: `Context error while fetching locations: ${locationResult.error}`
                };
            }

            return {
                status: 200,
                message: 'Successfully fetched locations',
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
                // await page.waitForTimeout(1000);

                const chargerUnavailable = await waitTextExists(
                    page,
                    'h2',
                    'Pengisi daya tidak tersedia',
                    4000
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

                if (!successScanQR) {
                    throw new Error('Scan QR not successful');
                }

                const isVisibleInstruction = await page.$('#swal2-html-container') !== null;
                if (isVisibleInstruction) {
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(500);
                }

                return {
                    status: 200,
                    message: 'Successfully choose charger station',
                    data: {
                        chargerStation,
                        connectorType
                    }
                };
            } catch (error) {
                console.log(error.stack);

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

export const submitDataCharging = async (page, data) => {
    return execute(page, 'submit charging', async (img) => {
        let child = [];
        let childResult = {};
        let transactionType = 'Pembayaran';

        const chooseTransactionMethod = await runStep(childResult, child, 'Pilih Metode Transaksi', async () => {

            const transactionType = data.voucherCode ? 'Kode Voucher' : 'Pembayaran';
            if (!data.voucherCode) {
                return {
                    status: 200,
                    message: `Use default method : ${transactionType}`,
                    data: ''
                };
            }

            const voucherTab = await page.waitForSelector('#pills-voucher-tab', { visible: true, timeout: 5000 });
            await page.waitForTimeout(1000);

            await voucherTab.click();

            return {
                status: 200,
                message: `Successfully choose transaction method : ${transactionType}`,
                data: {
                    transactionType
                }
            };
        }, { __options: true, child: true });

        transactionType = chooseTransactionMethod?.data?.transactionType || 'Pembayaran';
        const submitData = await runStep(childResult, child, 'Submit Data Order Charging', async () => {
            console.log('transactionType >>', transactionType);

            if (transactionType === 'Kode Voucher') {
                const voucherInput = await page.waitForSelector('input[placeholder="Input Code"]', { visible: true, timeout: 5000 });
                await page.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), voucherInput);

                await voucherInput.type(data.voucherCode, { delay: 1 });

                await page.waitForTimeout(500);
                const redeemButton = await page.waitForSelector('#tukar_voucher', { visible: true, timeout: 5000 });
                await redeemButton.click();

                const isError = await page.waitForSelector('.swal2-x-mark', {
                    timeout: 5000
                }).then(() => true).catch(() => false);
                console.log(isError);

                if (isError) {
                    const errorMessage = await page.$eval('#swal2-html-container', el => el.textContent.trim());
                    return {
                        status: 500,
                        message: `Failed to redeem voucher: ${errorMessage}`
                    };
                }

                const successSubmit = await waitTextExists(
                    page,
                    'p',
                    'Kode voucher berhasil digunakan',
                    5000
                );

                console.log('successSubmit >>', successSubmit);

                if (successSubmit) {
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(500);
                }

                return {
                    status: 200,
                    message: 'Successfully submit voucher code'
                };
            } else {
                // const paymentMethodSelect = await page.waitForSelector('#payment_method', { visible: true, timeout: 5000 });
                // await paymentMethodSelect.select('e-wallet');
                return {
                    status: 200,
                    message: 'Using default payment method'
                };
            }

        }, { __options: true, child: true });

        return {
            status: submitData.status,
            message: submitData.message,
            data: submitData?.data || {},
            img,
            child,
            childResult
        };
    });

}