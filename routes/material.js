const router = require('express').Router();
const Material = require('../models/Material');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const material = await Material.find({ activo: true });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener material' });
  }
});

router.post('/', async (req, res) => {
  try {
    const material = new Material(req.body);
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
