import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastcsv = require('fast-csv');

// Credenciales
const SUPABASE_URL = 'https://ohpkirlmsxfdvirrjmby.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocGtpcmxtc3hmZHZpcnJqbWJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMzU1OCwiZXhwIjoyMDg5MTg5NTU4fQ.n73imfWAzWg15Puh-XJ5V3ed850JrBX7IBn8mN6PjZo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const vincularReferencias = async () => {
  console.log("🔗 Consultando IDs de familias en Supabase...");

  try {
    // 1. Obtener las familias reales de la base de datos
    const { data: familiasDB, error } = await supabase
      .from('familias')
      .select('id, nombre');

    if (error) throw error;

    // Crear un mapa para búsqueda rápida: { "BATERIA": 5 }
    const mapaFamilias = Object.fromEntries(
      familiasDB.map(f => [f.nombre.toUpperCase(), f.id])
    );

    console.log(`✅ Se obtuvieron ${familiasDB.length} familias de la base de datos.`);

    // 2. Procesar el archivo limpio para generar las referencias
    const referenciasFinales = [];

    fs.createReadStream('tiendana_limpio.csv')
      .pipe(csv())
      .on('data', (row) => {
        const nombreCompleto = row.nombre_normalizado.trim();
        const categoria = row.categoria.trim().toUpperCase();

        // Obtener el ID de la familia
        const familiaId = mapaFamilias[categoria];

        if (!familiaId) {
          console.warn(`⚠️ Advertencia: No se encontró ID para la categoría "${categoria}"`);
          return;
        }

        // Extraer el modelo (Nombre - Categoría)
        let modelo = nombreCompleto.toLowerCase().replace(categoria.toLowerCase(), '').trim();
        if (!modelo) modelo = 'estándar';

        // Generar ruta de imagen con guiones
        const slug = nombreCompleto.toLowerCase().replace(/\s+/g, '-');
        const rutaImagen = `/productos/${slug}.jpg`;

        // Estructura idéntica a tu captura de pantalla de Supabase
        referenciasFinales.push({
          familia_id: familiaId,
          modelo: modelo,
          precio_venta: parseInt(row.precio_venta) || 0,
          precio_costo: parseInt(row.precio_costo) || 0,
          stock_actual: parseInt(row.stock_actual) || 0,
          stock_minimo: 2,
          imagen_especifica: rutaImagen,
          visible_en_catalogo: row.visible === 'true',
          activo: row.activo === 'true'
        });
      })
      .on('end', () => {
        // 3. Escribir el CSV final
        const ws = fs.createWriteStream('referencias_final.csv');
        fastcsv
          .write(referenciasFinales, { headers: true })
          .pipe(ws)
          .on('finish', () => {
            console.log("🎉 ¡Archivo 'referencias_final.csv' generado con éxito!");
            console.log(`📊 Total de referencias listas: ${referenciasFinales.length}`);
          });
      });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
};

vincularReferencias();