/**
 * Validador de mensajes y Seguridad de Licencias
 * @author Ewin
 */
const { getContent, compareUserJidWithOtherNumber } = require("../utils");
const { errorLog, warningLog } = require("../utils/logger");
const { databaseService } = require('../services/databaseService'); // Importamos el servicio de DB
const {
  readGroupRestrictions,
  readRestrictedMessageTypes,
} = require("../utils/database");
const { BOT_NUMBER, OWNER_NUMBER, OWNER_LID } = require("../config");

exports.messageHandler = async (socket, webMessage) => {
  try {
    if (!webMessage?.key) return;

    const { remoteJid, fromMe, id: messageId } = webMessage.key;

    // 1. Ignorar mis propios mensajes
    if (fromMe) return;

    // 2. VALIDACIÓN DE LICENCIA (SaaS)
    // Solo validamos si es un grupo (@g.us)
    if (remoteJid.endsWith('@g.us')) {
      const isAuth = await databaseService.isGroupAuthorized(remoteJid);
      
      if (!isAuth) {
        // Si el grupo no está en la base de datos, el bot ignora todo.
        // Opcional: Descomenta la siguiente línea para que el bot se salga solo
        // await socket.groupLeave(remoteJid); 
        return; 
      }
    }

    const userJid = webMessage.key?.participant;
    if (!userJid) return;

    // 3. Excepción para el Dueño/Bot (El dueño siempre tiene permiso)
    const isBotOrOwner =
      compareUserJidWithOtherNumber({ userJid, otherNumber: OWNER_NUMBER }) ||
      compareUserJidWithOtherNumber({ userJid, otherNumber: BOT_NUMBER }) ||
      userJid === OWNER_LID;

    if (isBotOrOwner) return;

    // 4. Lógica de Anti-Spam / Restricciones (Lo que ya tenías)
    const antiGroups = readGroupRestrictions();
    const messageType = Object.keys(readRestrictedMessageTypes()).find((type) =>
      getContent(webMessage, type)
    );

    if (!messageType) return;

    const isAntiActive = !!antiGroups[remoteJid]?.[`anti-${messageType}`];
    if (!isAntiActive) return;

    // Ejecutar eliminación
    await socket.sendMessage(remoteJid, {
      delete: {
        remoteJid,
        fromMe,
        id: messageId,
        participant: userJid,
      },
    });

  } catch (error) {
    errorLog(`Error en messageHandler: ${error.message}`);
  }
};