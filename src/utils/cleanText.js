// Función para limpiar el texto de caracteres invisibles y no deseados (emojis, espacios, etc.)
const cleanText = (text) => {
  // Remover Zero Width Space y otros caracteres invisibles
  text = text.replace(/\u200B/g, "");

  // Remover emojis y caracteres especiales
  text = text.replace(/[^\w\sáéíóúüÁÉÍÓÚÜ]/g, "");

  // Limpiar los saltos de línea y los espacios adicionales
  text = text.replace(/\s+/g, " ").trim();

  return text;
};

// const texto =
//   " Aprende a diseñar y liderar proyectos de investigación de alto impacto en diversas áreas, aplicando técnicas innovadoras y rigurosidad académica. 𝗠𝗔𝗘𝗦𝗧𝗥Í𝗔 𝗘𝗡 𝗜𝗡𝗩𝗘𝗦𝗧𝗜𝗚𝗔                  �𝗜ÓÓ𝗡 𝗖𝗜𝗘𝗡𝗧Í𝗙𝗜𝗖𝗔 Modalidad:  #virtual Duración: 18 Meses Carga horaria: 2.880 Horas Académ           icas❯ 𝙍𝙚𝙦𝙪𝙞𝙨𝙞𝙩𝙤 𝙄𝙣𝙙𝙞𝙨𝙥𝙚𝙣𝙨𝙖𝙗𝙡𝙚: Grado académico a nivel Licenciatura****𝐃𝐄𝐒𝐂                          �𝐄𝐍𝐓𝐎𝐒  𝐂𝐎𝐍 𝐎𝐅𝐄𝐑𝐓𝐀 𝐋𝐈𝐌𝐈𝐓𝐀𝐃𝐀*****𝐌Á𝐒 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍: Cel/WhastApp: 7257                                  5125 - https://wa.link/8wvgwg Ú𝒏… Ver más";

// const cleanedText = cleanText(texto);

// console.log('Texto no limpio: ',texto);

// console.log('Texto limpio: ',cleanedText);

module.exports = { cleanText };
