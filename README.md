# Evaluador de aceite mineral aislante en servicio (NTC 3284)

Aplicación web para evaluar una muestra de aceite mineral aislante **en servicio** según la
**NTC 3284 (ICONTEC, 1991-11-20)**, *Guía para el mantenimiento y la supervisión de los aceites
minerales aislantes en servicio en equipos eléctricos* (documento de referencia: IEC 422). El
resultado se presenta con un semáforo, una etiqueta de texto y un icono, y con el detalle por parámetro.

> **Advertencia.** Es una herramienta de apoyo. No reemplaza el análisis de un especialista ni el
> procedimiento oficial de laboratorio. La propia norma (8.3) dice que sus límites "son solamente indicativos".

Las páginas citadas son las **impresas al pie de la norma** (la Tabla 1 está en las páginas 19-20).

---

## 1. Criterios extraídos de la norma

### 1.1 Categorías de equipo (Sección 6, p. 9)

| Cat. | Equipo | ¿La Tabla 1 da límites? |
|---|---|---|
| O | Transformadores de potencia > 420 kV | Sí |
| A | Transformadores de potencia > 170 kV y hasta 420 kV, o de continuidad de servicio vital | Sí |
| B | Transformadores de potencia > 72,5 kV y hasta 170 kV | Sí |
| C | Transformadores de potencia hasta 72,5 kV; interruptores, selectores y reguladores blindados | Sí |
| D, E | Transformadores de medida | No |
| F | Conmutadores bajo carga: misma categoría que el transformador asociado (nota 1) | Vía la categoría asociada |
| G | Disyuntores | No (8.2.2, nota 3: puede bastar la tensión de ruptura) |

### 1.2 Clasificación de aceites en servicio (8.3, p. 12-13)

| Grupo | Significado según la norma | Uso en la app |
|---|---|---|
| Grupo 1 | Satisfactorio para continuar en servicio | Verde, "Condición favorable" |
| Grupo 2 | Necesita solo reacondicionamiento | Ámbar, "Alerta" |
| Grupo 3 | Mal estado; solo se restaura con regeneración, o reemplazar | Rojo, "Condición crítica" |
| Grupo 4 | Calidad tan mala que se aconseja descartarlo ("muchas propiedades insatisfactorias") | **No se asigna**: no hay criterio numérico |

### 1.3 Límites de la Tabla 1 para aceite en servicio (p. 19-20)

Orden de categorías en cada celda: **C / B / A / O**.

| Parámetro | Unidad | Método | Grupo I (continuar) | Grupo II (reacondicionar) | Grupo III (regenerar) | Referencia |
|---|---|---|---|---|---|---|
| Tensión de ruptura | kV | ASTM D877 | ≥26 / ≥26 / ≥26 / ≥30 | <26 / <26 / <26 / <30 | — | Tabla 1, orden 1 |
| Tensión de ruptura | kV | ASTM D1816 (0,04 pulg) | ≥23 / ≥23 / ≥26 / ≥26 | impreso "≥23 / ≥23 / ≥26 / ≥26" **(ambiguo)** | — | Tabla 1, orden 1 |
| Tensión de ruptura | kV | ASTM D1816 (0,08 pulg) | ≥34 / ≥34 / ≥45 / ≥45 | impreso "≥34 / ≥34 / ≥45 / ≥45" **(ambiguo)** | — | Tabla 1, orden 1 |
| Tensión de ruptura | kV | IEC 156 | ≥30 / ≥30 / ≥40 / ≥50 | impreso "≥30 / ≥30 / ≥40 / ≥50" **(ambiguo)** | — | Tabla 1, orden 1 |
| Factor de potencia 25 °C | % | ASTM D924 | ≤1,0 (todas) | — | — | Tabla 1, orden 2 |
| Factor de potencia 100 °C | % | ASTM D924 | sin valor en servicio | — | — | Tabla 1, orden 2 |
| Contenido de humedad | ppm | ASTM D1533 | ≤35 / ≤35 / ≤25 / ≤15 | 35-40 / 35-40 / 25-30 / 15-20 | — | Tabla 1, orden 3 |
| Índice de neutralización | mg KOH/g | ASTM D974 | ≤0,3 / ≤0,2 / ≤0,2 / ≤0,1 | >0,3 / >0,2 / >0,2 / 0,1-0,2 | >0,5 / >0,5 / >0,5 / >0,4 | Tabla 1, orden 4 |
| Tensión interfasial | **no indicada** | ASTM D971 | ≥24 / ≥24 / ≥26 / ≥30 | <24 (todas) | <15 (todas) | Tabla 1, orden 5 |
| Color | escala D1500 | ASTM D1500 | sin valor en servicio (nuevo ≤1,0; regenerado ≤1,5) | — | — | Tabla 1, orden 6 |
| Aspecto visual | — | ASTM D1524 | Claro y libre de sedimentos | — | — | Tabla 1, orden 7 |
| Contenido de gases | % | D831, D1827, D2945 | sin valor en servicio | — | — | Tabla 1, orden 8 |
| Sedimentos y lodos | — | Anexo A | sin valor en servicio | — | — | Tabla 1, orden 9 |
| Resistividad 90 °C | "Gm" | IEC 247 | — | impreso en Grupo II: >0,2 / >0,2 / >1 / >1 **(ambiguo)** | — | Tabla 1, orden 10 |
| Resistividad 20 °C | sin unidad | IEC 247 | — | impreso en Grupo II: >60 / >200 / >200 / >60 **(ambiguo)** | — | Tabla 1, orden 10 |
| Estabilidad a la oxidación | — | ASTM D2440, D2112 | "Según NTC 1465" (solo aceite nuevo) | — | — | Tabla 1, orden 11 |

### 1.4 Condiciones y notas que modifican la evaluación

| Regla | Referencia |
|---|---|
| Los valores de contenido de agua solo aplican si la acidez no sobrepasa 0,1 mg KOH/g | Tabla 2, nota 1 de "Contenido de agua" (p. 21) |
| Los límites de agua se refieren a aceite en servicio a más de 40 °C hasta 60 °C | 4.3 (p. 4) |
| Ensayos de laboratorio para decidir si el aceite continúa en servicio: color y aspecto, tensión de ruptura, factor de disipación **o** resistividad, índice de neutralización, contenido de agua | 8.2.2 (p. 11-12) |
| Salvo la tensión de ruptura, que una o varias propiedades estén fuera de límites no requiere acción inmediata | 8.3, Grupo 1 (p. 12) |
| Si la tensión de ruptura está bajo el límite, deben tomarse las medidas esenciales sin importar las demás características | 8.4 b) (p. 13) |
| Un resultado fuera de límites debe compararse con resultados anteriores y confirmarse con una nueva muestra antes de actuar | 8.4 a) (p. 13) |
| Con índice de neutralización > 0,3 mg KOH/g, efectuar los ensayos con más frecuencia | Tabla 2 (p. 22) |
| Propiedades físicas citadas de NTC 1465: punto de inflamación mín. 145 °C; punto de fluidez "min, °C -30"; gravedad específica 15/15 °C máx. 0,91; viscosidad 40 °C máx. 12,0 mm²/s | Nota bajo la Tabla 1 (p. 20) |

### 1.5 Lo que dice la norma y lo que decide la aplicación

**Viene de la norma:** todos los valores, unidades, métodos, categorías, la definición de los grupos 1 a 4,
la condición de acidez para el agua y las notas de 8.3/8.4.

**Decisiones de diseño (la aplicación las muestra en cada resultado):**

1. **Semáforo general = condición más severa** entre los parámetros evaluados. La norma no da una regla de combinación; la app añade las notas 8.3 y 8.4 para que el especialista lo matice.
2. **Verde solo si** aspecto, tensión de ruptura, factor de potencia a 25 °C, índice de neutralización y agua están en Grupo I, y ningún valor ingresado queda ambiguo o sin datos suficientes. Como la resistividad no puede evaluarse (ver ambigüedades), en la práctica el factor de potencia a 25 °C es obligatorio para obtener verde.
3. **Solapamiento entre grupos** (p. ej. NN > 0,5 cumple ">0,3" de Grupo II y ">0,5" de Grupo III): se asigna el grupo más severo.
4. **Extremos de rangos "a-b"**: la norma no dice si son inclusivos. Un valor en un extremo solo se clasifica si otro criterio con símbolo explícito lo incluye (p. ej. agua = 35 en cat. C cae en "≤35", Grupo I). Si no, queda **"Criterio ambiguo"** (p. ej. agua = 40 en cat. C).
5. Un valor que **no cumple Grupo I y no cae en otro criterio tabulado** queda como **"Fuera del límite de Grupo I (grupo no definido)"** y se muestra en ámbar. Nunca se muestra como normal.
6. Las **propiedades físicas** se muestran como informativas y no afectan el semáforo (4.10-4.12: sirven para identificar el aceite, y la nota no aclara si aplican en servicio).
7. **Validación física** que no viene de la norma: no se aceptan valores negativos (salvo temperaturas), porcentajes mayores de 100 ni gravedad específica o viscosidad iguales o menores que 0.

---

## 2. Estructura del proyecto

```
evaluador-aceite-ntc3284/
├── index.html             Formulario, semáforo y tabla de resultados
├── styles.css             Estilos (modo claro/oscuro, responsive)
├── package.json           Scripts: npm start / npm test (sin dependencias)
├── README.md              Este documento
├── src/
│   ├── criterios.js       Valores de la NTC 3284 con su referencia (única fuente de datos)
│   ├── evaluador.js       Validación y lógica de clasificación (sin interfaz)
│   └── app.js             Capa de interfaz del navegador
├── scripts/
│   └── servidor.js        Servidor estático mínimo (http://localhost:5173)
├── tests/
│   └── evaluador.test.js  35 pruebas con node:test
└── .vscode/
    ├── tasks.json         Tareas "Iniciar aplicación" y "Ejecutar pruebas"
    └── launch.json        Configuraciones de depuración
```

**Tecnología:** HTML, CSS y JavaScript sin frameworks ni dependencias. La norma no exige una tecnología.
Con esta opción la app abre con doble clic en cualquier navegador, el motor de reglas se prueba con Node.js
sin instalar nada (`node:test`), y los criterios quedan en un solo archivo fácil de auditar contra la norma.

---

## 3. Cómo abrir y ejecutar el proyecto en Visual Studio Code

Requisito: **Node.js 18 o superior** (solo para el servidor y las pruebas). Compruébelo con `node --version`.

1. Abra VS Code → **Archivo → Abrir carpeta…** → seleccione `evaluador-aceite-ntc3284`.
2. Abra la terminal integrada (**Terminal → Nueva terminal**).
3. Inicie la aplicación:
   ```bash
   npm start
   ```
   Abra `http://localhost:5173` en el navegador. También puede usar **Terminal → Ejecutar tarea… → Iniciar aplicación**.
   *Alternativa sin Node:* abra `index.html` directamente en el navegador (doble clic).
4. Ejecute las pruebas:
   ```bash
   npm test
   ```
   O use **Terminal → Ejecutar tarea de prueba**. Para depurar, use la vista **Ejecutar y depurar** → "Ejecutar pruebas (depurar)".
5. En la app: elija la categoría, el método de ruptura, ingrese los valores (coma o punto decimal) y pulse **Evaluar muestra**. El botón **Cargar ejemplo** rellena una muestra de prueba.

---

## 4. Casos de prueba y resultados esperados

Todos están automatizados en `tests/evaluador.test.js` (35 pruebas, 35 pasan). Muestra base: categoría C,
ASTM D877, ruptura 40 kV, agua 20 ppm, NN 0,05 mg KOH/g, factor de potencia 25 °C 0,5 %, aspecto claro.

| # | Entrada (sobre la base) | Resultado esperado |
|---|---|---|
| 1 | Base sin cambios | **Favorable** (verde) |
| 2 | Ruptura D877 = 26 / 25,9 (cat. C) | Grupo I (≥ inclusivo) / Grupo II → **Alerta** |
| 3 | Ruptura D877 = 30 / 29,9 (cat. O) | Grupo I / Grupo II |
| 4 | Ruptura D1816 0,04" = 23 / 22 (cat. C) | Grupo I / Fuera de Grupo I sin grupo (Grupo II ambiguo) → **Alerta** |
| 5 | Ruptura IEC 156 = 40 / 39,9 (cat. A) | Grupo I / Fuera de Grupo I |
| 6 | Agua = 35 (cat. C) | Grupo I (≤35 explícito) con nota de extremo de rango |
| 7 | Agua = 37 / 40 / 41 (cat. C) | Grupo II / **Ambiguo** / Fuera de Grupo I → **Alerta** |
| 8 | NN = 0,15 con agua 10 | Agua **no aplicable** (acidez > 0,1) → **No determinado** |
| 9 | NN = 0,1 con agua 10 | Agua sí aplica ("no sobrepase") → Grupo I |
| 10 | NN vacío | Agua: **Datos insuficientes** → **No determinado** |
| 11 | Temperatura de muestreo 25 °C / 50 °C | Nota del 4.3 / sin nota |
| 12 | NN = 0,3 / 0,31 / 0,5 / 0,51 (cat. C) | Grupo I / II / II / III (solapamiento → más severo) → **Crítica** |
| 13 | NN = 0,1 / 0,15 / 0,2 / 0,3 / 0,4 / 0,41 (cat. O) | I / II / Ambiguo / sin grupo / sin grupo / III |
| 14 | NN = 0,35 | Nota de mayor frecuencia (Tabla 2) |
| 15 | Tensión interfasial = 24 / 23,9 / 15 / 14,9 (cat. C) | I / II / II / III |
| 16 | Tensión interfasial = 25 (cat. A) | Sin grupo (entre <24 y ≥26) |
| 17 | Factor de potencia 25 °C = 1,0 / 1,01 | Grupo I / Fuera de Grupo I |
| 18 | Color 3,5 y FDD 100 °C = 2 | No cubiertos; el semáforo sigue **Favorable** con nota |
| 19 | Aspecto turbio | Fuera de Grupo I → **Alerta** |
| 20 | Resistividad 90 °C = 5 | **Ambiguo** → **No determinado** |
| 21 | Sin factor de potencia 25 °C | **No determinado** (falta ensayo del 8.2.2) |
| 22 | Ruptura 25 sin agua ni FDD | **Alerta** con nota "evaluación incompleta" |
| 23 | Categorías D, E, G | Parámetros no cubiertos → **No determinado** |
| 24 | Categoría F | Error: elegir la categoría del transformador asociado |
| 25 | Sin categoría / sin método de ruptura | Error de validación |
| 26 | "veinte", "-0,1", "150 %" en FDD | Errores: no numérico, negativo, > 100 % |
| 27 | "30 kV", "35ppm" | Error: escribir solo el número |
| 28 | "1.000,5", "1e3", "NaN" | Error: número no válido |
| 29 | Formulario sin valores | Error: ingresar al menos un valor |
| 30 | Punto de fluidez -40 | Aceptado (negativo permitido); estado **Ambiguo**, informativo |
| 31 | Punto de inflamación 145 / 144; viscosidad 12 / 12,1 | Cumple / No cumple (informativo); semáforo sin cambio |

---

## 5. Supuestos, ambigüedades y limitaciones

### Ambigüedades de la norma (requieren aclaración)

1. **Tensión de ruptura, Grupo II para ASTM D1816 e IEC 156:** la columna imprime "≥" con el mismo valor que Grupo I, mientras que para ASTM D877 imprime "<". Parece una errata, pero no se asume: un valor bajo el límite queda "fuera de Grupo I, sin grupo" (ámbar).
2. **Resistividad:** la unidad aparece como "Gm" (probablemente GΩ·m), los valores están en la columna "Grupo II por reacondicionar" sin valores para Grupo I ni III, y algunos dígitos quedan tapados por la marca de agua del documento. No se clasifica.
3. **Tensión interfasial:** la Tabla 1 no indica unidad.
4. **Rangos "a-b"** (agua en Grupo II; NN cat. O en Grupo II): no se indica si los extremos son inclusivos.
5. **Huecos en la tabla:** NN cat. O entre 0,2 y 0,4; tensión interfasial cat. A entre 24 y 26, y cat. O entre 24 y 30; agua por encima del rango de Grupo II. Ningún grupo los cubre.
6. **Solapamientos:** NN > 0,5 (C, B, A) cumple Grupo II y III; tensión interfasial < 15 cumple Grupo II y III.
7. **Referencias cruzadas:** 4.3, 4.7, 8.3 y 8.4 b) remiten a "la Tabla 2" para valores límite que están en la Tabla 1 (la Tabla 2 trata frecuencias de ensayo). Se interpretó que se refieren a la Tabla 1.
8. **Nota 1 de la Tabla 2 ("los valores citados no se aplican sino cuando la acidez no sobrepase 0,1 mg KOH/g"):** se interpretó que se refiere a los límites de agua. Si solo se refiere a la frecuencia de ensayo, la evaluación de agua sería menos restrictiva.
9. **Punto de fluidez "min, °C -30":** un mínimo no es coherente con el ensayo; podría ser un máximo.
10. **Factor de potencia a 100 °C en servicio:** las celdas están bajo la marca de agua y no muestran valor.
11. **Límites de tensión:** la Sección 6 dice "hasta 72,5 kV" (inclusivo) y la Tabla 1 "<72,5 kV" (exclusivo). Por eso la app pide la **categoría** y no la tensión.
12. **8.3 vs. factor de disipación:** el 8.3 asocia valores altos de FDD con el Grupo 3, pero la Tabla 1 no da límites de Grupo II ni de Grupo III para el FDD.

### Limitaciones

- Solo evalúa **aceite en servicio**. No evalúa aceite nuevo, regenerado ni el análisis de gases disueltos (fuera del alcance de la guía, Sección 2, nota).
- No asigna el **Grupo 4** ni evalúa tendencias entre muestras (8.1 y 8.4 c) piden seguir la evolución).
- No interpreta la Figura 1 (saturación de agua en función de la temperatura).
- No cubre las categorías D, E y G ni transformadores ≤ 1 MVA y 36 kV (en estos, si se exige control, se sugiere seguir la categoría C).
- La lectura de la Tabla 1 se hizo desde una copia escaneada con marca de agua. Antes de usar la app en producción, conviene contrastar `src/criterios.js` con un ejemplar limpio de la norma.
