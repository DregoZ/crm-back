const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  nombre_insumo: { type: String, required: true },
  cantidad_por_persona: { type: Number, required: true },
  unidad_medida: { 
    type: String, 
    enum: ['ml', 'pieza', 'gramos', 'hojas'], 
    required: true 
  }
}, { _id: false });

const coctelSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cristaleria: { type: String, required: true },
  ingredientes: [ingredienteSchema]
});

module.exports = mongoose.model('Coctel', coctelSchema);
