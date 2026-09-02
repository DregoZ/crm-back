const router = require("express").Router();
const mongoose = require("mongoose");
const Cliente = require("../models/Cliente");
const Evento = require("../models/Evento");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);

// Obtener listado paginado
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const camposOrdenables = [
      "nombre",
      "telefono",
      "email",
      "fecha_registro",
      "createdAt",
    ];
    const sortBy = camposOrdenables.includes(req.query.sortBy)
      ? req.query.sortBy
      : "fecha_registro";
    const order = req.query.order === "asc" ? 1 : -1;

    const [clientes, total] = await Promise.all([
      Cliente.find({ activo: true })
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit),
      Cliente.countDocuments({ activo: true }),
    ]);

    res.json({
      data: clientes,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// Creación conjunta con transacción
router.post("/con-evento", async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [cliente] = await Cliente.create([req.body.cliente], { session });
    const [evento] = await Evento.create(
      [{ ...req.body.evento, clienteId: cliente._id }],
      { session },
    );

    await session.commitTransaction();
    res.status(201).json({ cliente, evento });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
