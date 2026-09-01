const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  nombre: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'colaborador'], default: 'admin' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

usuarioSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

usuarioSchema.methods.compararPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
