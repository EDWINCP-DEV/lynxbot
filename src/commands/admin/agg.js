/**
 * @author Dev Ewin
 */
const { PREFIX, BOT_NUMBER } = require(`${BASE_DIR}/config`);
const { OWNER_NUMBER } = require("../../config");
const { DangerError, InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "agg",
  description: "Agrego un miembro al grupo",
  commands: ["agg", "add"],
  usage: `${PREFIX}agg @mencionar_miembro

o

${PREFIX}agg (mencionando un mensaje)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    isLid,
    sendSuccessReact,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "¡Necesitas mencionar o marcar un miembro!"
      );
    }

    let memberToAddId = null;

    if (isLid) {
      const [result] = await socket.onWhatsApp(onlyNumbers(args[0]));

      if (!result) {
        throw new WarningError(
          "¡El número proporcionado no está registrado en WhatsApp!"
        );
      }

      memberToAddId = result.lid;
    } else {
      const memberToAddJid = isReply ? replyJid : toUserJid(args[0]);
      const memberToAddNumber = onlyNumbers(memberToAddJid);

      if (memberToAddNumber.length < 7 || memberToAddNumber.length > 15) {
        throw new InvalidParameterError("¡Número inválido!");
      }

      if (memberToAddJid === userJid) {
        throw new DangerError("¡No puedes agregarte a ti mismo!");
      }

      if (memberToAddNumber === OWNER_NUMBER) {
        throw new DangerError("¡No puedes agregar al dueño del bot!");
      }

      const botJid = toUserJid(BOT_NUMBER);

      if (memberToAddJid === botJid) {
        throw new DangerError("¡No puedes agregarme!");
      }

      memberToAddId = memberToAddJid;
    }

    // Intentar agregar al usuario
    const result = await socket.groupParticipantsUpdate(
      remoteJid,
      [memberToAddId],
      "add"
    );

    await sendSuccessReact();

    // Detectar si fue agregado directo o invitado
    if (result && result[0] && result[0].status) {
      if (result[0].status === "200") {
        await sendReply("✅ ¡Miembro agregado con éxito!");
      } else if (result[0].status === "403") {
        await sendReply("📩 Invitación enviada. El usuario debe aceptarla para unirse.");
      } else {
        await sendReply("⚠ No se pudo agregar al usuario. Verifica la configuración del grupo.");
      }
    } else {
      await sendReply("⚠ Acción completada, pero no se pudo verificar el estado.");
    }
  },
};
