const { databaseService } = require('../services/databaseService');
const { OWNER_NUMBER, PREFIX } = require("../config");

exports.messageHandler = async (socket, webMessage) => {
    try {
        if (!webMessage?.key) return;
        const { remoteJid } = webMessage.key;
        const userJid = webMessage.key?.participant || remoteJid;

        // Limpiamos los números para comparar (solo dígitos)
const cleanUser = userJid.replace(/\D/g, '');
const cleanOwner = OWNER_NUMBER.replace(/\D/g, '');

// Si eres tú, retornamos "OWNER" para que el bot te dé superpoderes
if (cleanUser.includes(cleanOwner) || cleanOwner.includes(cleanUser)) {
    return "OWNER";
}
        // Lógica para el resto de los mortales (Grupos SaaS)
        if (remoteJid.endsWith('@g.us')) {
            const isAuth = await databaseService.isGroupAuthorized(remoteJid);
            const messageText = (webMessage.message?.conversation || webMessage.message?.extendedTextMessage?.text || "").trim().toLowerCase();
            const isActivating = messageText.startsWith(`${PREFIX}activar`);

            if (!isAuth && !isActivating) {
                return "BLOCKED"; 
            }
        }
    } catch (error) {
        console.error("Error en Handler:", error);
    }
};