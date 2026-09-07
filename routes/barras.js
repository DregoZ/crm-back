const router = require("express").Router();
const Barras = require("../models/TipoBarra");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);

// GET /api/barras – paginación, ordenación y filtro activo
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "nombre_barra";
    const order = req.query.order === "asc" ? 1 : -1;

    const filtro = {}; // Sin filtro, devolver todos las barras

    const [barras, total] = await Promise.all([
      Barras.find(filtro)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Barras.countDocuments(filtro),
    ]);

    res.json({
      data: barras,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener barras" });
  }
});

// Obtener un barra por su ID
router.get("/:id", async (req, res) => {
  try {
    const barra = await Barras.findOne({ _id: req.params.id }).lean();

    if (!barra) {
      return res.status(404).json({ error: "Barra no encontrada" });
    }

    res.json(barra);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de barra no válido" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al obtener la barra" });
  }
});

// POST /api/barras – crear nueva barra
router.post("/", async (req, res) => {
  try {
    const barra = new Barras(req.body);
    await barra.save();
    res.status(201).json(barra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
