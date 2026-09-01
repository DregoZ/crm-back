const router = require('express').Router();
const Contabilidad = require('../models/Contabilidad');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const contabilidad = await Contabilidad.find({ activo: true }).populate('eventoId', 'nombreEvento');
    res.json(contabilidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros de contabilidad' });
  }
});

router.post('/', async (req, res) => {
  try {
    const registro = new Contabilidad(req.body);
    await registro.save();
    res.status(201).json(registro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
