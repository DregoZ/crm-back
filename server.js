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

// 1. Confía en el proxy de Render
app.set('trust proxy', 1);

// 2. Definición de orígenes permitidos (limpiando barras al final)
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
  process.env.FRONTEND_URL_PREVIEW?.replace(/\/$/, ''),
  'http://localhost:4200',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Peticiones sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // Permitir cualquier subdominio de vercel.app (ej: mi-app.vercel.app, mi-app-git.vercel.app)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Comprobar la lista explícita
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // En lugar de lanzar un Error(), pasa false para que devuelva una respuesta CORS válida sin tumbar la ejecución
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204 // Estado HTTP estándar para respuestas OPTIONS exitosas
};

// 3. Aplica CORS globalmente PRIMERO
app.use(cors(corsOptions));

// 4. Maneja de forma explícita TODAS las peticiones preliminares (OPTIONS) usando regex
app.options(/(.*)/, cors(corsOptions));

// 5. Rate Limit (Después de CORS y OPTIONS)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ignora las peticiones OPTIONS para que no cuenten dentro del límite de 5 intentos
  skip: (req) => req.method === 'OPTIONS'
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
