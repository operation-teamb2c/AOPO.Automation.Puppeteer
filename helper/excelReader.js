import fs from 'fs';
import * as XLSX from 'xlsx';

export const readExcelFilebyRow = async (fileName) => {
    const fileContent = fs.readFileSync(fileName);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    jsonData.forEach((item, index) => {
        if (item.hasOwnProperty('Point')) {
            item.pointAmount = item['Point'];
            delete item['Point'];
        }
        if (item.hasOwnProperty('Kupon')) {
            item.couponName = item['Kupon'];
            delete item['Kupon'];
        }
        if (item.hasOwnProperty('Metode Pembayaran')) {
            item.paymentMethod = item['Metode Pembayaran'];
            delete item['Metode Pembayaran'];
        }

        if (typeof item.urlKey === 'string' && typeof item.qty === 'string') {
            try {
                item.urlKey = JSON.parse(item?.urlKey?.trim() ? item?.urlKey?.trim().replace(/'/g, '"') : '[]');
                item.qty = item?.qty ? JSON.parse(item.qty.replace(/'/g, '"')) : '[]';

            } catch (e) {
                console.error(`Error parsing urlKey at index ${index}:`, e);
                item.urlKey = [];
                item.qty = [];

            }
        }

        if (item.hasOwnProperty('Keyword')) {
            item.keyword = item['Keyword'];
            delete item['Keyword'];
        }

        if (item.hasOwnProperty('filter')) {
            if (typeof item.filter === 'string' && item.filter.trim() === '{}') {
                item.filter = {};
            } else if (typeof item.filter === 'string' && item.filter.trim()) {
                try {
                    const originalValue = item.filter;
                    item.filter = JSON.parse(item.filter.replace(/'/g, '"'));
                } catch (e) {
                    console.error(`❌ Error parsing filter at row ${index + 2}:`, e.message);
                    item.filter = {};
                }
            } else if (typeof item.filter !== 'object') {
                item.filter = {};
            }
        }


        if (item.hasOwnProperty('mode')) {
            const modeValue = item.mode?.toString().toLowerCase().trim();
            item.isMobileWeb = modeValue === 'mobile web';
            delete item.mode;
        }

        delete item.__EMPTY;
    });

    if (typeof (jsonData.urlKey) !== 'undefined') {
        jsonData.forEach(sortUrlKeyAndQty);

    }

    return jsonData;

}