const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  id_tipo_barra: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoBarra', required: true },
  fecha_evento: { type: Date, required: true },
  direccion: { type: String, required: true },
  cantidad_asistentes: { type: Number, required: true },
  estado: { 
    type: String, 
    enum: ['Cotizado', 'Confirmado', 'Finalizado', 'Cancelado'], 
    required: true 
  },
  logistica_notas: { type: String },
  precio_final_calculado: { type: Number, required: true }
});

module.exports = mongoose.model('Evento', eventoSchema);
