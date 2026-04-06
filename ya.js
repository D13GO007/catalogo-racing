import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastcsv = require('fast-csv');

// CONFIGURACIÓN
const SUPABASE_URL = 'https://ohpkirlmsxfdvirrjmby.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocGtpcmxtc3hmZHZpcnJqbWJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMzU1OCwiZXhwIjoyMDg5MTg5NTU4fQ.n73imfWAzWg15Puh-XJ5V3ed850JrBX7IBn8mN6PjZo'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const RUTA_PRODUCTOS = './public/productos';

// DICCIONARIO DE ABREVIATURAS (Para mejorar el match)
const ABREVIATURAS = {
  'mordaza': 'mr',
  'switch': 'sw',
  'regulador': 'reg',
  'direccional': 'dire',
  'cable': 'cbl',
  'bateria': 'b',
  'automatico': 'auto',
  'kit': 'nkit'
};

const vincularInteligente = async () => {
  console.log("🧠 Iniciando búsqueda profunda de imágenes...");

  try {
    // 1. LEER ARCHIVOS FÍSICOS
    if (!fs.existsSync(RUTA_PRODUCTOS)) throw new Error("No se encuentra la carpeta public/productos");
    const archivos = fs.readdirSync(RUTA_PRODUCTOS);
    console.log(`📂 Escaneando ${archivos.length} archivos reales...`);

    // 2. OBTENER FAMILIAS
    const { data: familiasDB } = await supabase.from('familias').select('id, nombre');
    const mapaFams = Object.fromEntries(familiasDB.map(f => [f.nombre.toUpperCase(), f.id]));

    const referenciasFinales = [];
    let exitos = 0;

    // 3. PROCESAR PRODUCTOS
    await new Promise((resolve) => {
      fs.createReadStream('tiendana_limpio.csv')
        .pipe(csv())
        .on('data', (row) => {
          const nombreProd = row.nombre_normalizado.toLowerCase();
          const categoria = row.categoria.trim().toUpperCase();
          const famId = mapaFams[categoria];
          if (!famId) return;

          // --- LÓGICA DE BÚSQUEDA AVANZADA ---
          let mejorImagen = null;
          let mejorPuntaje = 0;

          // Limpiamos el nombre de palabras vacías
          const palabrasProd = nombreProd.split(' ').filter(p => p.length > 2 && p !== 'con' && p !== 'del' && p !== 'para');

          archivos.forEach(archivo => {
            const nombreArch = archivo.toLowerCase();
            let puntos = 0;

            // Puntos por palabras exactas
            palabrasProd.forEach(pal => {
              if (nombreArch.includes(pal)) puntos += 2;
              
              // Puntos por abreviaturas (ej: si el prod tiene 'mordaza' y el archivo tiene 'mr')
              if (ABREVIATURAS[pal] && nombreArch.includes(ABREVIATURAS[pal])) puntos += 2;
            });

            // Bono por el modelo específico (ej: 'nkd', 'agility')
            const modeloPalabras = row.nombre_normalizado.replace(row.categoria.toLowerCase(), '').trim().split(' ');
            modeloPalabras.forEach(m => {
              if (m.length > 2 && nombreArch.includes(m.toLowerCase())) puntos += 3;
            });

            if (puntos > mejorPuntaje) {
              mejorPuntaje = puntos;
              mejorImagen = archivo;
            }
          });

          // Solo asignamos si el puntaje es confiable
          const imagenRuta = (mejorPuntaje >= 4) ? `/productos/${mejorImagen}` : null;
          if (imagenRuta) exitos++;

          let modeloLimpio = nombreProd.replace(categoria.toLowerCase(), '').trim() || 'único';

          referenciasFinales.push({
            familia_id: famId,
            modelo: modeloLimpio,
            precio_venta: parseInt(row.precio_venta),
            precio_costo: parseInt(row.precio_costo),
            stock_actual: parseInt(row.stock_actual),
            stock_minimo: 2,
            imagen_especifica: imagenRuta,
            visible_en_catalogo: true,
            activo: true
          });
        })
        .on('end', resolve);
    });

    console.log(`✅ ¡Proceso terminado!`);
    console.log(`📊 Imágenes vinculadas: ${exitos} de ${referenciasFinales.length}`);

    // 4. GENERAR CSV
    const ws = fs.createWriteStream('referencias_vinculacion_pro.csv');
    fastcsv.write(referenciasFinales, { headers: true }).pipe(ws).on('finish', () => {
      console.log("📝 Archivo generado: referencias_vinculacion_pro.csv");
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
};

vincularInteligente();