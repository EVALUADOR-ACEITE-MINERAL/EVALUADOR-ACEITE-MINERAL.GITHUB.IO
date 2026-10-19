/* Capa de interfaz: lee el formulario, llama al evaluador y pinta el resultado. */
(function () {
  'use strict';

  var E = window.EvaluadorNTC3284;
  var form = document.getElementById('formulario');
  var seccion = document.getElementById('resultado');
  var erroresGenerales = document.getElementById('errores-generales');
  var mostrarVacios = document.getElementById('mostrar-vacios');
  var ultimo = null;

  var CAMPOS = ['ruptura', 'agua', 'nn', 'fdd25', 'tensionInterfasial', 'fdd100', 'resistividad90', 'resistividad20',
    'color', 'temperaturaMuestra', 'puntoInflamacion', 'puntoFluidez', 'gravedadEspecifica', 'viscosidad40', 'aspecto'];

  function leerEntrada() {
    var valores = {};
    CAMPOS.forEach(function (id) { valores[id] = document.getElementById(id).value; });
    return {
      categoria: document.getElementById('categoria').value,
      metodoRuptura: document.getElementById('metodoRuptura').value,
      valores: valores
    };
  }

  function limpiarErrores() {
    erroresGenerales.hidden = true;
    erroresGenerales.textContent = '';
    form.querySelectorAll('.error').forEach(function (p) { p.hidden = true; p.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }

  function mostrarErrores(errores) {
    var primero = null;
    var lista = document.createElement('ul');
    errores.forEach(function (e) {
      var campo = document.getElementById(e.campo);
      var p = document.getElementById(e.campo + '-error');
      if (campo && p) {
        campo.setAttribute('aria-invalid', 'true');
        p.textContent = '⚠ ' + e.mensaje;
        p.hidden = false;
        if (!primero) primero = campo;
      }
      var li = document.createElement('li');
      var etiqueta = campo ? form.querySelector('label[for="' + e.campo + '"]') : null;
      li.textContent = (etiqueta ? etiqueta.childNodes[0].textContent.trim() + ': ' : '') + e.mensaje;
      lista.appendChild(li);
    });
    erroresGenerales.innerHTML = '<p><strong>Revise los datos antes de evaluar:</strong></p>';
    erroresGenerales.appendChild(lista);
    erroresGenerales.hidden = false;
    seccion.hidden = true;
    (primero || erroresGenerales).focus();
  }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function chip(estado) {
    var c = el('span', 'chip tono-' + estado.tono);
    var i = el('span', 'icono', estado.icono);
    i.setAttribute('aria-hidden', 'true');
    c.appendChild(i);
    c.appendChild(document.createTextNode(' ' + estado.etiqueta));
    return c;
  }

  function lista(ul, items) {
    ul.innerHTML = '';
    items.forEach(function (t) { ul.appendChild(el('li', '', t)); });
  }

  function pintar(r) {
    var g = r.general;
    var sem = document.getElementById('semaforo');
    sem.className = 'semaforo activo-' + g.estado.tono;
    sem.setAttribute('aria-label', 'Semáforo: ' + g.estado.etiqueta);

    var etiqueta = document.getElementById('general-etiqueta');
    etiqueta.className = 'general-etiqueta tono-' + g.estado.tono;
    etiqueta.innerHTML = '';
    var ic = el('span', 'icono', g.estado.icono);
    ic.setAttribute('aria-hidden', 'true');
    etiqueta.appendChild(ic);
    etiqueta.appendChild(document.createTextNode(' ' + g.estado.etiqueta + ' — Categoría ' + r.categoria));

    lista(document.getElementById('general-motivos'), g.motivos);
    lista(document.getElementById('general-notas'), g.notas);

    var tbody = document.querySelector('#tabla-parametros tbody');
    tbody.innerHTML = '';
    r.parametros.forEach(function (p) {
      if (p.estado.clave === 'SIN_DATO' && !mostrarVacios.checked) return;
      var tr = el('tr', 'fila-' + p.estado.tono);
      var th = el('th');
      th.scope = 'row';
      th.appendChild(el('span', 'nombre', p.nombre));
      if (p.metodo) th.appendChild(el('span', 'sub', p.metodo));
      tr.appendChild(th);

      var tdV = el('td');
      tdV.appendChild(el('span', 'valor', p.valorTexto || '—'));
      if (p.valorTexto && p.unidad) tdV.appendChild(el('span', 'sub', p.unidad));
      tr.appendChild(tdV);

      tr.appendChild(el('td', 'criterio', p.criterio || '—'));

      var tdE = el('td');
      tdE.appendChild(chip(p.estado));
      tr.appendChild(tdE);

      var tdP = el('td', 'porque');
      p.explicacion.forEach(function (t) { tdP.appendChild(el('p', '', t)); });
      p.notas.forEach(function (t) { tdP.appendChild(el('p', 'nota', t)); });
      tdP.appendChild(el('p', 'ref', 'Referencia: ' + p.referencia));
      tr.appendChild(tdP);
      tbody.appendChild(tr);
    });

    seccion.hidden = false;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    limpiarErrores();
    var r = E.evaluar(leerEntrada());
    if (!r.valido) { mostrarErrores(r.errores); return; }
    ultimo = r;
    pintar(r);
    document.getElementById('titulo-resultado').focus();
  });

  mostrarVacios.addEventListener('change', function () { if (ultimo) pintar(ultimo); });

  document.getElementById('limpiar').addEventListener('click', function () {
    form.reset();
    limpiarErrores();
    seccion.hidden = true;
    ultimo = null;
  });

  document.getElementById('ejemplo').addEventListener('click', function () {
    var ej = { categoria: 'B', metodoRuptura: 'D877', ruptura: '24', agua: '18', nn: '0,08', fdd25: '0,6',
      aspecto: 'claro', tensionInterfasial: '27', temperaturaMuestra: '45' };
    form.reset();
    limpiarErrores();
    Object.keys(ej).forEach(function (k) { document.getElementById(k).value = ej[k]; });
  });

  document.getElementById('titulo-resultado').tabIndex = -1;
  erroresGenerales.tabIndex = -1;
})();
