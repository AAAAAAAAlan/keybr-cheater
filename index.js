const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.keybr.com/multiplayer');

  await page.waitForSelector('.Track-ticker');

  const getCurrentWords = async () => {
    const words = await page.evaluate(() => {
      const symbols = Array.from(document.querySelectorAll('.TextInput-fragment'));
      return symbols.map((symbol) => symbol.textContent)[0];
    });
    return words;
  };

  const winTheRace = async (words) => {
    const formatToKeyInput = (word) => {
      if (word === '␣') return 'Space';
      if (word === '↵') return 'Enter';
      return word;
    };
    const formattedWords = words.split('').map((word) => formatToKeyInput(word));

    await page.waitForSelector('.TextInput');
    const textInput = await page.$('.TextInput');
    await textInput.click();
    await page.keyboard.type(formattedWords);

    checkIfRaceStarted();
  };

  const checkIfRaceStarted = async () => {
    await page.waitForTimeout(500);
    const trackTicker = await page.$('.Track-ticker');
    const trackTickerText = await page.evaluate((el) => el.textContent, trackTicker);

    const userName = await page.$$('.UserName-name');
    const userNameText = await page.evaluate((el) => el.textContent, userName[userName.length - 1]);

    console.log('\x1b[36m', `Status: ${trackTickerText}`);
    console.log('\x1b[31m', `Time: ${new Date()}`);
    console.log('\x1b[33m', `Username: ${userNameText}`);
    console.log('\x1b[35m', '=====================================');

    if (trackTickerText !== 'GO!') {
      checkIfRaceStarted();
    } else {
      const words = await getCurrentWords();
      winTheRace(words);
    }
  };

  checkIfRaceStarted();
})();
