const router = require("express").Router();
const Coctel = require("../models/Coctel");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);

// GET /api/cocteles – listado paginado o completo con búsqueda
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const sortBy = req.query.sortBy || "nombre";
    const order = req.query.order === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const filtro = {};
    const search = (req.query.search || "").trim();
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filtro.$or = [
        { nombre: regex },
        { "tipo_vaso.nombre": regex },
        { "ingredientes.nombre_insumo": regex },
      ];
    }

    const [cocteles, total] = await Promise.all([
      Coctel.find(filtro)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coctel.countDocuments(filtro),
    ]);

    // Normalizar campo cristaleria para mayor compatibilidad con frontend
    const dataNormalizada = cocteles.map((c) => ({
      ...c,
      cristaleria: c.tipo_vaso?.nombre || "",
    }));

    res.json({
      data: dataNormalizada,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error al obtener cócteles:", error);
    res.status(500).json({ error: "Error al obtener cócteles" });
  }
});

// GET /api/cocteles/:id – detalle de cóctel
router.get("/:id", async (req, res) => {
  try {
    const coctel = await Coctel.findById(req.params.id).lean();
    if (!coctel) {
      return res.status(404).json({ error: "Cóctel no encontrado" });
    }
    res.json({
      ...coctel,
      cristaleria: coctel.tipo_vaso?.nombre || "",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de cóctel no válido" });
    }
    console.error("Error al obtener cóctel:", error);
    res.status(500).json({ error: "Error al obtener cóctel" });
  }
});

// POST /api/cocteles – crear cóctel
router.post("/", async (req, res) => {
  try {
    const { nombre, cristaleria, tipo_vaso, ingredientes } = req.body;

    const vasoNormalizado = tipo_vaso?.nombre
      ? tipo_vaso
      : { nombre: cristaleria || "Estándar" };

    const nuevoCoctel = new Coctel({
      nombre,
      tipo_vaso: vasoNormalizado,
      ingredientes: Array.isArray(ingredientes) ? ingredientes : [],
    });

    await nuevoCoctel.save();

    const resultado = nuevoCoctel.toObject();
    res.status(201).json({
      ...resultado,
      cristaleria: resultado.tipo_vaso?.nombre || "",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/cocteles/:id – actualizar cóctel
router.put("/:id", async (req, res) => {
  try {
    const { nombre, cristaleria, tipo_vaso, ingredientes } = req.body;

    const updateData = {
      ...(nombre && { nombre }),
      ...(ingredientes && { ingredientes }),
    };

    if (tipo_vaso?.nombre) {
      updateData.tipo_vaso = tipo_vaso;
    } else if (cristaleria) {
      updateData.tipo_vaso = { nombre: cristaleria };
    }

    const coctel = await Coctel.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!coctel) {
      return res.status(404).json({ error: "Cóctel no encontrado" });
    }

    res.json({
      ...coctel,
      cristaleria: coctel.tipo_vaso?.nombre || "",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de cóctel no válido" });
    }
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/cocteles/:id – eliminar cóctel
router.delete("/:id", async (req, res) => {
  try {
    const coctel = await Coctel.findByIdAndDelete(req.params.id);
    if (!coctel) {
      return res.status(404).json({ error: "Cóctel no encontrado" });
    }
    res.json({ message: "Cóctel eliminado correctamente" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de cóctel no válido" });
    }
    res.status(500).json({ error: "Error al eliminar el cóctel" });
  }
});

module.exports = router;
