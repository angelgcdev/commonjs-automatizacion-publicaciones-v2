// src/facebookAutomation.js
const { chromium } = require("playwright");
const { pool } = require("../db.js");
const { getIo, userSockets } = require("../socket.js");

/*********VARIABLES***********/

let automationSession = null; // Variable global para almacenar la sesión

const MIN_DELAY = 5000; // Minimo tiempo de espera en milisegundos
const MAX_DELAY = 10000; // Máximo tiempo de espera en milisegundos
const URL = "https://www.facebook.com/";

/*----selectores css----*/
const likeButtonSelector = 'div[aria-label="Me gusta"]';

//Botón Compartir opciones diferentes
const selector1 =
  'div[aria-label="Envía la publicación a amigos o publícala en tu perfil."]';
const selector2 =
  'div[aria-label="Envía esto a tus amigos o publícalo en tu perfil."]';
const selector3 = 'div[aria-label="Compartir"]';

/************FUNCIONES***********/
//Emitir funcion al usuario
const emitirMensajeAUsuario = (userId, mensaje, esError = false) => {
  const io = getIo();
  if (userSockets[userId]) {
    const tipoMensaje = esError ? "automation:error" : "automation:update";
    io.to(userSockets[userId]).emit(tipoMensaje, mensaje);
    console.log(
      `Mensaje ${esError ? "de error" : "enviado"} enviado a usuario ${userId}`
    );
  } else {
    console.log("Usuario no encontrado");
  }
};

//Funcion para inicializar el contexto del navegador
const initBrowser = async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });
  const context = await browser.newContext();

  return { browser, context };
};

//Funcion para cerrar el navegador
const closeBrowser = async (browser, context) => {
  try {
    if (context) {
      await context.close();
      context = null;
    }

    if (browser) {
      await browser.close();
      browser = null;
      console.log("Browser closed.");
    }
  } catch (error) {
    console.error("Error closing browser or context:", error);
  }
};

// Función para obtener un retraso aleatorio
const getRandomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

//Funcion para simular pausas y movimientos del mouse
const humanizeInteraction = async (page) => {
  //Movimientos aleatorios del raton en posiciones de la pagina
  await page.mouse.move(Math.random() * 1000, Math.random() * 800, {
    steps: 20,
  });
  await page.waitForTimeout(getRandomDelay(500, 1500)); //pausa breve
};

//Funcion para hacer click en un selector con espera
const clickOnSelector = async (page, selector, retries = 3) => {
  try {
    await page.waitForTimeout(500); // Espera un poco antes de hacer clic.

    await page.waitForSelector(selector, { timeout: 10000 });
    await humanizeInteraction(page);
    await page.click(selector);
  } catch (error) {
    console.log(
      `Error en clickOnSelector para el selector ${selector}:`,
      error
    );
    // if (retries > 0) {
    //   console.log(
    //     `Retry clicking selector ${selector}. Attempts left: ${retries}`
    //   );
    //   await page.waitForTimeout(getRandomDelay(500, 1000));
    //   return clickOnSelector(page, selector, retries - 1);
    // }
    // throw error;
  }
};

//Funcion para llenar un campo de texto con retrasos, simulados entre caracteres
const fillField = async (page, selector, value) => {
  await page.waitForSelector(selector, { timeout: 10000 }); //Espera hasta 10 segundos
  await humanizeInteraction(page);
  for (const char of value) {
    await page.type(selector, char, { delay: getRandomDelay(50, 150) });
  }
};

//Funcion para iniciar sesion en Facebook
const loginToFacebook = async (page, { email, password }, userId) => {
  try {
    await page.goto(URL);
    await fillField(page, "#email", email);
    await fillField(page, "#pass", password);
    await clickOnSelector(page, "button[name='login']");
    await page.waitForTimeout(5000);

    //Obtenemos a URL de la pagina
    const verifyURL = page.url();

    //Verificar si el usuario esta conectado
    const isLoggedIn = (await page.$('div[aria-label="Tu perfil"]')) !== null;

    if (!isLoggedIn) {
      //Verificar si la URL indica un problema relacionado con el inicio de sesión
      if (verifyURL.startsWith("https://www.facebook.com/login/")) {
        emitirMensajeAUsuario(
          userId,
          `El inicio de sesión con la cuenta ${email} falló: podría tratarse de una contraseña incorrecta u otro problema relacionado con las credenciales.`,
          true
        );
        console.error(
          "Error: Problema detectado en la contraseña durante el inicio de sesión."
        );
        throw new Error("Problema en la contraseña del inicio de sesión.");
      }

      //Verificar si la URL indica un problema relacionado con la autenticación
      if (
        verifyURL.startsWith("https://www.facebook.com/autentication/") ||
        verifyURL.startsWith("https://www.facebook.com/checkpoint/")
      ) {
        emitirMensajeAUsuario(
          userId,
          `El inicio de sesión con la cuenta ${email} falló: Podría ser un problema de autenticación o CAPTCHA.`,
          true
        );
        console.error(
          "Error: Problema detectado en la autenticación o CAPTCHA durante el inicio de sesión."
        );
        throw new Error(
          "Problema en la autenticación o CAPTCHA en el inicio de sesión."
        );
      }
    }

    console.log(`Inicio de sesión con la cuenta ${email}  exitosa.`);
    emitirMensajeAUsuario(
      userId,
      `Inicio de sesión con la cuenta ${email}  exitosa.`
    );
  } catch (error) {
    emitirMensajeAUsuario(
      userId,
      `Error al iniciar sesión con la cuenta ${email} de Facebook`,
      true
    );
    console.error(
      `Error al iniciar sesión con la cuenta ${email} de Facebook`,
      error
    );
    throw new Error(
      "Fallo en el inicio de sesión. Se cancela la automatización."
    );
  }
};

//Funcion para manejar la insercion de reportes a la base de datos
const insertReport = async (post, nombre_grupo, currentDate) => {
  try {
    const { rows } = await pool.query(
      "INSERT INTO reportes (id_publicacion, id_usuario, email, url, url_img, mensaje, nombre_grupo, fecha_publicacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        post.id_publicacion,
        post.id_usuario,
        post.email,
        post.url,
        post.url_img,
        post.mensaje,
        nombre_grupo,
        currentDate,
      ]
    );
    console.log(`Reporte insertado:`, rows[0]);
  } catch (error) {
    console.error("Error al insertar el reporte:", error);
  }
};

//Funcion para manejar el click en el boton like
const handleLikeButton = async (page, selector, userId) => {
  try {
    await page.waitForSelector(selector, { timeout: 15000 });
    const isLiked = await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      return button && button.getAttribute("aria-label") !== "Me gusta";
    }, selector);

    if (!isLiked) {
      await clickOnSelector(page, selector);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
    } else {
      console.log("Me gusta ya está activado");
    }
  } catch (error) {
    console.error("Error al intentar dar me gusta:", error);
  }
};

// Función Principal de automatización de Facebook
const automatizarFacebook = async (post, userId) => {
  let browser, context;
  try {
    //Inicializar el navegador y contexto unicos para esta sesion
    ({ browser, context } = await initBrowser());

    //Almacenar la sesión para usarla luego en cancelAutomation
    automationSession = { browser, context };

    //Crear una nueva pagina
    const page = await context.newPage();

    // Iniciar sesión en Facebook
    emitirMensajeAUsuario(
      userId,
      `Iniciando sesión en Facebook con el correo electrónico ${post.email}. Por favor, espera un momento...`
    );
    console.log(
      `Iniciando sesión en Facebook con el correo electrónico ${post.email}...`
    );
    await loginToFacebook(page, post, userId);

    // Navegar al enlace del post de una página
    emitirMensajeAUsuario(userId, "Navegando al enlace de la publicación...");
    await page.goto(post.url);
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    //Cerrar si hay un modal de aviso
    try {
      await clickOnSelector(page, "div[aria-label='Cerrar']");
    } catch (error) {
      console.error(error);
    }

    //Verificar si ya se dio me gusta
    await handleLikeButton(page, likeButtonSelector, userId);

    // Publicar en los grupos
    for (let i = 1; i <= post.numero_de_posts; i++) {
      const firstSelector = await Promise.race([
        page.waitForSelector(selector1, { timeout: 10000 }),
        page.waitForSelector(selector2, { timeout: 10000 }),
        page.waitForSelector(selector3, { timeout: 10000 }),
      ]);

      if (firstSelector) {
        await firstSelector.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });

        console.log(
          "Se hizo clic en el primer selector(compartir) que se resolvió."
        );
      } else {
        throw new Error("Ningún selector se resolvió a tiempo.");
      }

      try {
        //Click en el boton 'Grupo'
        await clickOnSelector(
          page,
          'div[role="button"] span:has-text("Grupo")'
        );
        await page.waitForLoadState("networkidle", { timeout: 15000 });
      } catch (error) {
        console.error(
          "Error al intentar hacer click en el botón 'Grupo'",
          error
        );

        //-----------------Opcion auxiliar-------------------------------
        try {
          await clickOnSelector(
            page,
            'div[role="button"] span:has-text("Más opciones")'
          );
          await page.waitForLoadState("networkidle", { timeout: 15000 });

          await clickOnSelector(
            page,
            'div[role="button"] span:has-text("Compartir en un grupo")'
          );
          await page.waitForLoadState("networkidle", { timeout: 15000 });
        } catch (error) {
          console.error(error);
        }
        //------------------------------------------------
      }

      await page.waitForSelector('div[role="list"]', { timeout: 10000 });

      const nombre_grupo = await page
        .$eval(
          `div[role="listitem"][data-visualcompletion="ignore-dynamic"]:nth-of-type(${i})
  span[class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 xk50ysn xzsf02u x1yc453h"]`,
          (el) => el.textContent
        )
        .catch(() => "");

      console.log(nombre_grupo);

      await clickOnSelector(
        page,
        `div[role="list"] div[role="listitem"][data-visualcompletion="ignore-dynamic"]:nth-child(${i})`
      );
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      await fillField(
        page,
        'div[aria-label="Crea una publicación pública..."]',
        post.mensaje
      );
      await page.keyboard.press("Space");

      await clickOnSelector(page, 'div[aria-label="Publicar"]');
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      emitirMensajeAUsuario(
        userId,
        `Se compartio ¡exitosamente! la publicación en el grupo: ${nombre_grupo}`
      );

      //Actualizar el reporte de publicaciones en la base de datos
      const currentDate = new Date().toLocaleString("es-ES", {
        timeZone: "America/La_Paz",
      });

      try {
        await insertReport(post, nombre_grupo, currentDate);
      } catch (error) {
        console.error("Error al insertar el reporte:", error);
      }

      // Intervalo de tiempo entre publicaciones
      if (i !== post.numero_de_posts) {
        await page.waitForTimeout(post.intervalo_tiempo * 60000); //intervalo de tiempo entre publicaciones
      }
    }

    // await browser.close();
  } catch (error) {
    console.log("Se ha producido un error:", error);
    throw error;
  } finally {
    closeBrowser(browser, context);
  }
};

//Función para cerrar el navegador
const cancelAutomation = async () => {
  if (
    automationSession &&
    automationSession.browser &&
    automationSession.browser.isConnected()
  ) {
    await closeBrowser(automationSession.browser, automationSession.context);
    automationSession = null; //Resetar la sesion despues de cerrarla
    console.log("Automatizacion cancelada, navegador cerrado.");
  } else {
    console.log("No hay navegador abierto.");
  }
};

module.exports = { automatizarFacebook, cancelAutomation };
