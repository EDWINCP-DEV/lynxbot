const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, "..", "..", "database", "clients.json");

// --- INICIALIZACIÓN ---
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));

const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("❌ Error al leer clients.json:", error.message);
        return [];
    }
};

const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// --- SERVICIOS ---
const databaseService = {
    isGroupAuthorized: async (groupId) => {
        const clients = readDB();
        // Verifica si el grupo actual ya está en la lista de algún cliente activo
        return clients.some(c => c.isActive && c.activeGroups.includes(groupId));
    },

    authorizeNewGroup: async (userJid, groupId) => {
        let clients = readDB();
        
        // Limpiamos el JID del remitente para tener solo números (ej: 5215579... -> 5215579)
        const senderNumber = userJid.replace(/\D/g, '');

        // Buscamos al cliente comparando los números de forma flexible
        const clientIndex = clients.findIndex(c => {
            if (!c.isActive) return false;
            const dbNumber = c.phoneNumber.replace(/\D/g, '');
            // Verifica si el número de la DB está contenido en el JID de WhatsApp
            return senderNumber.endsWith(dbNumber) || senderNumber.includes(dbNumber);
        });

        // 1. Si no se encuentra el número en el JSON
        if (clientIndex === -1) {
            return { 
                success: false, 
                message: "❌ *Acceso Denegado:* Tu número no tiene una suscripción activa en el sistema de Lynx Gaming." 
            };
        }

        const client = clients[clientIndex];

        // 2. Si el grupo ya estaba activado
        if (client.activeGroups.includes(groupId)) {
            return { success: false, message: "⚠️ *Nota:* Este grupo ya se encuentra autorizado en tu plan." };
        }

        // 3. Si ya no tiene cupos disponibles
        if (client.activeGroups.length >= client.maxGroups) {
            return { 
                success: false, 
                message: `🚫 *Límite Alcanzado:* Has agotado tus cupos (${client.activeGroups.length}/${client.maxGroups}). Contacta al soporte para ampliar tu plan.` 
            };
        }

        // 4. ÉXITO: Guardamos el nuevo grupo
        clients[clientIndex].activeGroups.push(groupId);
        writeDB(clients);
        
        return { 
            success: true, 
            message: `✅ *¡LynxBot Activado!*\n\nEste grupo ha sido vinculado a la cuenta de: *${client.name}*\nCupos usados: ${clients[clientIndex].activeGroups.length}/${client.maxGroups}` 
        };
    }
};

const connectDB = async () => {
    console.log("📁 [Base de Datos] Sistema local (JSON) cargado correctamente.");
    return true;
};

module.exports = { databaseService, connectDB };