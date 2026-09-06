const mongoose = require("mongoose");

const ingredienteSchema = new mongoose.Schema(
  {
    nombre_insumo: { type: String, required: true },
    cantidad_por_persona: { type: Number, required: true },
    unidad_medida: {
      type: String,
      enum: ["ml", "pieza", "gramos", "hojas"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ingrediente", ingredienteSchema);
