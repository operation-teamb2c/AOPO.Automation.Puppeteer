export async function fetchUserLocation(page, isOffline = false) {
    return await page.evaluate(async (isOffline) => {

        async function getHTML(url) {
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            return await res.text();
        }
        

        async function findLocation(isOffline) {
            let currentPage = 1;

            while (true) {
                const html = await getHTML(`/user/location?page=${currentPage}`);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const cards = doc.querySelectorAll('.card');

                for (let card of cards) {
                    const nameEl = card.querySelector('b');
                    const statusEl = card.querySelector('p[style*="color"]');
                    const detailLink = card.querySelector('a.btn-success');

                    if (!nameEl || !statusEl || !detailLink) continue;

                    const status = statusEl.textContent.trim().toLowerCase();

                    // logic based on isOffline
                    if (isOffline) {
                        if (status === 'offline') {
                            return {
                                name: nameEl.textContent.trim(),
                                detailUrl: detailLink.href,
                                page: currentPage
                            };
                        }
                    } else {
                        if (status !== 'offline') {
                            return {
                                name: nameEl.textContent.trim(),
                                detailUrl: detailLink.href,
                                page: currentPage
                            };
                        }
                    }
                }

                const nextBtn = doc.querySelector('.pagination a[aria-label="Next"]');
                if (!nextBtn) break;

                currentPage++;
            }

            return null;
        }

        const location = await findLocation(isOffline);

        if (!location) {
            return { found: false };
        }

        // 🔥 Fetch Detail Page
        const detailHTML = await getHTML(location.detailUrl);
        const parser = new DOMParser();
        const detailDoc = parser.parseFromString(detailHTML, 'text/html');

        let connectors = [];

        const overviewTitle = Array.from(detailDoc.querySelectorAll('b'))
            .find(el => el.textContent.trim() === 'Overview');

        if (overviewTitle) {

            const overviewSection = overviewTitle.closest('.row').nextElementSibling;

            let currentCharger = null;

            const rows = overviewSection.parentElement.querySelectorAll('.row');

            rows.forEach(row => {

                const chargerEl = row.querySelector('.col-12');

                if (chargerEl && !row.querySelector('.col-7')) {

                    const text = chargerEl.textContent.trim();

                    // hanya set charger jika formatnya charger
                    if (text.includes(' - ')) {
                        currentCharger = text;
                    }
                }

                const connector = row.querySelector('.col-7');
                if (connector && currentCharger) {
                    const type = connector.childNodes[0]?.textContent?.trim();
                    const status = connector.querySelector('span')?.textContent.trim();

                    const connectorOffline = status?.toLowerCase() === 'offline';

                    if (connectorOffline === isOffline) {
                        connectors.push({
                            charger: currentCharger,
                            type,
                            status
                        });
                    }
                }

            });

            const unique = new Map();

            connectors.forEach(c => {
                unique.set(`${c.charger}-${c.type}`, c);
            });

            connectors = [...unique.values()];
        }

        return {
            found: true,
            page: location.page,
            location: location.name,
            connectors
        };
    }, isOffline);
}