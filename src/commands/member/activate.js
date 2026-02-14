/**
 * Comando de Activación SaaS
 * @author Dev Ewin
 */
const { databaseService } = require(`../../services/databaseService`);
const { PREFIX, OWNER_NUMBER } = require(`../../config`);

module.exports = {
  name: "activar",
  description: "Activa el bot en el grupo actual",
  commands: ["activar", "activate"],
  usage: `${PREFIX}activar`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, userJid, sendText }) => {
    // 1. Validación de seguridad manual (por si falla el filtro de carpeta)
    const sender = userJid.replace(/\D/g, '');
    const owner = OWNER_NUMBER.replace(/\D/g, '');

    // Si no eres el dueño, ni siquiera intentamos entrar a la DB
    if (!sender.includes(owner) && !owner.includes(sender)) {
        return await sendText("🚫 *Acceso Denegado:* Solo el dueño puede autorizar grupos.");
    }

    try {
        // 2. Ejecutar la activación en el JSON
        const result = await databaseService.authorizeNewGroup(userJid, remoteJid);
        return await sendText(result.message);
    } catch (error) {
        console.error("Error en activación:", error);
        return await sendText("❌ Ocurrió un error al intentar activar el grupo.");
    }
  },
};