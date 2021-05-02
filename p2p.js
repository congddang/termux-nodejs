const puppeteer = require('puppeteer');
let table = require("table");

(async () => {  // Main

    // Connect to binance
    console.log('Connecting...');
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox","--disable-gpu"] });
    const page = await browser.newPage();
    await page.setViewport({width: 1400, height: 800});

    page.on('console', msg => console.error(msg.text()));

    await page.goto('https://p2p.binance.com/en');

    // Select crypto currency
    // console.log('Select crypto currency...');
    tickerIndexes = 1; // USDT: 1, BTC: 2, BNB: 3, BUSD: 4, ETH: 5, DAI: 6
    await page.waitForSelector(`main > div.css-1u2nsrt > div > div > div.css-8f6za > div > div:nth-child(${tickerIndexes})`);
    await page.click(`main > div.css-1u2nsrt > div > div > div.css-8f6za > div > div:nth-child(${tickerIndexes})`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);

    // Select fiat for buy
    // console.log('Select fiat for buy...');
    await page.click('main > div.css-1u2nsrt > div > div > div.css-1yl7p9 > div > div.css-xbxtuo')
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
    

    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForSelector(`#VND`);
    await page.click(`#VND`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
    await page.waitForTimeout(200);
        // Reading data
        buyPrice = await readPagePrices(page);

    // Select fiat for sell
    // console.log('Select fiat for sell...');
    await page.click('main > div.css-1u2nsrt > div > div > div.css-1yl7p9 > div > div.css-yxrkwa')
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
    
    // await page.waitForSelector('#C2Cfiatfilter_searhbox_fiat');
    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForSelector(`#KRW`);
    await page.click(`#KRW`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
    await page.waitForTimeout(200);
        // Reading data
        sellPrice = await readPagePrices(page);

    // Result
    console.log(table.table(makeTableData(buyPrice,sellPrice,5,"VND->KRW")));
    browser.close();
    process.exit(0);
})();


async function readFirstPrice(page) {
    return page.evaluate(() => {
      let data = [];
      let elements = document.querySelectorAll('main > div.css-16g55fu > div > div.css-vurnku > div');
      let price = elements[0].innerText.split('\n')[4].replace(/,/g, '');
      data.push(parseFloat(price));
      return data;
    });
  }

async function readPagePrices(page) {
    return page.evaluate(() => {
      let data = [];
      let elements = document.querySelectorAll('main > div.css-16g55fu > div > div.css-vurnku > div');
      for(let i=0;i<elements.length;i++) {
        let price = elements[i].innerText.split('\n')[4].replace(/,/g, '');
        data.push(parseFloat(price));
      }
      return data;
    });
  }


function makeTableData(buyPrice, sellPrice, N, label) {
    let T = new Array(N+1);
    for(let i=0; i<N+1; i++) {
      T[i] = new Array(N+1);
      for(let j=0; j<N+1; j++) {
        T[i][j] = i==0 ? ( j==0 ? label : buyPrice[j-1] ) : (j==0 ? sellPrice[i-1] : (buyPrice[j-1]/sellPrice[i-1]).toFixed(3));
      }
    }
    return T;
  }

