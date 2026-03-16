import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const TIMEOUT_CONFIG = {
    SELECTOR: parseInt(process.env.TIMEOUT_SELECTOR || '10000', 10),
    NAVIGATION: parseInt(process.env.TIMEOUT_NAVIGATION || '10000', 10),
    PAGE_DEFAULT: parseInt(process.env.TIMEOUT_PAGE_DEFAULT || '60000', 10),
    DELAY_SHORT: parseInt(process.env.TIMEOUT_DELAY_SHORT || '150', 10),
    DELAY_MEDIUM: parseInt(process.env.TIMEOUT_DELAY_MEDIUM || '500', 10),
    DELAY_LONG: parseInt(process.env.TIMEOUT_DELAY_LONG || '1000', 10),
    CHARGER_CHECK: parseInt(process.env.TIMEOUT_CHARGER_CHECK || '4000', 10),
    LOGIN: parseInt(process.env.TIMEOUT_LOGIN || '7500', 10),
    QR_SCAN: parseInt(process.env.TIMEOUT_QR_SCAN || '10000', 10)
};
