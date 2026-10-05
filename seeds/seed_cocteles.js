require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Coctel = require('../models/Coctel');

const coctelesDummy = [
  {
    nombre: 'Mojito Clásico',
    tipo_vaso: { nombre: 'Vaso Collins / Highball' },
    ingredientes: [
      { nombre_insumo: 'Ron blanco', cantidad_por_persona: 50, unidad_medida: 'ml' },
      { nombre_insumo: 'Zumo de lima fresca', cantidad_por_persona: 25, unidad_medida: 'ml' },
      { nombre_insumo: 'Azúcar blanco / Almíbar', cantidad_por_persona: 15, unidad_medida: 'gramos' },
      { nombre_insumo: 'Hojas de hierbabuena', cantidad_por_persona: 8, unidad_medida: 'hojas' },
      { nombre_insumo: 'Soda / Agua con gas', cantidad_por_persona: 60, unidad_medida: 'ml' }
    ]
  },
  {
    nombre: 'Negroni Artesanal',
    tipo_vaso: { nombre: 'Vaso Old Fashioned (Lowball)' },
    ingredientes: [
      { nombre_insumo: 'Ginebra dry', cantidad_por_persona: 30, unidad_medida: 'ml' },
      { nombre_insumo: 'Campari', cantidad_por_persona: 30, unidad_medida: 'ml' },
      { nombre_insumo: 'Vermut rojo dulce', cantidad_por_persona: 30, unidad_medida: 'ml' },
      { nombre_insumo: 'Rodaja de naranja', cantidad_por_persona: 1, unidad_medida: 'pieza' }
    ]
  },
  {
    nombre: 'Margarita Signature',
    tipo_vaso: { nombre: 'Copa Coupé / Margarita' },
    ingredientes: [
      { nombre_insumo: 'Tequila blanco 100% agave', cantidad_por_persona: 50, unidad_medida: 'ml' },
      { nombre_insumo: 'Triple Sec / Cointreau', cantidad_por_persona: 25, unidad_medida: 'ml' },
      { nombre_insumo: 'Zumo de lima fresca', cantidad_por_persona: 25, unidad_medida: 'ml' },
      { nombre_insumo: 'Sal marina para borde', cantidad_por_persona: 2, unidad_medida: 'gramos' }
    ]
  },
  {
    nombre: 'Aperol Spritz',
    tipo_vaso: { nombre: 'Copa Balón / Vino Grande' },
    ingredientes: [
      { nombre_insumo: 'Prosecco / Cava Brut', cantidad_por_persona: 90, unidad_medida: 'ml' },
      { nombre_insumo: 'Aperol', cantidad_por_persona: 60, unidad_medida: 'ml' },
      { nombre_insumo: 'Soda', cantidad_por_persona: 30, unidad_medida: 'ml' },
      { nombre_insumo: 'Media rodaja de naranja', cantidad_por_persona: 1, unidad_medida: 'pieza' }
    ]
  },
  {
    nombre: 'Espresso Martini',
    tipo_vaso: { nombre: 'Copa Martini / Cocktail' },
    ingredientes: [
      { nombre_insumo: 'Vodka', cantidad_por_persona: 50, unidad_medida: 'ml' },
      { nombre_insumo: 'Licor de café (Kahlúa)', cantidad_por_persona: 25, unidad_medida: 'ml' },
      { nombre_insumo: 'Café espresso recién hecho', cantidad_por_persona: 30, unidad_medida: 'ml' },
      { nombre_insumo: 'Granos de café para decorar', cantidad_por_persona: 3, unidad_medida: 'pieza' }
    ]
  }
];

async function insertarCocteles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB...');

    for (const data of coctelesDummy) {
      const existe = await Coctel.findOne({ nombre: data.nombre });
      if (!existe) {
        await Coctel.create(data);
        console.log(`🍸 Cóctel creado: ${data.nombre}`);
      } else {
        console.log(`ℹ️ El cóctel ya existe: ${data.nombre}`);
      }
    }

    console.log('🚀 Cócteles iniciales listos.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar cócteles:', error);
    process.exit(1);
  }
}

insertarCocteles();
