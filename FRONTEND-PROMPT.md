# PLANILLA VIVA — Prompts de frontend (versión sobria)

> Objetivo de esta versión: que el resultado parezca hecho por un desarrollador semi-senior, no por una IA
> con ganas de impresionar. Menos design system inventado, menos controles decorativos, más código aburrido
> y predecible.
>
> Uso: pegá el **Prompt 0** una vez. Después, una pantalla por vez (Prompts 1 a 5).

---

## Qué cambia respecto de la versión anterior

| Antes (vibecode) | Ahora (semi-senior) |
|---|---|
| Design system con 12 hex y medidas al pixel | Tokens de shadcn/ui sin tocar + un solo color de acento |
| "Selector de densidad que no hace nada" | No existe: no se muestra lo que no funciona |
| TanStack Table para 32 filas | `<table>` semántica y `useState` para filtros |
| date-fns para 3 formatos | `Intl.DateTimeFormat('es-AR')` |
| Badges de colores en cada celda | Texto + punto de color; color solo donde aporta |
| Todo en un archivo | Un componente por archivo, con una responsabilidad |
| Animaciones y sombras | Nada que no sea `shadow-sm` y una transición de 150ms en hover |
| Lógica y datos dentro del JSX | Datos en `/lib/mock`, derivaciones en el render o en helpers puros |

---

## PROMPT 0 — Contexto, setup y convenciones

```markdown
Sos un desarrollador frontend semi-senior. Vas a construir el frontend de un sistema de gestión académica
interno. Escribí código que parezca de un equipo real: simple, tipado y predecible.

## PRODUCTO
"Planilla Viva": back-office para un profesorado de Educación Física privado en Merlo, Argentina.
Reemplaza planillas de Excel para gestionar asistencia, notas y condición de los alumnos.
Lo usan secretaría, dirección y docentes. NO es un campus virtual. NO es una app para alumnos.
NO genera documentos ni PDFs.

## STACK (no agregar nada más)
- Next.js 15, App Router, TypeScript estricto
- Tailwind CSS + shadcn/ui (tema neutral, sin personalizar más que el color primario)
- lucide-react (ya viene con shadcn)
- Sin backend: datos mock tipados en /lib/mock/data.ts. Sin fetch, sin base de datos, sin auth real.

## ESTRUCTURA DE ARCHIVOS
```
app/
  layout.tsx
  page.tsx                          # Tablero
  comisiones/page.tsx
  comisiones/[id]/planilla/page.tsx
  comisiones/[id]/asistencia/page.tsx
  comisiones/[id]/notas/page.tsx
  alumnos/page.tsx
  alumnos/[id]/page.tsx
components/
  layout/app-shell.tsx              # sidebar + header
  layout/page-header.tsx
  ui/                               # shadcn
  estado-badge.tsx
  empty-state.tsx
  planilla/tabla-planilla.tsx
  planilla/celda-asistencia.tsx
  asistencia/lista-alumnos.tsx
lib/
  types.ts
  mock/data.ts
  format.ts                         # fechas, porcentajes
```
Reglas: componentes de máximo ~120 líneas. Nada de archivos "utils" gigantes. Nada de carpetas
`features/`, `modules/` ni barrels (`index.ts`) que reexporten todo.

## CONVENCIONES DE CÓDIGO
- Server Components por defecto. `"use client"` solo en el componente que necesita estado o evento,
  y lo más abajo posible en el árbol.
- Tipos en `lib/types.ts`. Nunca `any`. Nunca duplicar tipos entre archivos.
- Datos mock solo en `lib/mock/data.ts`. Nunca dentro de un componente.
- Nombres de componentes en PascalCase y en español (`TablaPlanilla`, `EstadoBadge`).
  Variables y funciones en inglés (`const rows`, `formatDate`). Consistencia, no mezcla al azar.
- Tailwind: usar la escala estándar (`p-6`, `gap-4`, `text-sm`, `h-10`, `size-7`).
  **Prohibido** usar valores arbitrarios tipo `w-[23px]` o `text-[13.5px]`.
- Nada de estilos inline. Nada de `!important`.
- No derivar estado con `useEffect`: calcular en el render o con un helper puro.
- No poner lógica de negocio en el JSX. Si hay un cálculo, va en una función con nombre.
- Un componente, una responsabilidad. Si un archivo pasa de 150 líneas, dividilo.
- Comentarios solo donde el código no se explica solo. Nada de comentarios obvios.
- Accesibilidad básica: `<table>` con `<thead>`/`<tbody>`, `aria-label` en los checkboxes,
  foco visible, contraste AA. Nada de `div` clickeable sin `role` y `tabIndex`.

## DISEÑO
Herramienta interna, no landing page.
- shadcn/ui con el tema **neutral**, tal como viene. Cambiar solo `--primary` a `#1E3A5F`.
- Fondo `bg-muted/30`, superficies `bg-background`, bordes `border-border`.
- Tipografía del sistema o Inter. Base 14px (`text-sm`). Títulos de página 20px (`text-xl`).
- Sin gradientes, sin glassmorphism, sin animaciones de entrada, sin emojis, sin ilustraciones,
  sin imágenes, sin avatares con foto, sin modo oscuro.
- Colores de estado, usados con moderación:
  regular `text-emerald-700`, en riesgo `text-amber-700`, libre `text-red-700`,
  aprobada `text-blue-700`, cursando `text-muted-foreground`.
- Los estados se muestran como un punto de 6px + texto, no como una pastilla de fondo saturado.

## DATOS MOCK (/lib/mock/data.ts)
Datos realistas, no lorem ipsum.

```ts
export type EstadoCursada = 'cursando' | 'regular' | 'libre' | 'aprobada' | 'recursa';
export type MarcaAsistencia = 'P' | 'A' | 'J' | 'T';

export interface Alumno { id: string; nombre: string; apellido: string; dni: string; legajo: string; }

export interface Clase {
  id: string;
  fecha: string;               // ISO
  horas: number;               // 1 a 4
  tipo: 'normal' | 'cancelada' | 'feriado';
}

export interface FilaPlanilla {
  cursadaId: string;
  alumno: Alumno;
  asistencias: Record<string, MarcaAsistencia | null>;
  horasAsistidas: number;
  horasDictadas: number;
  porcentaje: number | null;   // ya calculado
  estado: EstadoCursada;
}

export interface Comision {
  id: string;
  unidadCurricular: string;
  anio: number;
  division: string;
  ciclo: number;
  docentes: string[];
  inscriptos: number;
  asistenciaPromedio: number;  // ya calculado
  enRiesgo: number;
}
```

Dataset:
- Carrera "Profesorado de Educación Física", ciclo 2026.
- "Didáctica de la Educación Física I", 1° Año, Div. A, Laura Giménez, 32 alumnos.
- "Biomecánica", 2° Año, Div. Única, Martín Rossi y Ana Duarte, 24 alumnos.
- "Natación y su Enseñanza", 3° Año, Div. A, Sofía Peralta, 18 alumnos.
- 14 clases por comisión, 10/03/2026 a 25/06/2026, de 2 horas. Dos feriados, una cancelada.
- Apellidos: González, Rodríguez, Fernández, López, Martínez, Pérez, Gómez, Sánchez, Romero, Sosa,
  Torres, Álvarez, Benítez, Acosta, Giménez, Molina, Ortiz, Silva, Rojas, Medina, Herrera, Aguirre,
  Cabrera, Núñez, Luna, Paredes, Vera, Quiroga, Ríos, Cáceres.
- DNI de 8 dígitos, legajo "2026-014".
- Estados: mayoría regulares, 3-4 en riesgo, 2 libres, 1 aprobada, 1 cursando.
- Evaluaciones: "Parcial 1" (15/05/2026), "TP 1" (05/06/2026), "Recuperatorio" (26/06/2026), escala 1-10.

## REGLA DE ORO
El frontend no calcula porcentajes ni condiciones: los recibe calculados. En el mock vienen
precalculados y coherentes (`horasAsistidas / horasDictadas`). No inventes fórmulas en el cliente.

## ANTI-PATRONES PROHIBIDOS
- Botones, selects o tabs que no hacen nada ("solo visual").
- `useEffect` para sincronizar estado derivado.
- Un componente de 400 líneas.
- `any`, `as unknown as`, `@ts-ignore`.
- Dependencias nuevas sin justificar.
- Datos hardcodeados dentro de un componente.
- `div` con `onClick` en lugar de `button`.
- Textos de marketing ("Potenciá tu gestión").

## ENTREGABLE DE ESTA ETAPA
1. Estructura de archivos de arriba, con el layout y las rutas creadas (cada una con su título).
2. `lib/types.ts` y `lib/mock/data.ts` completos y tipados.
3. `lib/format.ts` con `formatFecha`, `formatPorcentaje`, `formatHoras`.
4. `npm run build` y `npx tsc --noEmit` sin errores.

Antes de escribir código, mostrame el árbol de archivos y esperá mi OK.
```

---

## PROMPT 1 — Planilla de cursada

```markdown
Implementá `/comisiones/[id]/planilla`.

## Encabezado (PageHeader)
- Título: "Didáctica de la Educación Física I"
- Descripción: "1° Año · División A · Ciclo 2026 · Prof. Laura Giménez · 32 inscriptos"
- Acciones: `Button variant="outline"` "Exportar CSV" (funcional, ver abajo) y
  `Button` "Tomar asistencia" con link a `/comisiones/[id]/asistencia`.

## Resumen
Una fila con tres datos separados por `Separator` vertical, sin tarjetas:
"Asistencia promedio 78,4%", "En riesgo 3", "Libres 2".

## Tabla
`<table>` semántica. Sin librería de tablas.

Columnas:
1. **Alumno** — `sticky left-0 bg-background`, ancho fijo ~240px.
   Apellido y nombre en `text-sm font-medium`; DNI en `text-xs text-muted-foreground`.
2. **Una columna por clase** — header con la fecha `dd/MM` en `text-xs` y las horas en
   `text-[10px]`… no: usá `text-xs text-muted-foreground`. Celda de 32px (`size-8`), centrada.
   Si la clase es `feriado` o `cancelada`: header con `line-through text-muted-foreground`
   y celdas con un guion.
3. **Horas** — `38/48` en `text-xs tabular-nums`.
4. **%** — un decimal, `tabular-nums`, color según el valor.
5. **Estado** — `<EstadoBadge estado={...} />`.

Celdas de asistencia (`CeldaAsistencia`):
- P: `text-emerald-700`, A: `text-red-700`, J: `text-amber-700`, T: `text-blue-700`.
- Fondo transparente, letra de 11px semibold. Sin círculos ni pastillas.
- Valor `null` o clase no computable: guion en `text-muted-foreground/40`.

Detalles:
- `thead` sticky (`sticky top-0 bg-background z-10`).
- Hover de fila: `hover:bg-muted/40`.
- Sin zebra, sin bordes verticales; solo `border-b` entre filas.
- Footer (`tfoot`): por cada clase, `28/32` en `text-xs text-muted-foreground`.
- Contenedor con `overflow-x-auto`; la primera columna queda fija.

## Exportar CSV (tiene que funcionar)
Generá el CSV en el cliente con un `Blob` y `URL.createObjectURL`. Columnas: Alumno, DNI,
una por clase (fecha), Horas, Porcentaje, Estado. Nombre del archivo:
`planilla-didactica-1a-2026.csv`. Sin librerías.

## Interacción
- Click en el nombre del alumno → `/alumnos/[id]`.
- Las celdas no son editables en esta etapa: no agregues popovers ni menús.

## Responsive
- Desktop y tablet: tabla con scroll horizontal.
- Mobile (`< md`): lista de alumnos con nombre, `%` y estado. Nada de columnas de clases.

## Fuera de alcance
Edición inline, paginación, ordenamiento, selección múltiple.
```

---

## PROMPT 2 — Tomar asistencia (docente, mobile)

```markdown
Implementá `/comisiones/[id]/asistencia`. Pantalla de celular, uso con una mano.

## Layout
`max-w-md mx-auto`, pantalla completa, sin sidebar.

1. Header: botón atrás (`Button variant="ghost" size="icon"`), título "Tomar asistencia",
   subtítulo "Didáctica de la Educación Física I · 1° A".
2. Contexto: `Input type="date"` (default hoy) y un `ToggleGroup` de tres opciones:
   Normal / Cancelada / Feriado.
3. Horas: `− 2 +` con dos `Button variant="outline" size="icon"` y el número en el medio.
4. Resumen: "28 de 32 presentes" en `text-lg font-semibold`.
5. Acciones rápidas: dos `Button variant="ghost" size="sm"`: "Todos presentes", "Todos ausentes".
6. Lista: `ListaAlumnos`, filas de 56px separadas por `border-b`.
   - Nombre completo a la izquierda, DNI debajo en `text-xs text-muted-foreground`.
   - `Checkbox` a la derecha, `aria-label` con el nombre.
   - Toda la fila es un `<label>`: tocar en cualquier lado togglea.
   - Presente: `bg-emerald-50/60`.
7. Barra inferior fija: "28 de 32 · 2 h" y `Button` "Guardar asistencia" a ancho completo.

## Comportamiento
- Estado local con `useState<Record<string, boolean>>` inicializado desde el mock.
- Si el tipo es Cancelada o Feriado: la lista se deshabilita (`disabled` + `opacity-50`),
  aparece un `Alert` con "Esta clase no computa para la asistencia" y el botón dice
  "Guardar como cancelada".
- Guardar: `toast("Asistencia guardada")` y `router.push` a la planilla. No hay persistencia real.
- El botón "Guardar" se deshabilita si no hubo cambios.

## Detalles
- Sin modales de confirmación.
- `pb-[env(safe-area-inset-bottom)]` en la barra inferior.
- Nada de gestos ni swipe.
```

---

## PROMPT 3 — Tablero

```markdown
Implementá `/` (Tablero).

## Encabezado
Título "Tablero", descripción "Ciclo 2026 · 3 comisiones · 74 alumnos".
Acción: `Select` de ciclo (2026 / 2025). Si no hay datos de 2025, mostralo `disabled`
con el texto "2025 (sin datos)". No inventes un filtro que no filtra.

## Resumen
Cuatro bloques en una sola caja con `divide-x`, no cuatro cards:
- Alumnos activos · 74 · "en 3 comisiones"
- Asistencia promedio · 78,4% · "3,2 pts menos que 2025"
- En riesgo · 7 · "por asistencia"
- Notas pendientes · 2 · "docentes con carga atrasada"

Cada bloque: label `text-xs uppercase text-muted-foreground`, número `text-2xl font-semibold`,
contexto `text-xs text-muted-foreground`. El número de "En riesgo" en `text-amber-700`.

## Tabla "Estado por comisión"
Comisión (nombre + "1° Año · Div. A" debajo) · Docente · Inscriptos · Asistencia ·
Regulares · Libres · En riesgo · Estado.
- Asistencia: número + una barra fina de 64px (`h-1.5 rounded-full`), verde/ámbar/rojo.
- Estado: `EstadoBadge` con "Al día" o "Requiere atención".
- Fila clickeable (con `Link` en la celda del nombre, no en el `tr`).

## Tabla "Docentes con notas pendientes"
Docente · Comisión · Evaluación · Fecha límite · Días de atraso.
- Días de atraso en `text-red-700` si es mayor a 7.
- Si la lista está vacía: `<EmptyState titulo="No hay notas pendientes" />`.

## Fuera de alcance
Gráficos, tendencias, exportaciones.
```

---

## PROMPT 4 — Cargar notas

```markdown
Implementá `/comisiones/[id]/notas`.

## Encabezado
Título "Notas", descripción "Didáctica de la Educación Física I · 1° Año · Div. A".
Acción: `Button` "Guardar cambios", deshabilitado si no hay cambios.

## Tabs
`Tabs` con las evaluaciones del mock: "Parcial 1 · 15/05", "TP 1 · 05/06", "Recuperatorio · 26/06".

## Grilla
`<table>` con los 32 alumnos:
- Alumno (nombre + DNI) · Nota de la evaluación activa · Promedio · Asistencia · Condición.
- La nota es un `Input` numérico de 64px, centrado, `min=1 max=10 step=0.1`.
- Vacío permitido. Valor inválido: `aria-invalid` y borde `border-red-500`.
- Promedio y condición vienen del mock; no los calcules.
- Al pie: "28 de 32 notas cargadas".

## Panel derecho
`aside` de 280px, sticky, con `Separator` y un resumen: promedio del curso, nota máxima,
mínima, aplazos. Debajo, en `text-xs text-muted-foreground`: "Aprobación 4 · Promoción 7 · Escala 1-10".

## Comportamiento
- Estado local de notas con `useState`. "Guardar cambios" muestra un toast y limpia el estado sucio.
- Sin validación del lado del servidor (no hay servidor).

## Fuera de alcance
Exportar, importar, historial de cambios, cálculo de promedio en el cliente.
```

---

## PROMPT 5 — Comisiones y Alumnos

```markdown
Implementá `/comisiones`, `/alumnos` y `/alumnos/[id]`.

## /comisiones
- Título "Comisiones", descripción "Ciclo 2026".
- Filtros: `Input` de búsqueda (materia o docente) + `Select` de año (Todos, 1° a 4°).
  Filtrado real con `useState` sobre el mock.
- Tabla: Comisión · Año/División · Docentes · Inscriptos · Asistencia · En riesgo · Estado.
- El nombre es un `Link` a `/comisiones/[id]/planilla`.
- Sin resultados: `<EmptyState titulo="No hay comisiones" descripcion="Probá con otro filtro." />`.

## /alumnos
- Título "Alumnos", descripción "74 activos".
- Buscador por nombre, apellido o DNI (real).
- Tabla: Alumno · DNI · Legajo · Año · Comisiones · Estado general.
- Estado general: "Regular" si todas sus cursadas son regulares o aprobadas, "En riesgo" si tiene
  alguna en riesgo, "Libre" si tiene alguna libre. Calculalo en una función pura en `lib/`.
- Link a `/alumnos/[id]`.

## /alumnos/[id]
- Encabezado: iniciales en un `Avatar` de shadcn (sin imagen), nombre completo, DNI y legajo
  en `text-sm text-muted-foreground`, `EstadoBadge` a la derecha.
- Tres datos: "Asistencia global", "Materias aprobadas", "Materias adeudadas".
- Tabla "Situación por unidad curricular": Unidad curricular · Año · Docente · Asistencia · Nota · Condición.
- `Button variant="outline"` "Volver a alumnos" con `ArrowLeft`.

## Fuera de alcance
Edición, eliminación, alta de alumnos, subida de archivos, cualquier acción que modifique datos.
```

---

## Definition of Done (aplicar a cada pantalla)

- [ ] `npx tsc --noEmit` sin errores y sin `any`.
- [ ] `npm run lint` limpio.
- [ ] Ningún componente supera las 150 líneas.
- [ ] No hay botones, tabs ni selects que no hagan nada.
- [ ] Las rutas cargan sin errores y sin warnings de hidratación en consola.
- [ ] La tabla se ve bien en 1280px y en 390px.
- [ ] Los estados vacíos existen (no queda una tabla en blanco).
- [ ] Se usan componentes de shadcn, no `div` estilizados a mano para botones o inputs.
- [ ] No se agregó ninguna dependencia.

---

## Cómo revisar lo que generó la IA (5 minutos)

1. **Abrí dos archivos al azar.** Si tienen más de 150 líneas o mezclan datos con JSX, pedí que los divida.
2. **Buscá `any`, `useEffect` y `w-[`.** Si aparecen, pedí que los saque.
3. **Contá los botones.** Tocá cada uno. Si alguno no hace nada, que lo elimine o lo implemente.
4. **Mirá la consola del navegador.** Warnings de hidratación o de `key` significan que hay que revisar.
5. **Achicá la ventana a 390px.** Si la planilla se rompe, pedí la versión de lista para mobile.
