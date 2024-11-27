// automtion/postImg.js
const { chromium } = require("playwright");
const { cleanText } = require("../utils/cleanText.js");

// const selectorImg = "img.x85a59c.x193iq5w.x4fas0m.x19kjcj4";
const selectorImg = 'img[data-visualcompletion="media-vc-image"]';

const selectorTitulo =
  "div.xyinxu5.x4uap5.x1g2khh7.xkhd6sd span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.xo1l8bm.xzsf02u";
const selectorLikesImg =
  "div.x6s0dn4.x78zum5.x1iyjqo2.x6ikm8r.x10wlt62 span.xrbpyxo.x6ikm8r.x10wlt62.xlyipyv.x1exxlbk  span.x1e558r4";
const selectorSharesImg =
  "div.x9f619.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.x1qughib.x1qjc9v5.xozqiw3.x1q0g3np.xykv574.xbmpl8g.x4cne27.xifccgj > div:last-of-type div.x9f619.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.x1qughib.x6s0dn4.xozqiw3.x1q0g3np.xwrv7xz.x8182xy.x4cne27.xifccgj > div:nth-of-type(1) span span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs.x1sur9pj.xkrqix3";

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
const postInformation = async (url) => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      // slowMo: 200,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    //Navegar al enlace del post de una página
    await page.goto(url);

    await clickOnSelector(page, "div[aria-label='Cerrar']");

    //Extraer datos en paralelo
    const [imageURL, title, totalLikes, totalShares] = await Promise.all([
      page.$eval(selectorImg, (el) => el.src).catch(() => null),
      page.$eval(selectorTitulo, (el) => el.textContent).catch(() => ""),
      page.$eval(selectorLikesImg, (el) => el.textContent).catch(() => 0),
      page.$eval(selectorSharesImg, (el) => el.textContent).catch(() => 0),
    ]);

    // // extraer la url de la imagen
    // const imageURL = await page
    //   .$eval(selectorImg, (el) => el.src)
    //   .catch(() => null);

    // //Extraer el titulo de la publicación
    // const title = await page
    //   .$eval(selectorTitulo, (el) => el.textContent)
    //   .catch(() => "");

    // //Titulo limpio
    // const tituloPost = cleanText(title);

    // //Extraer la #de reacciones del post
    // const totalLikes = await page
    //   .$eval(selectorLikesImg, (el) => el.textContent)
    //   .catch(() => 0);

    // //Extraer el #de compartidas del post
    // const totalShares = await page
    //   .$eval(selectorSharesImg, (el) => el.textContent)
    //   .catch(() => 0);

    const tituloPost = cleanText(title);

    console.log({
      url,
      imageURL,
      tituloPost,
      totalLikes,
      totalShares,
    });

    return { url, imageURL, tituloPost, totalLikes, totalShares };
  } catch (error) {
    console.log("Error al obtener la URL de la imagen:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Navegador cerrado.");
    }
  }
};

// // Datos Para probar esta funcion
// const informationPost = await postInformation(
//   "https://www.facebook.com/photo/?fbid=122118533834528786&set=gm.3327538297377440&idorvanity=416196628511636"
// );
// console.log(informationPost);

module.exports = { postInformation };
