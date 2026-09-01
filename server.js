require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware base ────────────────────────────────────────
app.use(express.json());
app.use(helmet());

// ── CORS restringido al dominio de producción de Vercel ────
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  process.env.FRONTEND_URL_PREVIEW, 
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting específico para el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// ── Conexión a MongoDB Atlas ────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch((err) => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  });

// ── Rutas ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'crm-cocteleria-backend' });
});

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'degraded',
    db: dbState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/material', require('./routes/material'));
app.use('/api/contabilidad', require('./routes/contabilidad'));

// ── Manejador global de errores CORS y otros ─────────────────
app.use((err, req, res, next) => {
  if (err.message?.startsWith('Origin no permitido')) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
