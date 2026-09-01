const mongoose = require('mongoose');

const tipoBarraSchema = new mongoose.Schema({
  nombre_barra: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio_base_persona: { type: Number, required: true },
  lista_cocteles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coctel' }]
});

module.exports = mongoose.model('TipoBarra', tipoBarraSchema);
