const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String },
  notas_gustos: { type: String },
  fecha_registro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', clienteSchema);
