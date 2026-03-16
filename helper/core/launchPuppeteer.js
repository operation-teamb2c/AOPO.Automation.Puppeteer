import puppeteer from 'puppeteer';
import { TIMEOUT_CONFIG } from '../config.js';

export async function launchPuppeteerStep(data) {
    const { isMobileWeb = false, keyword, loginType } = data;
    const option = false;
    // const option = 'new';
    const headlessOption = (keyword === 'Gunakan lokasi saya saat ini' || loginType === 'socialGoogle')
        ? false
        : option;

    let browser, page;

    if (isMobileWeb) {
        let devices = puppeteer.devices;
        if (!devices && puppeteer._pptr && puppeteer._pptr.devices) {
            devices = puppeteer._pptr.devices;
        }
        const deviceName = data.deviceName || 'iPhone X';
        if (!devices || !devices[deviceName]) {
            console.error('Device descriptors available:', devices ? Object.keys(devices) : 'undefined');
            throw new Error(`Device descriptor for '${deviceName}' not found. Cek nama device di puppeteer.devices.`);
        }
        const deviceDescriptor = devices[deviceName];
        browser = await puppeteer.launch({
            headless: headlessOption
        });
        page = await browser.newPage();
        await page.emulate(deviceDescriptor);
    } else {
        browser = await puppeteer.launch({
            headless: headlessOption,
            defaultViewport: false,
            args: ['--window-size=1920,1000']
        });

        page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1000
        });
    }

    page.setDefaultTimeout(TIMEOUT_CONFIG.PAGE_DEFAULT);

    return {
        browser,
        page,
        response: {
            status: 200,
            message: 'Successfully launch puppeteer',
            img: {}
        }
    };
}