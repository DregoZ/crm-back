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

// 2. Definición de orígenes permitidos (Limpieza estricta de espacios y barras finales)
const allowedOrigins = [
  process.env.FRONTEND_URL?.trim().replace(/\/$/, ''),
  process.env.FRONTEND_URL_PREVIEW?.trim().replace(/\/$/, ''),
  'http://localhost:4200',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Peticiones sin origin (Postman, curl, servidores, etc.)
    if (!origin) return callback(null, true);

    // Limpiar el origen entrante por si acaso trae barras finales (raro, pero pasa)
    const cleanOrigin = origin.replace(/\/$/, '');

    // Permitir cualquier subdominio de vercel.app
    if (cleanOrigin.endsWith('.vercel.app')) return callback(null, true);

    // Comprobar la lista explícita
    if (allowedOrigins.includes(cleanOrigin)) return callback(null, true);

    // IMPORTANTE: Lanza un error real para que lo capture tu manejador de errores global abajo
    return callback(new Error('Origin no permitido por CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// 3. Aplica CORS globalmente (Esto ya maneja las peticiones OPTIONS automáticamente de forma interna)
app.use(cors(corsOptions));

// 4. ELIMINA la línea de app.options(/(.*)/...) y reemplázala por esta que intercepta todo al inicio:
app.options('*', cors(corsOptions)); 

// 5. Rate Limit adaptado: Aplícalo como un middleware intermedio SOLO para el método POST de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ya no necesitas el 'skip' aquí porque solo se lo aplicaremos a las peticiones POST reales
});

// En lugar de usar app.use() global para la ruta, deja que el router de auth lo maneje, 
// o si prefieres dejarlo aquí, asegúrate de que solo afecte al POST:
app.post('/api/auth/login', loginLimiter);

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
