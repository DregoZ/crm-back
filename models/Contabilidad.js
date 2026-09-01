const mongoose = require('mongoose');

const contabilidadSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  fecha: { type: Date, default: Date.now },
  eventoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Contabilidad', contabilidadSchema);
