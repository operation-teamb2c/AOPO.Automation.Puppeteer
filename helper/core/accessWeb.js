import puppeteer from 'puppeteer';

export async function accessEVChargingStep(page) {
    await page.goto(process.env.BASE_URL, { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('#bLogin', { visible: true });
    const loginElement = await page.$('#bLogin');
    if (!loginElement) {
        throw new Error('Login element with id #bLogin not found');
    }

    return {
        status: 200,
        message: `Successfully load ${process.env.BASE_URL}`,
        img: {}
    };
}