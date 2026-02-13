const mongoose = require('mongoose');
const Client = require('../models/Client'); // Asegúrate de crear este modelo también
require('dotenv').config(); // Carga las variables del archivo .env

const connectDB = async () => {
    try {
        // Usamos la variable de entorno para seguridad
        const uri = process.env.MONGO_URI; 
        
        if (!uri) {
            throw new Error("❌ La variable MONGO_URI no está definida en el archivo .env");
        }

        await mongoose.connect(uri);
        console.log('🚀 Conexión a MongoDB Atlas exitosa (Clusterlynx)');
    } catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err.message);
        process.exit(1); // Detiene el bot si no hay base de datos
    }
};

const databaseService = {
    // Buscar un cliente por su número de WhatsApp
    getClientByNumber: async (phoneNumber) => {
        return await Client.findOne({ phoneNumber });
    },

    // Verificar si el grupo actual está en la lista permitida de algún cliente
    isGroupAuthorized: async (groupId) => {
        const client = await Client.findOne({ activeGroups: groupId, isActive: true });
        return !!client;
    },

    // Registrar un nuevo grupo si el cliente tiene cupo
    authorizeNewGroup: async (phoneNumber, groupId) => {
        const client = await Client.findOne({ phoneNumber });
        
        if (client && client.isActive) {
            // Verificar si aún tiene espacio en su plan (ej: 2 de 5 grupos)
            if (client.activeGroups.length < client.maxGroups) {
                // Evitar duplicados
                if (!client.activeGroups.includes(groupId)) {
                    client.activeGroups.push(groupId);
                    await client.save();
                    return { success: true, message: "Grupo autorizado con éxito" };
                }
                return { success: false, message: "Este grupo ya estaba autorizado" };
            }
            return { success: false, message: "Has alcanzado el límite de grupos de tu plan" };
        }
        return { success: false, message: "No tienes una membresía activa" };
    }
};

module.exports = { connectDB, databaseService };