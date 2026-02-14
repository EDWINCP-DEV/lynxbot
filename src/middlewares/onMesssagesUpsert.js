/**
 * Evento llamado cuando un mensaje
 * es enviado al grupo de WhatsApp
 *
 * @author Dev Gui & Ewin
 */
const {
  isAtLeastMinutesInPast,
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
} = require("../utils");
const { DEVELOPER_MODE } = require("../config");
const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { onGroupParticipantsUpdate } = require("./onGroupParticipantsUpdate");
const { errorLog, infoLog } = require("../utils/logger");
const { badMacHandler } = require("../utils/badMacHandler");
const { checkIfMemberIsMuted } = require("../utils/database");
const { messageHandler } = require("./messageHandler");

exports.onMessagesUpsert = async ({ socket, messages, startProcess }) => {
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    if (DEVELOPER_MODE) {
      infoLog(
        `\n\n⪨========== [ MENSAJE RECIBIDO ] ==========⪩ \n\n${JSON.stringify(
          messages,
          null,
          2
        )}`
      );
    }

    try {
      const timestamp = webMessage.messageTimestamp;

      // --- 🛡️ FILTRO DE SEGURIDAD (SaaS) ---
      // IMPORTANTE: Agregamos 'await' y capturamos el resultado
      if (webMessage?.message) {
        const handlerResult = await messageHandler(socket, webMessage);
        
        // Si el handler retorna "BLOCKED", detenemos este mensaje para que no ejecute comandos
        if (handlerResult === "BLOCKED") {
          continue; 
        }
      }

      if (isAtLeastMinutesInPast(timestamp)) {
        continue;
      }

      // Lógica de participantes (Añadir/Eliminar)
      if (isAddOrLeave.includes(webMessage.messageStubType)) {
        let action = "";
        if (webMessage.messageStubType === GROUP_PARTICIPANT_ADD) {
          action = "add";
        } else if (webMessage.messageStubType === GROUP_PARTICIPANT_LEAVE) {
          action = "remove";
        }

        await onGroupParticipantsUpdate({
          userJid: webMessage.messageStubParameters[0],
          remoteJid: webMessage.key.remoteJid,
          socket,
          action,
        });
      } else {
        // Carga de funciones comunes
        const commonFunctions = loadCommonFunctions({ socket, webMessage });

        if (!commonFunctions) {
          continue;
        }

        // Lógica de miembros silenciados (Mute)
        if (
          checkIfMemberIsMuted(
            commonFunctions.remoteJid,
            commonFunctions.userJid
          )
        ) {
          try {
            await commonFunctions.deleteMessage(webMessage.key);
          } catch (error) {
            errorLog(
              `Error al eliminar mensaje de miembro silenciado: ${error.message}`
            );
          }
          return;
        }

        // --- 🚀 EJECUCIÓN DE COMANDOS ---
        // Si el grupo llegó aquí, es porque pasó el filtro del messageHandler
        await dynamicCommand(commonFunctions, startProcess);
      }
    } catch (error) {
      if (badMacHandler.handleError(error, "message-processing")) {
        continue;
      }

      if (badMacHandler.isSessionError(error)) {
        errorLog(`Error de sesión al procesar mensaje: ${error.message}`);
        continue;
      }

      errorLog(`Error al procesar mensaje: ${error.message}`);
      continue;
    }
  }
};