const mongoose = require("mongoose");

const tipoBarraEmbeddedSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombre_barra: { type: String, required: true },
  },
  { _id: false }, // Evita que Mongoose genere un nuevo ObjectId extra automáticamente
);

const eventoSchema = new mongoose.Schema({
  id_cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  id_tipo_barra: tipoBarraEmbeddedSchema,
  fecha_evento: { type: Date, required: true },
  direccion: { type: String, required: true },
  cantidad_asistentes: { type: Number, required: true },
  estado: {
    type: String,
    enum: ["Pendiente", "Confirmado", "Finalizado", "Cancelado"],
    required: true,
  },
  logistica_notas: { type: String },
  precio_final_calculado: { type: Number, required: true },
});

module.exports = mongoose.model("Evento", eventoSchema);
