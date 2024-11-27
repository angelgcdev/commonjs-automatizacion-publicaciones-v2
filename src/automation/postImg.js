// automtion/postImg.js
const { chromium } = require("playwright");

const selectorImg = 'img[data-visualcompletion="media-vc-image"]';

//****************FUNCIONES************************/

//Funcion para hacer click en un selector con espera
const clickOnSelector = async (page, selector) => {
  try {
    // await page.waitForLoadState("networkidle");
    // await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
  } catch (error) {
    console.log(`Error al hacer click en el selector: ${selector}`, error);
  }
};

//Función principal para extraer la url del post
const postImg = async (url) => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      // slowMo: 0,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    //Navegar al enlace del post de una página
    await page.goto(url);

    await clickOnSelector(page, "div[aria-label='Cerrar']");

    //extraer la url de la imagen
    const imageURL = await page.$eval(selectorImg, (el) => el.src);
    return imageURL;
  } catch (error) {
    console.log("Error al obtener la URL de la imagen:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Navegador cerrado.");
    }
  }
};

module.exports = { postImg };
