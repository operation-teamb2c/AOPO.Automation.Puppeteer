export const scrollToTop = async (page) => {
    await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

export const scrollToBottom = async (page) => {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
};

export const scrollIntoView = async (page, element) => {
    await page.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), element);
};
