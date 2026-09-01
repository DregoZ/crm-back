const router = require('express').Router();
const Evento = require('../models/Evento');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find({ activo: true }).populate('clienteId', 'nombre telefono');
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const evento = new Evento(req.body);
    await evento.save();
    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
