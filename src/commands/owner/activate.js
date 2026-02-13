const { databaseService } = require('../../services/databaseService');

module.exports = {
  name: "activar",
  description: "Activa la licencia en este grupo",
  commands: ["activar", "activate", "init"],
  usage: "/activar",
  
  handle: async ({ remoteJid, userJid, sendText }) => {
    // 1. Verificamos si el usuario que escribe tiene una compra en la DB
    const res = await databaseService.authorizeNewGroup(userJid, remoteJid);

    if (res.success) {
        await sendText(`✅ *¡LynxBot Activado!*\n\nEste grupo ahora cuenta con soporte oficial de Lynx Gaming. Dispones de todos los comandos de tu plan.`);
    } else {
        await sendText(`❌ *Error de Licencia*\n\nDetalle: ${res.message}\n\nContacta al CEO para adquirir un plan.`);
    }
  },
};