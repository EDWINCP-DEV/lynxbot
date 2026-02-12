// Usamos la constante PREFIX de tu config
const { PREFIX } = require(`../../config`);

module.exports = {
  name: "hola", 
  description: "Da la bienvenida a Lynx Gaming",
  commands: ["hola", "hi", "bienvenido"], 
  usage: `${PREFIX}hola`,
  
  /**
   * @param {import('../../@types').CommandHandleProps} props
   */
  handle: async ({ sendText }) => {
    // Aquí usamos 'sendText' que es una de las funciones de tu sistema
    await sendText(
      "¡Hola! 🐾 Bienvenido a *Lynx Gaming Bot*.\n\nSoy el asistente oficial de la organización. Actualmente estoy en fase de desarrollo por el equipo de TICs. 💻\n\n¿En qué podemos ayudarte hoy?"
    );
  },
};