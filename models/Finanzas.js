const mongoose = require('mongoose');

const finanzasSchema = new mongoose.Schema({
  id_evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  porcentaje_reserva: { type: Number, required: true },
  monto_reserva_pagado: { type: Boolean, required: true },
  monto_total_liquidado: { type: Boolean, required: true },
  metodo_pago: { 
    type: String, 
    enum: ['Transferencia', 'Efectivo', 'Bizum', 'Tarjeta'], 
    required: true 
  }
});

module.exports = mongoose.model('Finanzas', finanzasSchema);
