const mongoose = require("mongoose");

const tipoVasoSchema = new mongoose.Schema(
  {
    id_vaso: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombre: { type: String, required: true },
  },
  { _id: false },
);

module.exports = mongoose.model("TipoVaso", tipoVasoSchema);
