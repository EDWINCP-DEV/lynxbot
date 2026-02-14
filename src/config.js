const path = require("path");

// Prefijo de los comandos.
exports.PREFIX = "/";

// Emoji del bot (cambia si lo prefieres).
exports.BOT_EMOJI = "🤖";

// Nombre del bot (cambia si lo prefieres).
exports.BOT_NAME = "Lynx Bot";

// Número del bot.
// Solo números, exactamente como aparece en WhatsApp.
exports.BOT_NUMBER = "7202218042";

// Número del dueño del bot.
// Solo números, exactamente como aparece en WhatsApp.
exports.OWNER_NUMBER = "5579436135";

// Directorio de los comandos
exports.COMMANDS_DIR = path.join(__dirname, "commands");

// Directorio de archivos de medios.
exports.DATABASE_DIR = path.resolve(__dirname, "..", "database");

// Directorio de archivos de medios.
exports.ASSETS_DIR = path.resolve(__dirname, "..", "assets");

// Directorio de archivos temporales.
exports.TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

// Tiempo de espera en milisegundos por evento (evita el baneo).
exports.TIMEOUT_IN_MILLISECONDS_BY_EVENT = 300;


// Si deseas responder solo a un grupo específico,
// coloca su ID en la configuración siguiente.
// Para saber el ID del grupo, usa el comando <prefijo>getid
// Reemplaza <prefijo> por el prefijo del bot (ej: /getid).
exports.ONLY_GROUP_ID = "";

// Configuración para modo de desarrollo
// cambie el valor a ( true ) sin los paréntesis
// si desea ver los registros de mensajes recibidos
exports.DEVELOPER_MODE = false;

// Directorio base del proyecto.
exports.BASE_DIR = path.resolve(__dirname);

// Si deseas usar proxy.
exports.PROXY_PROTOCOL = "http";
exports.PROXY_HOST = "ip";
exports.PROXY_PORT = "puerto";
exports.PROXY_USERNAME = "usuario";
exports.PROXY_PASSWORD = "contraseña";
