const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
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

    console.log(`Status: ${trackTickerText}`, '\n', `Time: ${new Date()}`);

    if (trackTickerText !== 'GO!') {
      checkIfRaceStarted();
    } else {
      const words = await getCurrentWords();
      winTheRace(words);
    }
  };

  checkIfRaceStarted();
})();
