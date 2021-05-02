const puppeteer = require('puppeteer');
const colors = require('colors');
let table = require("table");

(async () => {  // Main

    //---------------------Connect to binance---------------------//
    console.log('Connecting...');
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox","--disable-gpu"] });
    const page = await browser.newPage();
    await page.setViewport({width: 1400, height: 800});

    page.on('console', msg => console.error(msg.text()));

    await page.goto('https://p2p.binance.com/en');

    //---------------------Select crypto currency---------------------//
    // console.log('Select crypto currency...');
    tickerIndexes = 1; // USDT: 1, BTC: 2, BNB: 3, BUSD: 4, ETH: 5, DAI: 6
    await page.waitForSelector(`main > div.css-1u2nsrt > div > div > div.css-8f6za > div > div:nth-child(${tickerIndexes})`);
    await page.click(`main > div.css-1u2nsrt > div > div > div.css-8f6za > div > div:nth-child(${tickerIndexes})`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);

    //---------------------Select fiat for buy---------------------//
    // console.log('Select fiat for buy...');
    await page.click('main > div.css-1u2nsrt > div > div > div.css-1yl7p9 > div > div.css-xbxtuo')
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
    
    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForSelector(`#VND`);
    await page.click(`#VND`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
        // Reading data
        await page.waitForTimeout(500);
        buyVND = await readPagePrices(page);
        await page.waitForTimeout(250);

    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForSelector(`#KRW`);
    await page.click(`#KRW`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
        // Reading data
        await page.waitForTimeout(500);
        buyKRW = await readPagePrices(page);
        await page.waitForTimeout(250);

    //---------------------Select fiat for sell---------------------//
    // console.log('Select fiat for sell...');
    await page.click('main > div.css-1u2nsrt > div > div > div.css-1yl7p9 > div > div.css-yxrkwa')
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
    
    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForSelector(`#KRW`);
    await page.click(`#KRW`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
        // Reading data
        await page.waitForTimeout(500);
        sellKRW = await readPagePrices(page);
        await page.waitForTimeout(250);

    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForSelector(`#VND`);
    await page.click(`#VND`);
    await page.waitForSelector(`main > div.css-16g55fu > div > div.css-vurnku`);
        // Reading data
        await page.waitForTimeout(500);
        sellVND = await readPagePrices(page);
        await page.waitForTimeout(250);

    //---------------------Result---------------------//
    console.log(table.table(makeTableData2(buyVND,sellKRW,5,"VND->KRW")));
    console.log(table.table(makeTableData2(sellVND,buyKRW,5,"KRW->VND")));
    browser.close();
    process.exit(0);
})();

async function readPagePrices(page) {
    return page.evaluate(() => {
      let data = [];
      let elements = document.querySelectorAll('main > div.css-16g55fu > div > div.css-vurnku > div');
      for(let i=0;i<elements.length;i++) {
        let price = elements[i].innerText.split('\n')[4].replace(/,/g, '');
        let limit = elements[i].innerText.split('\n')[9];
        let limit1 = limit.split(' - ')[0].split('.')[0];
        let limit2 = limit.split(' - ')[1].split('.')[0];
        data.push([parseFloat(price),limit1,limit2]);
      }
      return data;
    });
  }

function makeTableData(buyPrice, sellPrice, N, label) {
    let T = new Array(N+1);
    for(let i=0; i<N+1; i++) {
      T[i] = new Array(N+1);
      for(let j=0; j<N+1; j++) {
        T[i][j] = i==0 ? ( j==0 ? label : buyPrice[j-1][0]) 
          : (j==0 ? sellPrice[i-1][0] : (buyPrice[j-1][0]/sellPrice[i-1][0]).toFixed(3));
      }
    }
    return T;
  }

function makeTableData2(buyPrice, sellPrice, N, label) {
    let T = new Array(N+3);
    for(let i=0; i<N+3; i++) {
      T[i] = new Array(N+3);
      for(let j=0; j<N+3; j++) {
        T[i][j] = i<3 ? ( j==1 ? (i==1 ? label : '') : (j>=3 ? buyPrice[j-3][i] : '')) 
          : (j<3 ? sellPrice[i-3][j] : (buyPrice[j-3][0]/sellPrice[i-3][0]).toFixed(3).yellow);
      }
    }
    return T;
  }

