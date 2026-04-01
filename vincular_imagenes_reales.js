import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastcsv = require('fast-csv');

// CONFIGURACIÓN - Verifica que estos datos sean los correctos
const SUPABASE_URL = 'https://ohpkirlmsxfdvirrjmby.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocGtpcmxtc3hmZHZpcnJqbWJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMzU1OCwiZXhwIjoyMDg5MTg5NTU4fQ.n73imfWAzWg15Puh-XJ5V3ed850JrBX7IBn8mN6PjZo'; // ASEGÚRATE DE USAR LA SERVICE_ROLE
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RUTA_PRODUCTOS = './public/productos';

const vincular = async () => {
  console.log("🚀 Iniciando vinculación PRO...");

  try {
    // 1. LEER ARCHIVOS FÍSICOS
    if (!fs.existsSync(RUTA_PRODUCTOS)) throw new Error(`No existe la carpeta: ${RUTA_PRODUCTOS}`);
    const archivosReales = fs.readdirSync(RUTA_PRODUCTOS);
    console.log(`📂 ${archivosReales.length} imágenes encontradas en carpeta.`);

    // 2. OBTENER FAMILIAS (Con manejo de error para evitar el fallo del .map)
    const { data: familiasDB, error: errorFam } = await supabase.from('familias').select('id, nombre');
    
    if (errorFam || !familiasDB) {
      throw new Error(`Error consultando Supabase: ${errorFam?.message || 'No se recibieron datos'}. Revisa tu conexión y las llaves API.`);
    }

    const mapaFamilias = Object.fromEntries(familiasDB.map(f => [f.nombre.toUpperCase(), f.id]));
    console.log("✅ Familias cargadas desde la base de datos.");

    // 3. PROCESAR PRODUCTOS
    const referenciasFinales = [];
    let encontradas = 0;

    await new Promise((resolve) => {
      fs.createReadStream('tiendana_limpio.csv')
        .pipe(csv())
        .on('data', (row) => {
          const nombreProd = row.nombre_normalizado.toLowerCase();
          const categoria = row.categoria.trim().toUpperCase();
          const familiaId = mapaFamilias[categoria];

          if (!familiaId) return;

          // ESTRATEGIA DE BÚSQUEDA:
          // Dividimos el nombre del producto en palabras (ej: ["banda", "freno", "nkd"])
          const palabrasClave = nombreProd.split(' ').filter(p => p.length > 2);
          
          // Buscamos en la carpeta un archivo que contenga la mayoría de esas palabras
          const archivoEncontrado = archivosReales.find(archivo => {
            const nombreArchivo = archivo.toLowerCase();
            // El archivo debe contener al menos el 80% de las palabras clave del producto
            const coincidencias = palabrasClave.filter(palabra => nombreArchivo.includes(palabra));
            return coincidencias.length >= Math.ceil(palabrasClave.length * 0.8);
          });

          let modelo = nombreProd.replace(categoria.toLowerCase(), '').trim() || 'único';
          if (archivoEncontrado) encontradas++;

          referenciasFinales.push({
            familia_id: familiaId,
            modelo: modelo,
            precio_venta: parseInt(row.precio_venta),
            precio_costo: parseInt(row.precio_costo),
            stock_actual: parseInt(row.stock_actual),
            stock_minimo: 2,
            imagen_especifica: archivoEncontrado ? `/productos/${archivoEncontrado}` : null,
            visible_en_catalogo: true,
            activo: true
          });
        })
        .on('end', resolve);
    });

    console.log(`📊 Coincidencias logradas: ${encontradas} de ${referenciasFinales.length}`);

    // 4. GENERAR EL CSV PARA IMPORTAR
    const ws = fs.createWriteStream('referencias_final_validado.csv');
    fastcsv.write(referenciasFinales, { headers: true }).pipe(ws).on('finish', () => {
      console.log("🎉 ¡Archivo generado con éxito: referencias_final_validado.csv!");
    });

  } catch (err) {
    console.error("❌ ERROR CRÍTICO:", err.message);
  }
};

vincular();