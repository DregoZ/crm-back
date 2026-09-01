const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  cantidad: { type: Number, required: true, default: 0 },
  descripcion: { type: String },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
