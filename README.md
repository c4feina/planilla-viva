# Planilla Viva

Demo frontend del registro académico interno para el Profesorado de Educación Física del **Instituto Privado de Merlo**.

> **Demo:** datos ficticios, sin backend ni autenticación. Los cambios se guardan en el navegador y se pueden reiniciar desde el aviso de demo.

## Qué incluye

- Tablero con métricas, alertas y estado por materia.
- Materias con planilla de cursada, asistencia y notas.
- Corrección de asistencia con historial por alumno.
- Carga de notas por evaluación con recálculo automático de la condición.
- Ficha de alumno con situación académica, documentos PDF e historial.
- Configuración de reglas académicas y calendario del ciclo.
- Calendario de evaluaciones por materia.
- Plantilla de Excel de ejemplo descargable.
- Modo claro y oscuro, escritorio y celular.

## Requisitos

- Node.js 20.9 o superior (probado con Node 24)
- npm

## Abrir en VS Code

1. Abrí esta carpeta en VS Code:

   `C:\Users\Miriam\Desktop\Agustin\PROGRAMACION\PLANILLA-VIVA`

2. Abrí una terminal: **Terminal → New Terminal**.
3. Instalá dependencias (solo la primera vez):

   ```powershell
   npm install
   ```

4. Iniciá el servidor:

   ```powershell
   npm run dev
   ```

5. Abrí **http://localhost:3000**.

También podés usar la tarea de VS Code: **Terminal → Run Build Task** (`Ctrl + Shift + B`) y elegir **Planilla Viva: iniciar**.

Para frenar el servidor: `Ctrl + C`.

## Verlo en el celular

Con el celular en la misma red WiFi:

```powershell
npm run dev -- --hostname 0.0.0.0
```

Buscá la IP local con `ipconfig` y abrí `http://TU_IP:3000`. Aceptá el permiso de firewall de Windows si aparece.

## Configuración

La pantalla **Configuración** permite ajustar:

- Porcentaje mínimo de asistencia.
- Nota de aprobación y nota de promoción.
- Si las justificaciones computan.
- Cuánto suma una tardanza.
- Año, inicio y fin del ciclo lectivo.

Al guardar, se recalculan las condiciones de todas las cursadas. Los valores iniciales son de ejemplo: el instituto tiene que confirmarlos.

La **cuota** es un dato administrativo (marzo a diciembre) y no condiciona la regularidad académica.

## Excel de ejemplo

En **Excel** podés descargar `planilla-viva-ejemplo.xlsx` con las hojas:

- Alumnos
- Materias
- Inscripciones
- Asistencias
- Notas
- Parámetros
- Calendario

La plantilla sirve como referencia de columnas. La importación automática queda para la etapa con backend.

Para regenerar el archivo:

```powershell
npm run generate:template
```

## Build de producción

```powershell
npm run build
npm start
```

## Verificaciones

```powershell
npm run typecheck
npm run lint
npm run build
npx tsx scripts/validate-data.ts
```

## Datos de demo

- 89 alumnos, 47 materias, 1086 cursadas y 658 clases.
- Docentes y alumnos ficticios.
- Sin datos personales reales.
- Las notas, asistencias, cambios de clase y cambios de configuración viven en `localStorage`.
- Los PDFs cargados se mantienen solo hasta recargar la página.

## Limitaciones conocidas

- No hay backend, base de datos ni autenticación.
- La condición se calcula en el navegador.
- No hay importación real de Excel, finales ni mesas de examen.
- No se generan PDFs institucionales.
- El estado se guarda por navegador: no se comparte entre dispositivos.

## Deploy

Pensado para Vercel. El proyecto es un Next.js estándar:

```powershell
npm run build
```

En Vercel, importar el repositorio y usar la configuración por defecto. No requiere variables de entorno.
