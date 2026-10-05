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
    const order = req.query.order === "desc" ? -1 : 1;

    const filtro = {};
    const search = (req.query.search || "").trim();
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filtro.$or = [{ nombre_barra: regex }, { descripcion: regex }];
    }

    const [barras, total] = await Promise.all([
      Barras.find(filtro)
        .populate("lista_cocteles", "nombre tipo_vaso")
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
    console.error("Error al obtener barras:", error);
    res.status(500).json({ error: "Error al obtener barras" });
  }
});

// GET /api/barras/:id – obtener una barra por ID
router.get("/:id", async (req, res) => {
  try {
    const barra = await Barras.findById(req.params.id)
      .populate("lista_cocteles", "nombre tipo_vaso")
      .lean();

    if (!barra) {
      return res.status(404).json({ error: "Barra no encontrada" });
    }

    res.json(barra);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de barra no válido" });
    }
    console.error("Error al obtener la barra:", error);
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

// PUT /api/barras/:id – actualizar barra
router.put("/:id", async (req, res) => {
  try {
    const barra = await Barras.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("lista_cocteles", "nombre tipo_vaso")
      .lean();

    if (!barra) {
      return res.status(404).json({ error: "Barra no encontrada" });
    }

    res.json(barra);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de barra no válido" });
    }
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/barras/:id – eliminar barra
router.delete("/:id", async (req, res) => {
  try {
    const barra = await Barras.findByIdAndDelete(req.params.id);
    if (!barra) {
      return res.status(404).json({ error: "Barra no encontrada" });
    }
    res.json({ message: "Tipo de barra eliminado correctamente" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de barra no válido" });
    }
    res.status(500).json({ error: "Error al eliminar la barra" });
  }
});

module.exports = router;
