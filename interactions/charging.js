import { execute, responseUrl, runStep, takeScreenshot, waitTextExists } from "../helper/baseService.js";
import { fetchUserLocation } from "../helper/fetch.js";
import { TIMEOUT_CONFIG } from "../helper/config.js";
import { scrollToTop, scrollToBottom, scrollIntoView } from "../helper/scroll.js";
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const chooseCharger = async (page, data) => {
    return execute(page, 'pilih charger', async (img) => {
        let child = [];
        let childResult = {};

        const isOffline = data?.scenario?.toLowerCase().includes('offline')
            && data?.type?.toLowerCase() === 'negative'
            && data?.expectedFailAt?.toLowerCase() === 'select charger & connector';

        const switchTab = await runStep(childResult, child, 'Access Pilih Charger Tab', async () => {
            try {
                await scrollToTop(page);
                const pilihCharger = await page.waitForSelector('#pills-pilih-charger-tab', { visible: true, timeout: TIMEOUT_CONFIG.NAVIGATION });
                await pilihCharger.click();
                await page.waitForSelector('#back', { visible: true, timeout: TIMEOUT_CONFIG.NAVIGATION });

                return {
                    status: 200,
                    message: 'Successfully switched to pilih charger tab'
                };
            } catch (error) {
                const errorMessage = error.message;

                return {
                    status: 500,
                    message: errorMessage
                };
            }
        }, { __options: true, child: true });

        if (switchTab.status !== 200) {
            return {
                status: switchTab.status,
                message: switchTab.message,
                img,
                child,
                childResult
            };
        }

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

        if (checkLocations.status !== 200) {
            return {
                status: checkLocations.status,
                message: checkLocations.message,
                img,
                child,
                childResult
            };
        }

        const locationName = checkLocations.data.location;
        const dataConnector = checkLocations.data.connectors[0] || [];
        const { charger, type: connectorType } = dataConnector;

        const chargerStation = `${locationName} - ${charger.split(' - ')[0]}`;

        const chooseChargerStation = await runStep(childResult, child, 'Choose Charger Station', async () => {
            try {
                const chargerContainer = await page.waitForSelector('#select2-charger-container', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });

                await Promise.all([
                    chargerContainer.click(),
                    page.waitForSelector('input[type="search"]', {
                        visible: true,
                        timeout: TIMEOUT_CONFIG.SELECTOR
                    })
                ]);

                await page.type('input[type="search"]', chargerStation, { delay: 1 });
                await Promise.all([
                    page.keyboard.press('Enter'),
                    page.waitForTimeout(TIMEOUT_CONFIG.DELAY_LONG)
                ]);

                return {
                    status: 200,
                    message: 'Successfully chose charger station'
                };
            } catch (error) {
                const errorMessage = error.message;

                return {
                    status: 500,
                    message: errorMessage
                };
            }
        }, { __options: true, child: true });

        if (chooseChargerStation.status !== 200) {
            return {
                status: chooseChargerStation.status,
                message: chooseChargerStation.message,
                img,
                child,
                childResult
            };
        }

        const chooseConnector = await runStep(childResult, child, 'Choose Connector', async () => {
            try {
                const connectorContainer = await page.waitForSelector('#select2-connectors-container', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await Promise.all([
                    connectorContainer.click(),
                    page.waitForSelector('input[type="search"]', {
                        visible: true,
                        timeout: TIMEOUT_CONFIG.SELECTOR
                    })
                ]);

                await page.type('input[type="search"]', connectorType, { delay: 1 });
                await Promise.all([
                    page.keyboard.press('Enter'),
                    page.waitForTimeout(TIMEOUT_CONFIG.DELAY_LONG)
                ]);

                return {
                    status: 200,
                    message: 'Successfully chose connector'
                };
            } catch (error) {
                const errorMessage = error.message;

                return {
                    status: 500,
                    message: errorMessage
                };
            }
        }, { __options: true, child: true });

        if (chooseConnector.status !== 200) {
            return {
                status: chooseConnector.status,
                message: chooseConnector.message,
                img,
                child,
                childResult
            };
        }

        const submitDataChargingLocation = await runStep(childResult, child, 'Submit Data Charging Location', async () => {
            try {
                const submitDataCharger = await page.waitForSelector('#kirim', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await scrollIntoView(page, submitDataCharger);

                await submitDataCharger.click();
                const alertResult = await Promise.race([
                    waitTextExists(
                        page,
                        'h2',
                        'Pengisi daya tidak tersedia',
                        TIMEOUT_CONFIG.SELECTOR).then(() => 'charger_unavailable'),
                    waitTextExists(
                        page,
                        'h2',
                        'Konektor tidak tersedia',
                        TIMEOUT_CONFIG.SELECTOR).then(() => 'connector_unavailable'),
                    waitTextExists(
                        page,
                        'h3',
                        'Scan QR Berhasil',
                        TIMEOUT_CONFIG.SELECTOR).then(() => 'success')
                ]).catch(() => 'timeout');

                if (alertResult === 'charger_unavailable') {
                    throw new Error('Pengisi daya tidak tersedia');
                }

                if (alertResult === 'connector_unavailable') {
                    throw new Error('Konektor tidak tersedia / Konektor sedang digunakan');
                }

                if (alertResult === 'timeout') {
                    throw new Error(`Timeout awaiting any response after ${TIMEOUT_CONFIG.SELECTOR} ms`);
                }

                // await page.waitForSelector('.swal2-image');

                // await page.waitForFunction(() => {
                //     const img = document.querySelector('.swal2-image');
                //     return img?.complete;
                // }); 
                // await page.waitForSelector('.swal2-popup', { visible: true });
                // await page.waitForSelector('.swal2-confirm', { visible: true });

                // await page.click('.swal2-confirm');
                await page.waitForSelector('.swal2-image');

                await page.waitForFunction(() => {
                    const img = document.querySelector('.swal2-image');
                    return img && img.complete && img.naturalWidth > 0;
                });

                await page.waitForTimeout(1000)
                await page.click('.swal2-confirm');

                return {
                    status: 200,
                    message: 'Successfully submitted connector'
                };
            } catch (error) {
                const errorMessage = error.message;
                img['Error submit charger location'] = await takeScreenshot(page);

                return {
                    status: 500,
                    message: errorMessage,
                    img
                };
            }
        }, { __options: true, child: true });

        return {
            status: submitDataChargingLocation.status,
            message: submitDataChargingLocation.message,
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

            const voucherTab = await page.waitForSelector('#pills-voucher-tab', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
            await page.waitForTimeout(TIMEOUT_CONFIG.DELAY_LONG);

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
            if (transactionType === 'Kode Voucher') {
                const voucherInput = await page.waitForSelector('input[placeholder="Input Code"]', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await scrollIntoView(page, voucherInput);

                await voucherInput.type(data.voucherCode, { delay: 1 });

                await page.waitForTimeout(TIMEOUT_CONFIG.DELAY_MEDIUM);
                const redeemButton = await page.waitForSelector('#tukar_voucher', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await redeemButton.click();

                const isError = await page.waitForSelector('.swal2-x-mark', {
                    timeout: TIMEOUT_CONFIG.SELECTOR
                }).then(() => true).catch(() => false);

                if (isError) {
                    const errorMessage = await page.$eval('#swal2-html-container', el => el.textContent.trim());
                    throw new Error(errorMessage || 'Failed to redeem voucher code');
                }

                const successSubmit = await waitTextExists(
                    page,
                    'p',
                    'Kode voucher berhasil digunakan',
                    TIMEOUT_CONFIG.SELECTOR
                );

                if (successSubmit) {
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(TIMEOUT_CONFIG.DELAY_MEDIUM);
                }
                img['Success order'] = await takeScreenshot(page);


                return {
                    status: 200,
                    message: 'Successfully submit voucher code'
                };
            } else {
                await page.waitForTimeout(1000);
                await scrollToBottom(page);

                await page.click('#lainyaButton');
                const isInputKWh = await waitTextExists(
                    page,
                    'p',
                    'Masukan kWh yang anda inginkan',
                    TIMEOUT_CONFIG.SELECTOR
                );

                if (!isInputKWh) throw new Error('Login element with id #bLogin not found');
                await scrollToBottom(page);
                await page.type('#input_lainya', data.inputKWh.toString(), { delay: 1 });

                await scrollToBottom(page);
                await page.waitForTimeout(1000);
                await page.click('#lanjutP');

                const isPaymentConfirmationPage = await waitTextExists(
                    page,
                    'h3',
                    'Konfirmasi Pembayaran',
                    TIMEOUT_CONFIG.SELECTOR
                );
                if (!isPaymentConfirmationPage) throw new Error('Failed to proceed to payment confirmation page after entering kWh');

                await scrollToBottom(page);
                await page.waitForTimeout(TIMEOUT_CONFIG.DELAY_MEDIUM);

                const choosePaymentMethod = await page.waitForSelector('.btn.btn-success.mb-5', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await choosePaymentMethod.click();

                return {
                    status: 200,
                    message: 'Successfully fill data order charging'
                };
            }

        }, { __options: true, child: true });

        let result = {};
        if (transactionType === 'Pembayaran') {
            const payOrder = await runStep(childResult, child, 'Pilih Metode Pembayaran dan Bayar', async () => {
                const paymentMethods = await page.evaluate(() => {
                    return [...document.querySelectorAll('.accordion-button')].map(btn => {
                        const span = btn.querySelector('span');

                        return {
                            id: btn.id,
                            hasPrice: span && span.textContent.includes('Rp'),
                            price: span ? span.textContent.trim() : null
                        };
                    });
                });

                if (paymentMethods.length === 0) throw new Error('Tidak ada metode pembayaran yang sudah terhubung');

                const selectedPayment = paymentMethods.find(payment => payment.hasPrice);
                if (!selectedPayment) throw new Error('Tidak ada metode pembayaran yang sudah terhubung');

                const paymentButtonSelector = `#${selectedPayment.id}`;
                const paymentButton = await page.waitForSelector(paymentButtonSelector, { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await paymentButton.click();

                await page.waitForTimeout(TIMEOUT_CONFIG.DELAY_MEDIUM);
                const bayarButton = await page.waitForSelector('#pembayarans', { visible: true, timeout: TIMEOUT_CONFIG.SELECTOR });
                await bayarButton.click();

                const isMulaiPengisian = await page.waitForSelector('#btn_start', { visible: true, timeout: TIMEOUT_CONFIG.QR_SCAN }).then(() => true).catch(() => false);
                if (!isMulaiPengisian) throw new Error('Failed to proceed to payment or start charging page after clicking bayar button');
                img['Success order'] = await takeScreenshot(page);

                return {
                    status: 200,
                    message: 'Successfully pay order charging'
                };
            }, { __options: true, child: true });

            result = payOrder;
        } else {
            result = submitData;
        }


        return {
            status: result.status,
            message: result.message,
            data: result?.data || {},
            img,
            child,
            childResult
        };
    });

}