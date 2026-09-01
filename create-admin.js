require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Falta MONGO_URI en el archivo .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    const email = 'admin'; // Cambia esto por tu email real
    const password = '123456';    // Cambia esto por tu contraseña segura

    // Comprobar si ya existe
    const existe = await Usuario.findOne({ email });
    if (existe) {
      console.log('⚠️ El usuario ya existe en la base de datos.');
      process.exit(0);
    }

    // Crear usuario
    const nuevoUsuario = new Usuario({
      email,
      password, // El hook pre('save') en Usuario.js lo encriptará automáticamente
      nombre: 'Administrador Principal',
      rol: 'admin'
    });

    await nuevoUsuario.save();
    console.log('✅ Usuario administrador creado con éxito:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
