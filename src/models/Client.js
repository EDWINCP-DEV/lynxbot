const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true }, // Número del dueño de la licencia
    name: String,
    plan: { type: String, enum: ['BASIC', 'BRONCE', 'SILVER' , 'GOLDEN'], default: 'BASIC' },
    maxGroups: { type: Number, default: 1 },
    activeGroups: [{ type: String }], // IDs de los grupos donde el bot está autorizado
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Client', ClientSchema);