/*
 * Criterios extraídos de la NTC 3284 (1991-11-20) "Guía para el mantenimiento y la
 * supervisión de los aceites minerales aislantes en servicio en equipos eléctricos".
 *
 * TODO valor numérico de este archivo se transcribe de la norma. Las páginas citadas
 * son las numeradas en el pie de página del documento (no las del visor PDF).
 *
 * Convención de criterios:
 *   { op: '>=', v }  { op: '<=', v }  { op: '>', v }  { op: '<', v }
 *   { op: 'rango', min, max }      -> la norma escribe "min-max" sin indicar inclusividad
 *   { op: 'ambiguo', texto }       -> la norma imprime algo que no puede aplicarse sin aclaración
 *   null                           -> la norma deja la celda vacía (sin criterio)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CriteriosNTC3284 = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NORMA = {
    codigo: 'NTC 3284',
    fecha: '1991-11-20',
    titulo: 'Electrotecnia. Guía para el mantenimiento y la supervisión de los aceites minerales aislantes en servicio en equipos eléctricos',
    referencia: 'Documento de referencia: IEC 422'
  };

  // Sección 6 (p. 9). La Tabla 1 (p. 19-20) solo da límites para C, B, A y O.
  var CATEGORIAS = {
    O: { cubierta: true, tension: '> 420 kV', descripcion: 'Transformadores de potencia para sistemas con tensiones superiores a 420 kV.' },
    A: { cubierta: true, tension: '170-420 kV', descripcion: 'Transformadores de potencia para sistemas con tensiones superiores a 170 kV y hasta 420 kV; también transformadores de potencia, cualquiera que sea su tensión, cuya continuidad de servicio es vital, y equipos similares para aplicaciones especiales de costos elevados.' },
    B: { cubierta: true, tension: '72,5-170 kV', descripcion: 'Transformadores de potencia para sistemas con tensiones superiores a 72,5 kV y hasta 170 kV (y que no pertenezcan a la categoría A).' },
    C: { cubierta: true, tension: '< 72,5 kV', descripcion: 'Transformadores de potencia para sistemas con tensiones hasta 72,5 kV (que no pertenezcan a la categoría A). Interruptores en aceite, selectores y reguladores de corriente alterna blindados.' },
    D: { cubierta: false, descripcion: 'Transformadores de medida para sistemas con tensiones superiores a 170 kV.' },
    E: { cubierta: false, descripcion: 'Transformadores de medida para sistemas con tensiones hasta 170 kV.' },
    F: { cubierta: false, redirigir: true, descripcion: 'Conmutadores de derivación bajo carga sumergidos en aceite. Sección 6, nota 1: se les asigna la misma categoría que al transformador asociado.' },
    G: { cubierta: false, descripcion: 'Disyuntores sumergidos en aceite. Numeral 8.2.2, nota 3: puede bastar la tensión de ruptura; la Tabla 1 no da límites para esta categoría.' }
  };

  function porCategoria(c, b, a, o) { return { C: c, B: b, A: a, O: o }; }
  function todas(crit) { return porCategoria(crit, crit, crit, crit); }

  var PARAMETROS = {
    ruptura: {
      nombre: 'Tensión de ruptura dieléctrica',
      unidad: 'kV',
      nucleo: true,
      referencia: 'Tabla 1, orden 1 (p. 19); numerales 8.3 y 8.4 b) (p. 12-13)',
      metodos: {
        D877: {
          etiqueta: 'ASTM D877',
          I: porCategoria({ op: '>=', v: 26 }, { op: '>=', v: 26 }, { op: '>=', v: 26 }, { op: '>=', v: 30 }),
          II: porCategoria({ op: '<', v: 26 }, { op: '<', v: 26 }, { op: '<', v: 26 }, { op: '<', v: 30 }),
          III: null
        },
        D1816_004: {
          etiqueta: 'ASTM D1816 (0,04 pulg)',
          I: porCategoria({ op: '>=', v: 23 }, { op: '>=', v: 23 }, { op: '>=', v: 26 }, { op: '>=', v: 26 }),
          II: porCategoria(
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥23", igual que Grupo I (posible errata; para ASTM D877 imprime "<")' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥23", igual que Grupo I (posible errata; para ASTM D877 imprime "<")' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥26", igual que Grupo I (posible errata; para ASTM D877 imprime "<")' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥26", igual que Grupo I (posible errata; para ASTM D877 imprime "<")' }),
          III: null
        },
        D1816_008: {
          etiqueta: 'ASTM D1816 (0,08 pulg)',
          I: porCategoria({ op: '>=', v: 34 }, { op: '>=', v: 34 }, { op: '>=', v: 45 }, { op: '>=', v: 45 }),
          II: porCategoria(
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥34", igual que Grupo I (posible errata)' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥34", igual que Grupo I (posible errata)' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥45", igual que Grupo I (posible errata)' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥45", igual que Grupo I (posible errata)' }),
          III: null
        },
        IEC156: {
          etiqueta: 'IEC 156',
          I: porCategoria({ op: '>=', v: 30 }, { op: '>=', v: 30 }, { op: '>=', v: 40 }, { op: '>=', v: 50 }),
          II: porCategoria(
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥30", igual que Grupo I (posible errata)' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥30", igual que Grupo I (posible errata)' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥40", igual que Grupo I (posible errata)' },
            { op: 'ambiguo', texto: 'La columna Grupo II imprime "≥50", igual que Grupo I (posible errata)' }),
          III: null
        }
      }
    },

    agua: {
      nombre: 'Contenido de humedad (agua)',
      unidad: 'ppm',
      metodo: 'ASTM D1533',
      nucleo: true,
      referencia: 'Tabla 1, orden 3 (p. 19); Tabla 2, nota 1 de "Contenido de agua" (p. 21); numeral 4.3 (p. 4)',
      I: porCategoria({ op: '<=', v: 35 }, { op: '<=', v: 35 }, { op: '<=', v: 25 }, { op: '<=', v: 15 }),
      II: porCategoria({ op: 'rango', min: 35, max: 40 }, { op: 'rango', min: 35, max: 40 }, { op: 'rango', min: 25, max: 30 }, { op: 'rango', min: 15, max: 20 }),
      III: null,
      // Tabla 2, nota 1: "Los valores citados no se aplican sino cuando la acidez no sobrepase 0,1 mg KOH/g".
      acidezMaximaAplicable: 0.1,
      // Numeral 4.3: límites pensados para "temperaturas normales del aceite en servicio a más de 40 °C hasta 60 °C".
      temperaturaReferencia: { min: 40, max: 60 }
    },

    nn: {
      nombre: 'Número (índice) de neutralización',
      unidad: 'mg KOH/g',
      metodo: 'ASTM D974',
      nucleo: true,
      referencia: 'Tabla 1, orden 4 (p. 19); Tabla 2, nota de "Índice de neutralización" (p. 22)',
      I: porCategoria({ op: '<=', v: 0.3 }, { op: '<=', v: 0.2 }, { op: '<=', v: 0.2 }, { op: '<=', v: 0.1 }),
      II: porCategoria({ op: '>', v: 0.3 }, { op: '>', v: 0.2 }, { op: '>', v: 0.2 }, { op: 'rango', min: 0.1, max: 0.2 }),
      III: porCategoria({ op: '>', v: 0.5 }, { op: '>', v: 0.5 }, { op: '>', v: 0.5 }, { op: '>', v: 0.4 }),
      // Tabla 2 (p. 22): "Cuando el índice de neutralización es superior a 0,3 mg KOH/g efectuar los ensayos con más frecuencia."
      umbralFrecuencia: 0.3
    },

    tensionInterfasial: {
      nombre: 'Tensión interfasial',
      unidad: 'sin unidad en la norma',
      metodo: 'ASTM D971',
      nucleo: false,
      referencia: 'Tabla 1, orden 5 (p. 19); numeral 4.7 (p. 5)',
      I: porCategoria({ op: '>=', v: 24 }, { op: '>=', v: 24 }, { op: '>=', v: 26 }, { op: '>=', v: 30 }),
      II: todas({ op: '<', v: 24 }),
      III: todas({ op: '<', v: 15 })
    },

    fdd25: {
      nombre: 'Factor de potencia a 25 °C',
      unidad: '%',
      metodo: 'ASTM D924 (25 °C)',
      nucleo: false, // núcleo compartido con resistividad (8.2.2: "factor de disipación dieléctrica o resistividad")
      referencia: 'Tabla 1, orden 2 (p. 19); numerales 4.6 y 8.3 (p. 5, 13)',
      I: todas({ op: '<=', v: 1.0 }),
      II: null,
      III: null
    },

    fdd100: {
      nombre: 'Factor de potencia a 100 °C',
      unidad: '%',
      metodo: 'ASTM D924 (100 °C)',
      referencia: 'Tabla 1, orden 2 (p. 19)',
      sinCriterioEnServicio: 'La Tabla 1 solo da valores para aceite sin usar (C, B, A ≤ 0,5; O ≤ 0,3) y regenerado (≤ 1,0). Las celdas de aceite en servicio no muestran valor (están bajo la marca de agua del documento).'
    },

    resistividad90: {
      nombre: 'Resistividad a 90 °C',
      unidad: 'GΩ·m',
      metodo: 'IEC 247',
      referencia: 'Tabla 1, orden 10 (p. 20)',
      ambiguo: 'La Tabla 1 imprime "Gm" como unidad y ubica los valores (C > 0,2; B > 0,2; A > 1; O > 1, lectura parcial por la marca de agua) en la columna "Grupo II por reacondicionar", sin valores en Grupo I ni Grupo III. No es posible derivar un grupo sin aclaración.',
      textoTabla: porCategoria('> 0,2', '> 0,2', '> 1', '> 1')
    },

    resistividad20: {
      nombre: 'Resistividad a 20 °C',
      unidad: 'GΩ·m',
      metodo: 'IEC 247',
      referencia: 'Tabla 1, orden 10 (p. 20)',
      ambiguo: 'La Tabla 1 ubica los valores (C > 60; B > 200; A > 200; O > 60, lectura parcial por la marca de agua) en la columna "Grupo II por reacondicionar", sin valores en Grupo I ni Grupo III, y sin unidad explícita para esta fila. No es posible derivar un grupo sin aclaración.',
      textoTabla: porCategoria('> 60', '> 200', '> 200', '> 60')
    },

    color: {
      nombre: 'Color',
      unidad: 'escala ASTM D1500',
      metodo: 'ASTM D1500',
      referencia: 'Tabla 1, orden 6 (p. 20); numeral 4.1 (p. 3)',
      sinCriterioEnServicio: 'La Tabla 1 solo da límites para aceite sin usar (≤ 1,0) y regenerado (≤ 1,5). Para aceite en servicio la celda está vacía. El numeral 4.1 indica que un color fuerte o que cambia rápidamente puede indicar degradación o contaminación.'
    },

    aspecto: {
      nombre: 'Aspecto visual',
      unidad: 'inspección visual',
      metodo: 'ASTM D1524',
      nucleo: true,
      referencia: 'Tabla 1, orden 7 (p. 20); numeral 8.3, Grupo 2 (p. 12-13)',
      textoGrupoI: 'Claro y libre de sedimentos'
    },

    // Propiedades físicas: nota bajo la Tabla 1 (p. 20), que remite a la NTC 1465.
    puntoInflamacion: {
      nombre: 'Punto de inflamación',
      unidad: '°C',
      metodo: 'ASTM D92',
      referencia: 'Nota bajo la Tabla 1 (p. 20) — remite a NTC 1465; numeral 4.9 (p. 7)',
      informativo: { op: '>=', v: 145, texto: 'mín. 145 °C' }
    },
    puntoFluidez: {
      nombre: 'Punto de fluidez',
      unidad: '°C',
      metodo: 'ASTM D97',
      referencia: 'Nota bajo la Tabla 1 (p. 20) — remite a NTC 1465; numeral 4.10 (p. 7)',
      ambiguo: 'La nota de la Tabla 1 escribe "Punto de fluidez, min, °C -30". Un mínimo de -30 °C no es coherente con el significado del ensayo (4.10); podría tratarse de un máximo. No se aplica sin aclaración.'
    },
    gravedadEspecifica: {
      nombre: 'Gravedad específica 15 °C/15 °C',
      unidad: 'adimensional',
      metodo: 'ASTM D1298',
      referencia: 'Nota bajo la Tabla 1 (p. 20) — remite a NTC 1465; numeral 4.11 (p. 7)',
      informativo: { op: '<=', v: 0.91, texto: 'máx. 0,91' }
    },
    viscosidad40: {
      nombre: 'Viscosidad a 40 °C',
      unidad: 'mm²/s (cSt)',
      metodo: 'ASTM D88, D445',
      referencia: 'Nota bajo la Tabla 1 (p. 20) — remite a NTC 1465; numeral 4.12 (p. 7)',
      informativo: { op: '<=', v: 12.0, texto: 'máx. 12,0 mm²/s' }
    },

    temperaturaMuestra: {
      nombre: 'Temperatura del aceite al muestrear',
      unidad: '°C',
      referencia: 'Numeral 5 (p. 8-9); numeral 4.3 (p. 4)'
    }
  };

  var GRUPOS = {
    I: { nombre: 'Grupo 1', texto: 'Aceite cuyo estado es satisfactorio para continuar en servicio (8.3).' },
    II: { nombre: 'Grupo 2', texto: 'Aceite que necesita solamente un tratamiento de reacondicionamiento (8.3).' },
    III: { nombre: 'Grupo 3', texto: 'Aceite en mal estado que solo puede restaurarse mediante regeneración, o reemplazarse (8.3).' },
    IV: { nombre: 'Grupo 4', texto: 'Aceite de calidad tan mala que se aconseja descartarlo; "corresponde a muchas propiedades insatisfactorias" (8.3). La norma no da un criterio numérico para este grupo.' }
  };

  return { NORMA: NORMA, CATEGORIAS: CATEGORIAS, PARAMETROS: PARAMETROS, GRUPOS: GRUPOS };
});
