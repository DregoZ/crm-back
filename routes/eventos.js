const router = require("express").Router();
const Evento = require("../models/Evento");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);

// GET /api/eventos – paginación, ordenación y filtro activo
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const sortBy = req.query.sortBy || "fecha_evento";
    const order = req.query.order === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const filtro = {}; // Sin filtro, devolver todos los eventos

    const [eventos, total] = await Promise.all([
      Evento.find(filtro)
        .populate("id_cliente", "nombre telefono") // Popula el cliente
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Evento.countDocuments(filtro),
    ]);

    res.json({
      data: eventos,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
});

// POST /api/eventos – crear nuevo evento
router.post("/", async (req, res) => {
  try {
    const evento = new Evento(req.body);
    await evento.save();
    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
