const { connect } = require("./connection");
const { connectDB } = require('./services/databaseService'); // Importación correcta
const { load } = require("./loader");
const { badMacHandler } = require("./utils/badMacHandler");
const {
  successLog,
  errorLog,
  warningLog,
  bannerLog,
  infoLog,
} = require("./utils/logger");

// --- MANEJO DE ERRORES GLOBALES ---
process.on("uncaughtException", (error) => {
  if (badMacHandler.handleError(error, "uncaughtException")) {
    return;
  }

  errorLog(`Error crítico no capturado: ${error.message}`);
  errorLog(error.stack);

  if (
    !error.message.includes("ENOTFOUND") &&
    !error.message.includes("timeout")
  ) {
    process.exit(1);
  }
});

// Captura promesas rechazadas (como fallos en la lectura de JSON o DB)
process.on('unhandledRejection', (reason, promise) => {
    errorLog(`❌ Promesa rechazada no manejada en: ${promise}`);
    console.error('Razón:', reason);
});

// --- FUNCIÓN PRINCIPAL ---
async function startBot() {
  // 1. Iniciamos la Base de Datos antes que nada
  await connectDB(); 

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    process.setMaxListeners(1500);

    bannerLog();
    infoLog("Iniciando mis componentes internos...");

    const stats = badMacHandler.getStats();
    if (stats.errorCount > 0) {
      warningLog(
        `Estadísticas de BadMacHandler: ${stats.errorCount}/${stats.maxRetries} errores`
      );
    }

    // 2. Conectamos el Socket de Baileys
    const socket = await connect();

    // 3. Cargamos los comandos y eventos
    load(socket);

    successLog("✅ ¡LynxBot iniciado con éxito!");

    // Monitor de errores Bad MAC
    setInterval(() => {
      const currentStats = badMacHandler.getStats();
      if (currentStats.errorCount > 0) {
        warningLog(
          `Estadísticas de BadMacHandler: ${currentStats.errorCount}/${currentStats.maxRetries} errores`
        );
      }
    }, 300_000);

  } catch (error) {
    // Si falla la inicialización por Bad MAC o similar, reintenta
    if (badMacHandler.handleError(error, "bot-startup")) {
      warningLog(
        "Error de Bad MAC durante la inicialización, intentando nuevamente..."
      );

      setTimeout(() => {
        startBot();
      }, 5000);
      return;
    }

    errorLog(`Error al iniciar el bot: ${error.message}`);
    errorLog(error.stack);
    process.exit(1);
  }
}

// ¡A rodar!
startBot();