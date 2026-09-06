const mongoose = require("mongoose");

// Sub‑esquema del ingrediente (ya lo tenías antes)
const ingredienteEmbeddedSchema = new mongoose.Schema(
  {
    nombre_insumo: { type: String, required: true },
    cantidad_por_persona: { type: Number, required: true },
    unidad_medida: {
      type: String,
      enum: ["ml", "pieza", "gramos", "hojas"],
      required: true,
    },
  },
  { _id: false }, // no crea un _id interno para cada ingrediente
);

// Sub‑esquema del tipo de vaso
const tipoVasoEmbeddedSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
  },
  { _id: false },
);

const coctelSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    // *Embebido* en lugar de referencia
    tipo_vaso: tipoVasoEmbeddedSchema,
    // Array de ingredientes *embebidos*
    ingredientes: [ingredienteEmbeddedSchema],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Coctel", coctelSchema);
