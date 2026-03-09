import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';

const formatoPeso = (valor) => {
  return '$ ' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// 🎨 COLOR PRINCIPAL DE LA MARCA
const COLOR_ZAPOTE = '#FF6600'; // Naranja Zapote Brillante

// 🎨 ESTILOS "RACING PREMIUM" (MÁS AMPLIOS Y CON NUEVO COLOR)
const styles = StyleSheet.create({
  page: {
    paddingTop: 180, // Zona de seguridad para no tapar el diseño del fondo
    paddingBottom: 25, 
    paddingHorizontal: 20,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  
  // IMAGEN DE FONDO
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
    fixed: true, 
  },

  // CAJA DEL PRODUCTO (MÁS GRANDE Y ESPACIOSA)
  productBox: {
    width: '95%', 
    alignSelf: 'center', 
    marginBottom: 15, // Más separación entre cajas
    backgroundColor: '#FFFFFF',
    border: '2pt solid #000000',
    borderRadius: 4,
  },

  // TÍTULO CON EL NUEVO COLOR ZAPOTE
  headerContainer: {
    backgroundColor: COLOR_ZAPOTE, 
    paddingVertical: 8, // Más altura en el título
    paddingHorizontal: 12,
    borderBottom: '2pt solid #000000',
  },
  headerText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },

  boxBody: {
    flexDirection: 'row',
  },

  // FOTO MÁS GRANDE
  imageSection: {
    width: '22%', 
    backgroundColor: '#F2F4F6', 
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRight: '2pt solid #000000',
  },
  image: {
    width: '100%',
    maxHeight: 85, // Imagen más alta para que luzca mejor
    objectFit: 'contain',
  },

  // TABLA DE PRECIOS
  tableSection: {
    width: '78%',
    backgroundColor: '#FFFFFF',
  },
  
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#111111', 
  },
  
  // CABECERA: DOBLE COLUMNA
  halfHead: {
    width: '50%',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  thModelHalf: { width: '65%', fontSize: 6.5, fontWeight: 'bold', color: '#FFFFFF', textTransform: 'uppercase' },
  thPriceHalf: { width: '35%', fontSize: 6.5, fontWeight: 'bold', color: '#FFCC00', textAlign: 'right', textTransform: 'uppercase' },

  // CABECERA: UNA SOLA COLUMNA (Para 3 o menos items)
  fullHead: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  thModelFull: { width: '70%', fontSize: 7.5, fontWeight: 'bold', color: '#FFFFFF', textTransform: 'uppercase' },
  thPriceFull: { width: '30%', fontSize: 7.5, fontWeight: 'bold', color: '#FFCC00', textAlign: 'right', textTransform: 'uppercase' },

  tableBody: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
  },

  // FILA: DOBLE COLUMNA (Más espaciosas que antes)
  tableItemHalf: {
    width: '50%',
    flexDirection: 'row',
    paddingVertical: 6, // Más espacio para respirar
    paddingHorizontal: 6,
    borderBottom: '1pt solid #EEEEEE',
    alignItems: 'center',
  },
  tdModelHalf: { width: '65%', fontSize: 7.5, color: '#000000', fontWeight: 'bold', paddingRight: 3, textTransform: 'uppercase' },
  tdPriceHalf: { width: '35%', fontSize: 8.5, fontWeight: 'bold', color: COLOR_ZAPOTE, textAlign: 'right' },

  // FILA: UNA SOLA COLUMNA (Para listas cortas)
  tableItemFull: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 8, // Aún más espacio al haber pocas
    paddingHorizontal: 10,
    borderBottom: '1pt solid #EEEEEE',
    alignItems: 'center',
  },
  tdModelFull: { width: '70%', fontSize: 9, color: '#000000', fontWeight: 'bold', paddingRight: 10, textTransform: 'uppercase' },
  tdPriceFull: { width: '30%', fontSize: 11, fontWeight: 'bold', color: COLOR_ZAPOTE, textAlign: 'right' },

  // PIE DE PÁGINA
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 3,
  },
  footerText: { fontSize: 8, color: '#FFFFFF', fontWeight: 'bold', textShadow: '1px 1px 0px #000' }
});

const CatalogoDocument = ({ productos, fechaHoy }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <Image 
        src="/fondo_racing.png" 
        style={styles.backgroundImage} 
        fixed 
      />

      {productos.map((grupo, index) => {
        // 🧠 LA LÓGICA INTELIGENTE: ¿Son 3 referencias o menos?
        const isSingleColumn = grupo.referencias.length <= 3;

        return (
          <View key={index} style={styles.productBox} wrap={false}>
            
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>{grupo.nombre}</Text>
            </View>

            <View style={styles.boxBody}>
              <View style={styles.imageSection}>
                <Image style={styles.image} src={grupo.imagenDefault} />
              </View>

              <View style={styles.tableSection}>
                
                {/* RENDERIZADO CONDICIONAL DE LA CABECERA */}
                <View style={styles.tableHead}>
                  {isSingleColumn ? (
                    <View style={styles.fullHead}>
                      <Text style={styles.thModelFull}>REF / APLICACIÓN</Text>
                      <Text style={styles.thPriceFull}>PRECIO UNITARIO</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.halfHead}>
                        <Text style={styles.thModelHalf}>REF / APLICACIÓN</Text>
                        <Text style={styles.thPriceHalf}>PRECIO UNITARIO</Text>
                      </View>
                      <View style={[styles.halfHead, { borderLeft: '1pt solid #333' }]}>
                        <Text style={styles.thModelHalf}>REF / APLICACIÓN</Text>
                        <Text style={styles.thPriceHalf}>PRECIO UNITARIO</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* RENDERIZADO CONDICIONAL DEL CUERPO (FILAS) */}
                <View style={styles.tableBody}>
                  {grupo.referencias.map((ref, i) => {
                    if (isSingleColumn) {
                      // Diseño de Ancho Completo (Para 1 a 3 items)
                      const isEvenRow = i % 2 === 0;
                      return (
                        <View 
                          key={i} 
                          style={[styles.tableItemFull, { backgroundColor: isEvenRow ? '#FFFFFF' : '#FAFAFA' }]}
                        >
                          <Text style={styles.tdModelFull}>{ref.modelo}</Text>
                          <Text style={styles.tdPriceFull}>{formatoPeso(ref.precio)}</Text>
                        </View>
                      );
                    } else {
                      // Diseño a Doble Columna (Para 4+ items)
                      const isEvenRow = Math.floor(i / 2) % 2 === 0;
                      const isLeftCol = i % 2 === 0;
                      return (
                        <View 
                          key={i} 
                          style={[
                            styles.tableItemHalf, 
                            { 
                              backgroundColor: isEvenRow ? '#FFFFFF' : '#FAFAFA',
                              borderRight: isLeftCol ? '1pt dashed #CCCCCC' : 'none' 
                            }
                          ]}
                        >
                          <Text style={styles.tdModelHalf}>{ref.modelo}</Text>
                          <Text style={styles.tdPriceHalf}>{formatoPeso(ref.precio)}</Text>
                        </View>
                      );
                    }
                  })}
                </View>

              </View>
            </View>
            
          </View>
        );
      })}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>USO EXCLUSIVO DISTRIBUIDORES • {fechaHoy}</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `PÁG. ${pageNumber} / ${totalPages}`} />
      </View>

    </Page>
  </Document>
);

export default function BotonDescargaPDF({ productos, fechaHoy }) {
  return (
    <PDFDownloadLink 
      document={<CatalogoDocument productos={productos} fechaHoy={fechaHoy} />} 
      fileName="Catalogo_Premium_Racing_Oficial.pdf"
      style={{
        backgroundColor: COLOR_ZAPOTE, // Botón también en color Zapote
        color: '#FFFFFF',
        padding: '12px 24px',
        borderRadius: '2px',
        fontWeight: '900',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000' 
      }}
    >
      {({ loading }) => (loading ? 'OPTIMIZANDO DISEÑO...' : '📥 DESCARGAR CATÁLOGO')}
    </PDFDownloadLink>
  );
}