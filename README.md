# Planilla Viva

Prototipo frontend del registro académico interno para el Profesorado de Educación Física del Instituto Privado de Merlo.

> **Demo:** datos ficticios, sin backend ni autenticación. Los cambios viven en memoria y se reinician al recargar la página.

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

## Alcance del prototipo

- Tablero, materias, planilla, toma de asistencia, notas, alumnos, ficha y documentos PDF.
- Una sola oferta por materia y año; la UI dice “Materias”.
- La asistencia se mide en horas y la condición se calcula automáticamente.
- Las correcciones de asistencia quedan en el historial de la ficha.
- Los documentos PDF se guardan en memoria durante la sesión.

## Limitaciones conocidas

- Sin backend, base de datos, login ni permisos reales.
- Los cambios se pierden al recargar.
- “Guardar notas” todavía no persiste ni recalcula la condición: es la próxima corrección pendiente.
- En mobile, “Tomar asistencia” edita la última clase normal; la planilla permite corregir clases anteriores desde desktop.
- No cargar datos reales de alumnos.

## Deploy en Vercel

El proyecto se puede desplegar como demo en Vercel sin variables de entorno:

1. Subir el repo a GitHub.
2. Importarlo en https://vercel.com/new.
3. Framework: **Next.js**. Root Directory: `./` si el repo es esta carpeta.
4. Deploy.

Para uso real hace falta primero el backend Django + PostgreSQL + autenticación.
