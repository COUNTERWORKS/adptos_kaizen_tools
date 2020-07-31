const chromium = require('chrome-aws-lambda');
const https = require('https');
const puppeteer = chromium.puppeteer;

exports.handler = async(event, context) => {

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });


    let page = await browser.newPage();

    const buildingName = event.buildingName;
    const brandName = event.brandName;
    const email = event.email;
    const password = event.password;

    await page.goto('https://accounts.smaregi.jp/login?client_id=pos');
    await page.type('input[name="identifier"]', email);
    await page.type('input[name="password"]', password);

    await Promise.all([
        page.waitForNavigation({waitUntil: ['load', 'networkidle2']}),
        page.click('input[type="submit"]')
    ]);
    await page.goto('https://www1.smaregi.jp/control/sales/dailyTable.html');

    const list = await page.$$('tr.day');

    const targetDate = new Date();
    const year = targetDate.getFullYear();
    const month = ("0"+(targetDate.getMonth() + 1)).slice(-2);
    const day = ("0"+targetDate.getDate()).slice(-2);
    const date = year + '/' + month + '/' + day;

    let target;
    
    
    const table = await page.$$('table[summary]');
    const thead = await table[1].$$('thead');

    const tr = await thead[1].$$('tr');
    const th = await tr[1].$$('th');
    
    let otherIndex;
    let creditIndex;
    let cashIndex;
    const baseIndex = th.length;
    let number = 0;

    for (const node of th) {
        number++;
        switch (await (await node.getProperty('textContent')).jsonValue()) {
            case "その他":
                otherIndex = number;
                break;
            case "現金":
                cashIndex = number;
                break;
            case "クレジット":
                creditIndex = number;
                break;
            default:
                break;
        }
    }

    for (const node of list) {
        const day = await (await (await node.$('span.ymd')).getProperty('textContent')).jsonValue();

        if (day === date) {
            const _node = await node.$$('span.price_format');
            const __node = await node.$$('td.num');

            if (__node.length + _node.length > 0) {
                target = {
                    "targetDate": date,
                    "buildingName": buildingName,
                    "brandName": brandName,
                    "sales": await (await (_node[0].getProperty('textContent'))).jsonValue(),
                    "salesWithoutTax": await (await (_node[1].getProperty('textContent'))).jsonValue(),
                    "cash": await (await (_node[2+cashIndex].getProperty('textContent'))).jsonValue(),
                    "credit": await (await (_node[2+creditIndex].getProperty('textContent'))).jsonValue(),
                    "other": await (await (_node[2+otherIndex].getProperty('textContent'))).jsonValue(),
                    "transactions": await (await (__node[1].getProperty('textContent'))).jsonValue(),
                    "customers": await (await (__node[2].getProperty('textContent'))).jsonValue(),
                    "pricePerCustomer": await (await (_node[2+baseIndex+4].getProperty('textContent'))).jsonValue(),
                    "numberOfSales": await (await (__node[0].getProperty('textContent'))).jsonValue(),
                };
            }
        }
    }

    try {
        await sendRequest(JSON.stringify(target));
    } catch(e) {
        console.log(e)
    }
    return true;
    
};

// これどっかのさいとのコピペ

async function sendRequest(sendData){
    return new Promise(((resolve,reject)=>{
        console.log('Promiseの引数の関数開始');
        let req = https.request({
        host: 'script.google.com',
        path: '/macros/s/AKfycbwF4MxWzRRXn4IWJl3vpBDTwOzZ6VGtCfKLNZKlbigstx537nQ/exec',
        headers: {
            'Content-type': 'application/json',
            'Content-Length': Buffer.byteLength(sendData),
        },
        method: 'POST' }, (response) => {
            console.log('---response---');
            response.setEncoding('utf8');
            let body = '';
            response.on('data', (chunk)=>{
                console.log('chunk:', chunk);
                body += chunk;
            });
            response.on('end', ()=>{
                console.log('end:', body);
                resolve(body);
            });
        }).on('error', (err)=>{
            console.log('error:', err.stack);
            reject(err);
        });
        req.write(sendData);
        req.end();
        console.log('Promiseの引数の関数終了');
    }));
}
