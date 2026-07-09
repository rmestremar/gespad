# Padrón INE — errores y variaciones

Aplicación web de un único fichero HTML (sin instalación, sin dependencias, sin conexión a
internet) para trabajar con los ficheros de intercambio INE-Ayuntamientos de la **Relación de
Habitantes**. Tiene dos pestañas independientes:

### 📥 Fichero de errores/incidencias (recibido del INE)

Para los ficheros de devolución mensual del INE (`H*.A??`, 704 caracteres por registro: 554 de
datos + 150 de cola de errores). Permite:

1. Cargar varios ficheros de errores/incidencias del INE a la vez (arrastrar y soltar, o
   selector de ficheros).
2. Filtrar los registros por municipio, tipo de información (`TIPOINF`), código de variación
   (`CVAR`), causa de variación (`CAUV`), causa de devolución (`CDEV`), texto libre (nombre,
   apellidos, NIA, documento) y, sobre todo, por **tipo de error/incidencia concreto** de la
   cola de errores (150 posiciones), con su descripción oficial y la actuación recomendada
   para el Ayuntamiento.
3. Seleccionar manualmente (o por lote, tras filtrar) los registros que interesa tratar.
4. Generar y descargar un fichero de salida con la **misma estructura** que el original
   (704 caracteres por línea), conteniendo únicamente las líneas seleccionadas, listo para
   cargar en el programa de gestión de Padrón.

### 📤 Fichero de variaciones (a enviar al INE)

Para el fichero de variaciones que el Ayuntamiento envía al INE (mismo diseño de registro,
pero sin cola de errores: 554 caracteres por registro). Permite:

1. Cargar uno o varios ficheros de variaciones.
2. Ver de un vistazo cuántas Altas, Bajas y Modificaciones hay, desglosadas por causa de
   variación (`CAUV`: alta por nacimiento, baja por defunción, cambio de domicilio&hellip;),
   con contadores clicables que aplican el filtro correspondiente al instante.
3. Filtrar por municipio, `CVAR`, `CAUV` o texto libre, y seleccionar manualmente o por lote
   los registros que interesa tratar.
4. Generar y descargar un fichero de salida con la misma estructura (554 caracteres por línea)
   conteniendo solo los registros seleccionados.

Ambas pestañas comparten el motor de lectura/escritura del fichero, así que si cargas por
error un fichero con cola en la pestaña de variaciones simplemente se ignora esa cola (no
pasa nada), y si cargas un fichero sin cola en la de errores se trata como si no tuviera
ninguna incidencia marcada.

### 📊 Exportar a Excel

Además del fichero de salida en formato INE (para recargar en el programa de padrón), cada
pestaña tiene un botón **"Exportar a Excel"** que genera un `.xls` legible con columnas,
cabecera en negrita y ajustado para imprimir en horizontal — pensado para revisar en pantalla
o imprimir en papel, no para recargarlo en el INE. Exporta la selección actual si has marcado
registros, o todos los que estén filtrados si no has marcado ninguno. Al abrirlo, Excel puede
mostrar un aviso de que el contenido no coincide exactamente con la extensión del archivo; es
normal (es el formato "XML Spreadsheet 2003", que Excel sigue soportando de forma nativa) y
basta con aceptar para abrirlo con normalidad.

## Cómo usarlo

Abre `index.html` con doble clic (se abre en tu navegador habitual). No requiere instalar
nada ni tener conexión a internet: todo el procesamiento ocurre en tu propio equipo y ningún
dato se envía a ningún servidor.

## Diseño de registro

Basado en:

- *Diseños de registro de los ficheros de intercambio de información INE-Ayuntamientos*
  (marzo 2015) — estructura de 554 posiciones del fichero de Relación de Habitantes.
- *Normas para el tratamiento de las incidencias resultantes de la incorporación de las
  variaciones mensuales a los ficheros padronales del INE* (noviembre 2020) — significado de
  cada una de las 150 posiciones de la cola de errores.
- `TablaErroresIncidencias202607.txt` — catálogo oficial (código, TIPOINF, CDEV, descripción
  y actuación) descargado de IDA-Padrón, incrustado en la aplicación (julio 2026). Si el INE
  publica una tabla más reciente con cambios en las descripciones, basta con regenerar el
  bloque `ERROR_CATALOG` al principio del `<script>` de `index.html` a partir del nuevo
  fichero (mismo formato de registro de 258 caracteres, ver PDF *Formato de registro de la
  tabla Errores/Incidencias*).

## Limitaciones conocidas

- Solo entiende el fichero de **Relación de Habitantes** (tipo `H`). Los ficheros de Unidades
  Poblacionales, Vías, Pseudovías, Tipos de Vía, Tramos o Renumeración de Vías tienen un
  diseño de registro distinto y no se cargan con esta herramienta.
- No valida ni corrige los datos del registro: solo permite filtrar, seleccionar y volcar tal
  cual las líneas del original. La corrección de los errores se sigue haciendo en el programa
  de gestión de Padrón del Ayuntamiento.
- Los códigos 146 y 149 de la cola de errores no se marcan con `X` sino con letras/dígitos
  (`S`/`N`, o un código de causa de devolución de carta); la aplicación los detecta igual como
  "incidencia presente" pero no interpreta ese carácter adicional más allá de mostrarlo.
- Ficheros muy grandes (varias decenas de miles de registros) pueden ir algo lentos al
  filtrar, ya que todo se procesa en el navegador; la tabla se pagina para mantenerla usable.
