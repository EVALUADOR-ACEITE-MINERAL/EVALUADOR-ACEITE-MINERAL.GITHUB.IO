/*
 * Motor de evaluación. No contiene valores de la norma: todos se leen de criterios.js.
 * Las reglas marcadas "DECISIÓN DE DISEÑO" no provienen de la NTC 3284 y se informan
 * al usuario en el resultado.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./criterios.js'));
  } else {
    root.EvaluadorNTC3284 = factory(root.CriteriosNTC3284);
  }
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  var P = C.PARAMETROS;

  var ESTADOS = {
    GRUPO_I: { clave: 'GRUPO_I', etiqueta: 'Grupo I – satisfactorio para continuar', tono: 'verde', icono: '✔' },
    GRUPO_II: { clave: 'GRUPO_II', etiqueta: 'Grupo II – por reacondicionar', tono: 'ambar', icono: '▲' },
    GRUPO_III: { clave: 'GRUPO_III', etiqueta: 'Grupo III – por regenerar', tono: 'rojo', icono: '✖' },
    FUERA_GRUPO_I: { clave: 'FUERA_GRUPO_I', etiqueta: 'Fuera del límite de Grupo I (grupo no definido)', tono: 'ambar', icono: '!' },
    AMBIGUO: { clave: 'AMBIGUO', etiqueta: 'Criterio ambiguo – requiere aclaración', tono: 'gris', icono: '?' },
    NO_CUBIERTO: { clave: 'NO_CUBIERTO', etiqueta: 'No cubierto por la norma (aceite en servicio)', tono: 'gris', icono: '⊘' },
    NO_APLICABLE: { clave: 'NO_APLICABLE', etiqueta: 'Límite no aplicable a esta muestra', tono: 'gris', icono: '⊘' },
    DATOS_INSUFICIENTES: { clave: 'DATOS_INSUFICIENTES', etiqueta: 'Datos insuficientes', tono: 'gris', icono: '…' },
    SIN_DATO: { clave: 'SIN_DATO', etiqueta: 'Sin dato', tono: 'neutro', icono: '—' },
    REF_CUMPLE: { clave: 'REF_CUMPLE', etiqueta: 'Cumple valor citado de NTC 1465 (informativo)', tono: 'info', icono: 'i' },
    REF_NO_CUMPLE: { clave: 'REF_NO_CUMPLE', etiqueta: 'No cumple valor citado de NTC 1465 (informativo)', tono: 'info-alerta', icono: 'i' },
    INFORMATIVO: { clave: 'INFORMATIVO', etiqueta: 'Dato informativo', tono: 'neutro', icono: 'i' }
  };

  var GENERAL = {
    FAVORABLE: { clave: 'FAVORABLE', etiqueta: 'Condición favorable', tono: 'verde', icono: '✔' },
    ALERTA: { clave: 'ALERTA', etiqueta: 'Alerta', tono: 'ambar', icono: '▲' },
    CRITICA: { clave: 'CRITICA', etiqueta: 'Condición crítica', tono: 'rojo', icono: '✖' },
    NO_DETERMINADO: { clave: 'NO_DETERMINADO', etiqueta: 'No determinado', tono: 'gris', icono: '?' }
  };

  // Validación física mínima. DECISIÓN DE DISEÑO: estos topes no provienen de la norma,
  // solo rechazan valores imposibles (negativos, porcentajes > 100).
  var CAMPOS_NUMERICOS = {
    ruptura: { min: 0 },
    agua: { min: 0 },
    nn: { min: 0 },
    tensionInterfasial: { min: 0 },
    fdd25: { min: 0, max: 100 },
    fdd100: { min: 0, max: 100 },
    resistividad90: { min: 0 },
    resistividad20: { min: 0 },
    color: { min: 0 },
    puntoInflamacion: {},
    puntoFluidez: {},
    gravedadEspecifica: { minExclusivo: 0 },
    viscosidad40: { minExclusivo: 0 },
    temperaturaMuestra: {}
  };

  var ORDEN = ['ruptura', 'agua', 'nn', 'tensionInterfasial', 'fdd25', 'fdd100', 'resistividad90', 'resistividad20',
    'color', 'aspecto', 'puntoInflamacion', 'puntoFluidez', 'gravedadEspecifica', 'viscosidad40', 'temperaturaMuestra'];

  var GRUPOS_ORDEN = ['I', 'II', 'III'];
  var SEVERIDAD = { GRUPO_I: 0, GRUPO_II: 1, GRUPO_III: 2 };

  // ---------------------------------------------------------------- utilidades

  function fmt(n) {
    return String(n).replace('.', ',');
  }

  function parsearNumero(texto) {
    if (texto === null || texto === undefined) return { vacio: true };
    var s = String(texto).trim();
    if (s === '') return { vacio: true };
    if (/^[+-]?(\d+([.,]\d+)?|[.,]\d+)$/.test(s)) {
      return { valor: Number(s.replace(',', '.')) };
    }
    if (/^[+-]?[\d.,]+\s*[^\d\s.,]+/.test(s)) {
      return { error: 'Escriba solo el número; la unidad ya está indicada junto al campo.' };
    }
    return { error: 'Ingrese un número válido (use coma o punto decimal, sin separador de miles).' };
  }

  function textoCriterio(c) {
    if (!c) return '—';
    switch (c.op) {
      case '>=': return '≥ ' + fmt(c.v);
      case '<=': return '≤ ' + fmt(c.v);
      case '>': return '> ' + fmt(c.v);
      case '<': return '< ' + fmt(c.v);
      case 'rango': return fmt(c.min) + '–' + fmt(c.max) + ' (inclusividad no especificada)';
      case 'ambiguo': return 'ambiguo';
      default: return '?';
    }
  }

  function comparar(c, x) {
    switch (c.op) {
      case '>=': return x >= c.v ? 'si' : 'no';
      case '<=': return x <= c.v ? 'si' : 'no';
      case '>': return x > c.v ? 'si' : 'no';
      case '<': return x < c.v ? 'si' : 'no';
      case 'rango':
        if (x > c.min && x < c.max) return 'si';
        if (x === c.min || x === c.max) return 'borde';
        return 'no';
      default: return 'ambiguo';
    }
  }

  /*
   * Clasifica un valor contra los criterios de Grupo I/II/III de la Tabla 1 para una categoría.
   * Reglas:
   *  - Los símbolos ≥, ≤, >, < se aplican literalmente (inclusivos o exclusivos según la norma).
   *  - Un valor en el extremo de un rango "a–b" (inclusividad no especificada) solo se clasifica
   *    si otro criterio con símbolo explícito lo incluye; si no, queda AMBIGUO.
   *  - DECISIÓN DE DISEÑO: si el valor satisface dos grupos a la vez (solapamiento en la tabla),
   *    se asigna el más severo y se informa.
   *  - Si no cumple Grupo I y no cae en ningún otro criterio, queda FUERA_GRUPO_I (sin grupo).
   */
  function clasificar(def, cat, x) {
    var detalles = [];
    var notas = [];
    var si = [], bordes = [], ambiguos = [];
    var partesCriterio = [];

    GRUPOS_ORDEN.forEach(function (g) {
      var c = def[g] && def[g][cat];
      partesCriterio.push('Grupo ' + g + ': ' + (c ? (c.op === 'ambiguo' ? 'ambiguo en la norma' : textoCriterio(c)) : '—'));
      if (!c) return;
      var r = comparar(c, x);
      if (r === 'si') { si.push(g); detalles.push('Grupo ' + g + ' (' + textoCriterio(c) + '): el valor cumple el criterio.'); }
      else if (r === 'borde') { bordes.push(g); detalles.push('Grupo ' + g + ' (' + textoCriterio(c) + '): el valor coincide con un extremo del rango.'); }
      else if (r === 'ambiguo') { ambiguos.push(g); detalles.push('Grupo ' + g + ': ' + c.texto + '.'); }
      else { detalles.push('Grupo ' + g + ' (' + textoCriterio(c) + '): el valor no cumple el criterio.'); }
    });

    var estado;
    if (si.length) {
      var g = si[si.length - 1];
      estado = ESTADOS['GRUPO_' + g];
      if (si.length > 1) {
        notas.push('El valor satisface a la vez los criterios de los Grupos ' + si.join(' y ') +
          '. La Tabla 1 no indica cómo resolver el solapamiento; DECISIÓN DE DISEÑO: se asigna el grupo más severo (Grupo ' + g + ').');
      }
      if (bordes.length) {
        notas.push('El valor es el extremo de un rango cuya inclusividad la norma no especifica (Grupo ' + bordes.join(', ') +
          '); se asigna el grupo cuyo criterio explícito (≤, ≥, <, >) lo incluye.');
      }
    } else if (bordes.length) {
      estado = ESTADOS.AMBIGUO;
      notas.push('El valor coincide con el extremo del rango del Grupo ' + bordes.join(', ') +
        ' y la norma no indica si los extremos de "a–b" son inclusivos. No se asigna grupo.');
    } else if (def.I && def.I[cat]) {
      estado = ESTADOS.FUERA_GRUPO_I;
      if (ambiguos.length) {
        notas.push('El valor no cumple el límite de Grupo I. El criterio de Grupo ' + ambiguos.join(', ') +
          ' es ambiguo en la norma, por lo que no se asigna grupo automáticamente.');
      } else {
        notas.push('El valor no cumple el límite de Grupo I y no cae dentro de ningún otro criterio tabulado (Grupo II/III no definidos o fuera de su rango).');
      }
    } else {
      estado = ESTADOS.NO_CUBIERTO;
    }

    return { estado: estado, criterio: partesCriterio.join(' · '), detalles: detalles, notas: notas };
  }

  function resultado(id, extra) {
    var meta = P[id];
    var r = {
      id: id,
      nombre: meta.nombre,
      unidad: meta.unidad,
      metodo: meta.metodo || '',
      referencia: meta.referencia,
      valor: null,
      valorTexto: '',
      criterio: '',
      estado: ESTADOS.SIN_DATO,
      explicacion: [],
      notas: [],
      afectaSemaforo: true
    };
    for (var k in extra) r[k] = extra[k];
    return r;
  }

  function sinDato(id, afecta) {
    return resultado(id, { explicacion: ['No se ingresó valor.'], afectaSemaforo: afecta !== false });
  }

  // ---------------------------------------------------------------- validación

  function validar(entrada) {
    var errores = [];
    var valores = {};
    var v = entrada.valores || {};

    var cat = entrada.categoria;
    if (!cat) {
      errores.push({ campo: 'categoria', mensaje: 'Seleccione la categoría del equipo (Sección 6).' });
    } else if (!C.CATEGORIAS[cat]) {
      errores.push({ campo: 'categoria', mensaje: 'Categoría desconocida: ' + cat + '.' });
    } else if (C.CATEGORIAS[cat].redirigir) {
      errores.push({ campo: 'categoria', mensaje: 'Categoría F: la Sección 6, nota 1, asigna a los conmutadores bajo carga la misma categoría del transformador asociado. Seleccione esa categoría.' });
    }

    Object.keys(CAMPOS_NUMERICOS).forEach(function (id) {
      var regla = CAMPOS_NUMERICOS[id];
      var p = parsearNumero(v[id]);
      if (p.vacio) { valores[id] = null; return; }
      if (p.error) { errores.push({ campo: id, mensaje: p.error }); return; }
      var x = p.valor;
      if (regla.min !== undefined && x < regla.min) {
        errores.push({ campo: id, mensaje: 'El valor no puede ser negativo.' }); return;
      }
      if (regla.minExclusivo !== undefined && x <= regla.minExclusivo) {
        errores.push({ campo: id, mensaje: 'El valor debe ser mayor que ' + fmt(regla.minExclusivo) + '.' }); return;
      }
      if (regla.max !== undefined && x > regla.max) {
        errores.push({ campo: id, mensaje: 'Un porcentaje no puede superar ' + fmt(regla.max) + ' %.' }); return;
      }
      valores[id] = x;
    });

    var aspecto = v.aspecto || '';
    if (['', 'claro', 'no_claro'].indexOf(aspecto) === -1) {
      errores.push({ campo: 'aspecto', mensaje: 'Opción de aspecto no válida.' });
    }
    valores.aspecto = aspecto || null;

    if (valores.ruptura !== null && valores.ruptura !== undefined) {
      if (!entrada.metodoRuptura) {
        errores.push({ campo: 'metodoRuptura', mensaje: 'Seleccione el método de ensayo de la tensión de ruptura: los límites dependen del método.' });
      } else if (!P.ruptura.metodos[entrada.metodoRuptura]) {
        errores.push({ campo: 'metodoRuptura', mensaje: 'Método de ensayo no reconocido.' });
      }
    }

    var algunValor = ORDEN.some(function (id) { return valores[id] !== null && valores[id] !== undefined; });
    if (!algunValor && !errores.some(function (e) { return e.campo !== 'categoria'; })) {
      errores.push({ campo: 'general', mensaje: 'Ingrese al menos un valor medido.' });
    }

    return { errores: errores, valores: valores };
  }

  // ---------------------------------------------------------------- evaluación por parámetro

  function evaluarClasificable(id, def, cat, x, extraNotas) {
    if (x === null) return sinDato(id);
    var c = clasificar(def, cat, x);
    return resultado(id, {
      valor: x, valorTexto: fmt(x), criterio: c.criterio, estado: c.estado,
      explicacion: c.detalles, notas: c.notas.concat(extraNotas || [])
    });
  }

  function evaluarParametros(cat, metodo, val) {
    var out = {};

    // Tensión de ruptura
    if (val.ruptura === null) {
      out.ruptura = sinDato('ruptura');
    } else {
      var m = P.ruptura.metodos[metodo];
      out.ruptura = evaluarClasificable('ruptura', m, cat, val.ruptura);
      out.ruptura.metodo = m.etiqueta;
      if (out.ruptura.estado !== ESTADOS.GRUPO_I) {
        out.ruptura.notas.push('8.4 b): si la tensión de ruptura está por debajo de los valores límite, independientemente de los valores de las otras características, deben tomarse las medidas esenciales.');
        out.ruptura.notas.push('8.2.2, nota 1: la determinación del contenido de agua es particularmente necesaria cuando la tensión de ruptura se acerca al valor de rechazo.');
      }
    }

    // Índice de neutralización
    out.nn = evaluarClasificable('nn', P.nn, cat, val.nn);
    if (val.nn !== null && val.nn > P.nn.umbralFrecuencia) {
      out.nn.notas.push('Tabla 2: con índice de neutralización superior a ' + fmt(P.nn.umbralFrecuencia) + ' mg KOH/g se recomienda efectuar los ensayos con más frecuencia.');
    }

    // Contenido de agua (condicionado a la acidez, Tabla 2 nota 1)
    if (val.agua === null) {
      out.agua = sinDato('agua');
    } else {
      var hip = clasificar(P.agua, cat, val.agua);
      var lim = P.agua.acidezMaximaAplicable;
      if (val.nn === null) {
        out.agua = resultado('agua', {
          valor: val.agua, valorTexto: fmt(val.agua), criterio: hip.criterio, estado: ESTADOS.DATOS_INSUFICIENTES,
          explicacion: ['Tabla 2, nota 1: los valores de contenido de agua solo se aplican cuando la acidez no sobrepasa ' + fmt(lim) +
            ' mg KOH/g. Sin el índice de neutralización no se puede confirmar que el límite aplique.',
            'Comparación informativa (no usada en el semáforo): ' + hip.estado.etiqueta + '.']
        });
      } else if (val.nn > lim) {
        out.agua = resultado('agua', {
          valor: val.agua, valorTexto: fmt(val.agua), criterio: hip.criterio, estado: ESTADOS.NO_APLICABLE,
          explicacion: ['Tabla 2, nota 1: los valores de contenido de agua no se aplican cuando la acidez sobrepasa ' + fmt(lim) +
            ' mg KOH/g (índice ingresado: ' + fmt(val.nn) + ').',
            'Comparación informativa (no usada en el semáforo): ' + hip.estado.etiqueta + '.']
        });
      } else {
        out.agua = resultado('agua', {
          valor: val.agua, valorTexto: fmt(val.agua), criterio: hip.criterio, estado: hip.estado,
          explicacion: hip.detalles.concat(['Acidez ' + fmt(val.nn) + ' mg KOH/g ≤ ' + fmt(lim) + ': el límite de agua es aplicable (Tabla 2, nota 1).']),
          notas: hip.notas
        });
      }
      var t = val.temperaturaMuestra, tr = P.agua.temperaturaReferencia;
      if (t === null) {
        out.agua.notas.push('Numeral 4.3: los límites de agua se refieren a temperaturas del aceite en servicio de más de ' + tr.min + ' °C hasta ' + tr.max + ' °C. No se ingresó la temperatura de muestreo.');
      } else if (!(t > tr.min && t <= tr.max)) {
        out.agua.notas.push('Numeral 4.3: los límites de agua se refieren a temperaturas del aceite en servicio de más de ' + tr.min + ' °C hasta ' + tr.max + ' °C; la muestra se tomó a ' + fmt(t) + ' °C. Interprete con cautela (ver Figura 1).');
      }
    }

    // Tensión interfasial
    out.tensionInterfasial = evaluarClasificable('tensionInterfasial', P.tensionInterfasial, cat, val.tensionInterfasial,
      val.tensionInterfasial === null ? [] : ['La Tabla 1 no indica la unidad de la tensión interfasial. Verifique que el laboratorio reporte en la misma unidad que la norma de referencia.']);

    // Factor de potencia 25 °C
    out.fdd25 = evaluarClasificable('fdd25', P.fdd25, cat, val.fdd25);
    if (out.fdd25.estado === ESTADOS.FUERA_GRUPO_I) {
      out.fdd25.notas.push('El numeral 8.3 asocia valores altos del factor de disipación con el Grupo 3, pero la Tabla 1 no fija un límite de Grupo II ni de Grupo III para este ensayo. No se asigna grupo.');
    }

    // Parámetros sin criterio en servicio
    ['fdd100', 'color'].forEach(function (id) {
      if (val[id] === null) { out[id] = sinDato(id, false); return; }
      out[id] = resultado(id, {
        valor: val[id], valorTexto: fmt(val[id]), criterio: 'Sin criterio para aceite en servicio',
        estado: ESTADOS.NO_CUBIERTO, explicacion: [P[id].sinCriterioEnServicio], afectaSemaforo: false
      });
    });

    // Resistividad: criterio ambiguo
    ['resistividad90', 'resistividad20'].forEach(function (id) {
      if (val[id] === null) { out[id] = sinDato(id, false); return; }
      out[id] = resultado(id, {
        valor: val[id], valorTexto: fmt(val[id]),
        criterio: 'Valor impreso para categoría ' + cat + ': ' + P[id].textoTabla[cat] + ' (columna Grupo II)',
        estado: ESTADOS.AMBIGUO, explicacion: [P[id].ambiguo]
      });
    });

    // Aspecto visual
    if (!val.aspecto) {
      out.aspecto = sinDato('aspecto');
    } else if (val.aspecto === 'claro') {
      out.aspecto = resultado('aspecto', {
        valorTexto: P.aspecto.textoGrupoI, criterio: 'Grupo I: ' + P.aspecto.textoGrupoI, estado: ESTADOS.GRUPO_I,
        explicacion: ['El aspecto informado coincide con el criterio de Grupo I de la Tabla 1.']
      });
    } else {
      out.aspecto = resultado('aspecto', {
        valorTexto: 'Turbio, sucio o con sedimentos', criterio: 'Grupo I: ' + P.aspecto.textoGrupoI, estado: ESTADOS.FUERA_GRUPO_I,
        explicacion: ['El aspecto informado no cumple el criterio de Grupo I de la Tabla 1.'],
        notas: ['El numeral 8.3 describe que un aceite del Grupo 2 "puede tener un aspecto turbio o sucio" y que el numeral 4.1 lo relaciona con agua libre, lodos, carbón o fibras; esto es descriptivo y no un criterio de clasificación, por lo que no se asigna grupo.']
      });
    }

    // Propiedades físicas (informativas, no afectan el semáforo)
    ['puntoInflamacion', 'gravedadEspecifica', 'viscosidad40'].forEach(function (id) {
      if (val[id] === null) { out[id] = sinDato(id, false); return; }
      var ref = P[id].informativo;
      var cumple = comparar(ref, val[id]) === 'si';
      out[id] = resultado(id, {
        valor: val[id], valorTexto: fmt(val[id]), criterio: 'NTC 1465 (citada): ' + ref.texto,
        estado: cumple ? ESTADOS.REF_CUMPLE : ESTADOS.REF_NO_CUMPLE,
        explicacion: [(cumple ? 'Cumple' : 'No cumple') + ' el valor que la nota de la Tabla 1 cita de la NTC 1465.',
          'La nota no aclara si estos valores aplican a aceites en servicio; los numerales 4.10 a 4.12 indican que estas propiedades sirven sobre todo para identificar el aceite. Por eso no se usan en el semáforo.'],
        afectaSemaforo: false
      });
    });
    if (val.puntoFluidez === null) {
      out.puntoFluidez = sinDato('puntoFluidez', false);
    } else {
      out.puntoFluidez = resultado('puntoFluidez', {
        valor: val.puntoFluidez, valorTexto: fmt(val.puntoFluidez), criterio: 'Texto de la norma: "min, °C -30"',
        estado: ESTADOS.AMBIGUO, explicacion: [P.puntoFluidez.ambiguo], afectaSemaforo: false
      });
    }

    if (val.temperaturaMuestra === null) {
      out.temperaturaMuestra = sinDato('temperaturaMuestra', false);
    } else {
      out.temperaturaMuestra = resultado('temperaturaMuestra', {
        valor: val.temperaturaMuestra, valorTexto: fmt(val.temperaturaMuestra), criterio: 'Dato de muestreo (numeral 5)',
        estado: ESTADOS.INFORMATIVO, explicacion: ['El numeral 5 recomienda anotar la temperatura del aceite al tomar la muestra.'], afectaSemaforo: false
      });
    }

    return ORDEN.map(function (id) { return out[id]; });
  }

  // ---------------------------------------------------------------- resultado general

  var NUCLEO = ['ruptura', 'agua', 'nn', 'aspecto', 'fdd25'];

  function evaluarGeneral(params) {
    var porId = {};
    params.forEach(function (p) { porId[p.id] = p; });
    var afectan = params.filter(function (p) { return p.afectaSemaforo; });
    var motivos = [], notas = [];

    var g3 = afectan.filter(function (p) { return p.estado === ESTADOS.GRUPO_III; });
    var g2 = afectan.filter(function (p) { return p.estado === ESTADOS.GRUPO_II || p.estado === ESTADOS.FUERA_GRUPO_I; });
    var bloq = afectan.filter(function (p) {
      return [ESTADOS.AMBIGUO, ESTADOS.DATOS_INSUFICIENTES, ESTADOS.NO_APLICABLE].indexOf(p.estado) !== -1;
    });
    var faltan = NUCLEO.filter(function (id) { return porId[id].estado === ESTADOS.SIN_DATO; });

    var gen;
    if (g3.length) {
      gen = GENERAL.CRITICA;
      g3.forEach(function (p) { motivos.push(p.nombre + ': ' + p.estado.etiqueta + '.'); });
      g2.forEach(function (p) { motivos.push(p.nombre + ': ' + p.estado.etiqueta + '.'); });
    } else if (g2.length) {
      gen = GENERAL.ALERTA;
      g2.forEach(function (p) { motivos.push(p.nombre + ': ' + p.estado.etiqueta + '.'); });
    } else {
      var nucleoOk = NUCLEO.every(function (id) { return porId[id].estado === ESTADOS.GRUPO_I; });
      if (nucleoOk && !bloq.length) {
        gen = GENERAL.FAVORABLE;
        motivos.push('Los ensayos del numeral 8.2.2 (aspecto, tensión de ruptura, factor de disipación, índice de neutralización y contenido de agua) están en Grupo I.');
      } else {
        gen = GENERAL.NO_DETERMINADO;
        if (faltan.length) {
          motivos.push('Faltan ensayos del numeral 8.2.2: ' + faltan.map(function (id) { return porId[id].nombre; }).join(', ') + '.');
        }
        bloq.forEach(function (p) { motivos.push(p.nombre + ': ' + p.estado.etiqueta + '.'); });
        if (!motivos.length) motivos.push('No hay datos suficientes para emitir una condición.');
      }
    }

    if (gen === GENERAL.CRITICA || gen === GENERAL.ALERTA) {
      if (faltan.length || bloq.length) {
        notas.push('Evaluación incompleta (' + faltan.concat(bloq.map(function (p) { return p.id; }))
          .map(function (id) { return porId[id].nombre; }).join(', ') + '): la condición real podría ser igual o más severa.');
      }
      var soloOtras = g3.concat(g2).every(function (p) { return p.id !== 'ruptura'; });
      if (soloOtras) {
        notas.push('8.3, Grupo 1: con la excepción de la tensión de ruptura, que una o varias propiedades estén fuera de los límites no requiere acción inmediata, aunque a largo plazo puede acelerar la degradación. 8.4 b): por regla general, muchas características deben ser desfavorables para justificar una medida.');
      } else {
        notas.push('8.4 b): la tensión de ruptura está por debajo del límite; según la norma, independientemente de las demás características, deben tomarse las medidas esenciales.');
      }
      notas.push('8.4 a): cuando un resultado está fuera de los límites, compárelo con resultados anteriores y, si es necesario, tome una nueva muestra para confirmarlo antes de emprender cualquier acción.');
    }
    notas.push('DECISIÓN DE DISEÑO: el semáforo general toma la condición más severa de los parámetros evaluados. La norma (8.3) no define una regla de combinación; la evaluación final corresponde a un especialista.');
    notas.push('El Grupo 4 (descartar) no se asigna automáticamente: la norma no da un criterio numérico para él.');

    var refNo = params.filter(function (p) { return p.estado === ESTADOS.REF_NO_CUMPLE; });
    if (refNo.length) {
      notas.push('Propiedades físicas fuera de los valores citados de NTC 1465 (informativo, no afecta el semáforo): ' +
        refNo.map(function (p) { return p.nombre; }).join(', ') + '. Según 4.10-4.12 pueden indicar mezcla con aceites de otra calidad.');
    }
    var noCub = params.filter(function (p) { return p.estado === ESTADOS.NO_CUBIERTO; });
    if (noCub.length) {
      notas.push('Valores ingresados sin criterio para aceite en servicio (no usados en el semáforo): ' +
        noCub.map(function (p) { return p.nombre; }).join(', ') + '.');
    }

    return { estado: gen, motivos: motivos, notas: notas };
  }

  // ---------------------------------------------------------------- API

  function evaluar(entrada) {
    var v = validar(entrada || {});
    if (v.errores.length) return { valido: false, errores: v.errores };

    var cat = entrada.categoria;
    var infoCat = C.CATEGORIAS[cat];

    if (!infoCat.cubierta) {
      var params = ORDEN.map(function (id) {
        var x = v.valores[id];
        if (x === null || x === undefined) return sinDato(id, false);
        return resultado(id, {
          valor: typeof x === 'number' ? x : null,
          valorTexto: typeof x === 'number' ? fmt(x) : (x === 'claro' ? P.aspecto.textoGrupoI : 'Turbio, sucio o con sedimentos'),
          criterio: 'Sin criterio para la categoría ' + cat,
          estado: ESTADOS.NO_CUBIERTO,
          explicacion: ['La Tabla 1 solo da límites para las categorías C, B, A y O (transformadores y reactores).'],
          afectaSemaforo: false
        });
      });
      return {
        valido: true, errores: [], categoria: cat, infoCategoria: infoCat, norma: C.NORMA, parametros: params,
        general: {
          estado: GENERAL.NO_DETERMINADO,
          motivos: ['Categoría ' + cat + ' (' + infoCat.descripcion + ') no está cubierta por los límites de la Tabla 1.'],
          notas: ['Consulte las instrucciones del fabricante (Sección 6, nota 2; numeral 8.2.2, nota 3).']
        }
      };
    }

    var parametros = evaluarParametros(cat, entrada.metodoRuptura, v.valores);
    return {
      valido: true, errores: [], categoria: cat, infoCategoria: infoCat, norma: C.NORMA,
      parametros: parametros, general: evaluarGeneral(parametros)
    };
  }

  return {
    evaluar: evaluar,
    parsearNumero: parsearNumero,
    clasificar: clasificar,
    ESTADOS: ESTADOS,
    GENERAL: GENERAL,
    CRITERIOS: C
  };
});
