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
      "activo",
      "proximoEventoEstado",
      "proximoEventoFecha",
    ];

    const sortBy = camposOrdenables.includes(req.query.sortBy)
      ? req.query.sortBy
      : "fecha_registro";
    const order = req.query.order === "asc" ? 1 : -1;

    const filtro = {};
    const search = (req.query.search || "").trim();
    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filtro.$or = [{ nombre: regex }, { telefono: regex }, { email: regex }];
    }

    const pipeline = [
      { $match: filtro },

      // 1. Obtener el próximo evento
      {
        $lookup: {
          from: "eventos",
          let: { clienteId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$id_cliente", "$$clienteId"] },
                fecha_evento: { $gte: new Date() },
              },
            },
            { $sort: { fecha_evento: 1 } },
            { $limit: 1 },
            { $project: { fecha_evento: 1, estado: 1, _id: 0 } },
          ],
          as: "proximoEventoArr",
        },
      },

      // 2. Conteo total de eventos
      {
        $lookup: {
          from: "eventos",
          let: { clienteId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$id_cliente", "$$clienteId"] } } },
            { $count: "total" },
          ],
          as: "totalEventosArr",
        },
      },

      // 3. Formatear datos: creamos el objeto 'proximoEvento' Y los campos de ordenación
      {
        $addFields: {
          proximoEvento: { $arrayElemAt: ["$proximoEventoArr", 0] },
          totalEventos: {
            $ifNull: [{ $arrayElemAt: ["$totalEventosArr.total", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          // Campos planos que usa Mongo únicamente para ejecutar el $sort dinámico
          proximoEventoFecha: "$proximoEvento.fecha_evento",
          proximoEventoEstado: "$proximoEvento.estado",
        },
      },

      // 4. Ordenar correctamente después de calcular los campos
      { $sort: { [sortBy]: order } },

      // 5. Paginación
      { $skip: skip },
      { $limit: limit },

      // 6. Eliminar solo los arrays auxiliares temporales
      {
        $project: {
          proximoEventoArr: 0,
          totalEventosArr: 0,
        },
      },
    ];

    const [clientes, total] = await Promise.all([
      Cliente.aggregate(pipeline),
      Cliente.countDocuments(filtro),
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

// Obtener cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
});

// Crear cliente
router.post("/", async (req, res) => {
  try {
    const { nombre, telefono, email, notas_gustos, activo } = req.body;
    const cliente = await Cliente.create({
      nombre,
      telefono,
      email,
      notas_gustos,
      activo: activo !== undefined ? activo : true,
    });
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const { nombre, telefono, email, notas_gustos, activo } = req.body;
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, telefono, email, notas_gustos, activo },
      { new: true, runValidators: true },
    );
    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar cliente
router.delete("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el cliente" });
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
