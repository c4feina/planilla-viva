# CONTEXTO DEL PROYECTO — PLANILLA VIVA

> **Cómo usar este archivo:** pegalo completo como contexto inicial (en v0, Claude o Claude Code).
> Después pedí **una pantalla por vez**. Si algo no está acá, no es parte del producto.
>
> **Etapa actual: SOLO FRONTEND, con datos mock.** El backend se construye después.
> En esta etapa no hay fetch, ni base de datos, ni login real.

---

## 1. ROL

Actuá como **desarrollador frontend semi-senior**. Escribí código que parezca de un equipo real:
simple, tipado, predecible y sin decoración innecesaria. Priorizá que se entienda y se mantenga
por encima de que impresione.

---

## 2. EL PRODUCTO

**Planilla Viva** es un sistema de gestión académica **interno** para un profesorado de Educación Física
**privado** en Merlo, Buenos Aires, Argentina. Hoy gestionan asistencias, notas y el estado de los alumnos
con planillas de Excel sueltas, con versiones duplicadas, sin permisos y sin registro de quién cambió qué.

La propuesta, en una frase para el cliente:

> **"Tu planilla, pero viva: una sola, compartida, y que calcula sola."**

### Qué es
- Un **back-office**: la trastienda administrativa del instituto.
- Una fuente única de verdad, con permisos por rol y auditoría de cada cambio.
- Una herramienta para secretaría, dirección y docentes.

### Qué NO es (no lo propongas nunca)
- No es un campus virtual. No hay aulas virtuales, foros, entrega de TP ni videollamadas.
- No es una app para alumnos. **El alumno no inicia sesión.**
- No genera documentos: ni certificados, ni constancias, ni actas, ni PDFs.
- No tiene legajo digital, subida de archivos, apto físico ni datos de salud.
- No tiene pagos, aranceles ni contabilidad.
- No tiene reserva de espacios (el instituto no tiene gimnasio ni natatorio propios).
- No tiene offline con sincronización.
- No es un ERP.

### Filtro de alcance
> **"¿Esto cambia el estado de un alumno o la carga de un docente? Si no, no entra."**

---

## 3. USUARIOS

| Rol | Superficie | Qué hace |
|---|---|---|
| **Secretaría / preceptoría** | Desktop, tablas densas | Inscribe, corrige, consulta, exporta. Usuario principal. |
| **Docente** | Celular | Toma asistencia y carga notas **solo de sus comisiones**. |
| **Dirección / dueño** | Desktop, ocasional | Mira el tablero. Solo lectura. |
| **Administración** | Desktop | Marca `habilitado` del alumno. Sin acceso académico. |
| **Alumno** | — | **No entra.** |

El docente no ve comisiones ajenas ni el tablero general. Dirección ve todo pero no edita.

---

## 4. ALCANCE DE LA V1 — cinco piezas

1. **Personas** — alumnos y docentes.
2. **Estructura** — carrera, plan, unidades curriculares, ciclos lectivos, comisiones y docentes asignados.
3. **Inscripción a cursada** — qué alumno cursa qué comisión.
4. **Asistencia** — carga por clase, medida en **horas**, con consolidado automático.
5. **Notas y condición** — evaluaciones y notas; el sistema calcula el estado del alumno.

Todo lo demás son **vistas de lectura** sobre esas cinco piezas.

### Flujo

```
Ciclo → comisiones → inscripción → asistencia + notas
  → el sistema calcula la CONDICIÓN
    → secretaría ve el estado de todos
      → dirección ve el tablero
```

### Vocabulario central
`cursando` · `regular` · `libre` · `aprobada` · `recursa`

---

## 5. MODELO DE DATOS (dominio)

**La cursada es el objeto central.** Todo cuelga de ella.

```
instituto
  └── carrera
        └── plan
              └── unidad_curricular   (horas_totales, régimen anual/cuatrimestral)
                    └── comision      (ciclo, división, docentes)
                          └── CURSADA (alumno + estado)

persona (alumno | docente | administrativo)
alumno  (legajo, habilitado)

cursada
  ├── clase        (fecha, horas 1-4, tipo: normal | cancelada | feriado)
  │     └── asistencia (P | A | J | T)
  └── evaluacion   (parcial | tp | recuperatorio | final)
        └── nota   (1-10)

parámetros: porcentaje de asistencia requerido, escala, nota de aprobación,
            nota de promoción, si la justificada computa
auditoría: quién cambió qué, cuándo, valor anterior
```

---

## 6. REGLAS DE NEGOCIO (no negociables)

1. **La asistencia se mide en horas, no en clases.** Una clase puede ser de 1 a 4 módulos.
2. `horas_dictadas` = suma de las horas de clases tipo `normal`.
   `cancelada` y `feriado` **no** cuentan en el denominador.
3. `horas_asistidas` = suma de horas de asistencias `presente` (y `justificada` solo si el parámetro lo indica).
4. `porcentaje = horas_asistidas / horas_dictadas * 100`. Si el denominador es 0, es `null`, no 0.
5. **Condición:**
   - `% < requerido` → `libre`.
   - `% >= requerido` y todas las evaluaciones obligatorias con nota y promedio `>= aprobación` → `regular`.
   - Además promedio `>= promoción` → `aprobada`.
   - Sin notas cargadas → sigue `cursando`.
6. El estado se puede forzar a mano, **siempre con auditoría**.
7. Nada se borra: baja lógica y cambios auditados.
8. El porcentaje, la escala y la aprobación **nunca** van hardcodeados: son parámetros.

> **En esta etapa el frontend NO calcula nada de esto.** Recibe `porcentaje` y `estado` ya calculados
> desde el mock. No inventes fórmulas en el cliente.

---

## 7. STACK

### Etapa actual — frontend
- Next.js 15, App Router, TypeScript estricto
- Tailwind CSS + **shadcn/ui con el tema neutral**, sin personalizar más que `--primary`
- lucide-react (viene con shadcn)
- **Sin backend:** datos mock tipados en `lib/mock/data.ts`. Sin fetch, sin base de datos, sin auth.

### Etapa siguiente — backend (contexto, no construir ahora)
Django 5 + Django REST Framework + PostgreSQL. API documentada con `drf-spectacular`.
El frontend consumirá esa API. Nada de Firebase ni MongoDB.

### Prohibido
- Dependencias nuevas sin justificar (nada de TanStack Table, date-fns, framer-motion, recharts).
- Firebase, Supabase, Prisma, GraphQL.
- Estado global (Redux, Zustand) para este alcance.

---

## 8. CONVENCIONES DE CÓDIGO

- **Server Components por defecto.** `"use client"` solo en el componente que necesita estado o
  eventos, y lo más abajo posible en el árbol.
- **Tipos en `lib/types.ts`.** Nunca `any`, nunca `as unknown as`, nunca `@ts-ignore`.
- **Datos mock solo en `lib/mock/data.ts`.** Nunca dentro de un componente.
- Componentes en **PascalCase y en español** (`TablaPlanilla`, `EstadoBadge`).
  Variables y funciones en **inglés** (`const rows`, `formatDate`). Consistencia, no mezcla al azar.
- **Tailwind con la escala estándar** (`p-6`, `gap-4`, `text-sm`, `h-10`, `size-7`).
  Prohibido `w-[23px]`, `text-[13.5px]` y similares.
- Sin estilos inline, sin `!important`.
- **No derivar estado con `useEffect`**: se calcula en el render o en un helper puro.
- Lógica fuera del JSX: si hay un cálculo, va en una función con nombre.
- **Máximo ~150 líneas por componente.** Si crece, se divide.
- Sin carpetas `features/`, `modules/` ni barrels que reexporten todo.
- Comentarios solo donde el código no se explica solo.
- Accesibilidad: `<table>` con `<thead>`/`<tbody>`, `aria-label` en checkboxes, foco visible,
  contraste AA. Nunca un `div` clickeable: se usa `button`.

### Estructura esperada

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
  layout/app-shell.tsx
  layout/page-header.tsx
  ui/                               # shadcn
  estado-badge.tsx
  empty-state.tsx
  planilla/tabla-planilla.tsx
  planilla/celda-asistencia.tsx
  asistencia/lista-alumnos.tsx
lib/
  types.ts
  format.ts
  mock/data.ts
```

---

## 9. DISEÑO

Herramienta interna, no landing page. Densidad y legibilidad por encima de todo.

- shadcn/ui con tema **neutral**, tal como viene. Solo `--primary: #1E3A5F`.
- `bg-muted/30` como fondo, `bg-background` en superficies, `border-border` en bordes.
- Tipografía del sistema o Inter. Base `text-sm` (14px). Título de página `text-xl` (20px).
- Sin gradientes, sin glassmorphism, sin animaciones de entrada, sin emojis, sin ilustraciones,
  sin imágenes, sin avatares con foto, sin modo oscuro.
- Estados con **punto de 6px + texto**, no pastillas saturadas:
  `regular text-emerald-700`, `en riesgo text-amber-700`, `libre text-red-700`,
  `aprobada text-blue-700`, `cursando text-muted-foreground`.
- Tablas densas: filas de ~40px, `text-sm`, `border-b` entre filas, sin zebra ni bordes verticales.

---

## 10. DATOS MOCK — `lib/mock/data.ts`

```ts
export type EstadoCursada = 'cursando' | 'regular' | 'libre' | 'aprobada' | 'recursa';
export type MarcaAsistencia = 'P' | 'A' | 'J' | 'T';

export interface Alumno {
  id: string; nombre: string; apellido: string; dni: string; legajo: string;
}

export interface Clase {
  id: string; fecha: string; horas: number; tipo: 'normal' | 'cancelada' | 'feriado';
}

export interface FilaPlanilla {
  cursadaId: string;
  alumno: Alumno;
  asistencias: Record<string, MarcaAsistencia | null>;
  horasAsistidas: number;
  horasDictadas: number;
  porcentaje: number | null;
  estado: EstadoCursada;
}

export interface Comision {
  id: string; unidadCurricular: string; anio: number; division: string; ciclo: number;
  docentes: string[]; inscriptos: number; asistenciaPromedio: number; enRiesgo: number;
}
```

### Dataset
- Carrera **"Profesorado de Educación Física"**, ciclo **2026**.
- **"Didáctica de la Educación Física I"** — 1° Año, Div. A, Laura Giménez, **32 alumnos**.
- **"Biomecánica"** — 2° Año, Div. Única, Martín Rossi y Ana Duarte, 24 alumnos.
- **"Natación y su Enseñanza"** — 3° Año, Div. A, Sofía Peralta, 18 alumnos.
- 14 clases por comisión, del 10/03/2026 al 25/06/2026, de 2 horas. Dos `feriado`, una `cancelada`.
- Apellidos: González, Rodríguez, Fernández, López, Martínez, Pérez, Gómez, Sánchez, Romero, Sosa,
  Torres, Álvarez, Benítez, Acosta, Giménez, Molina, Ortiz, Silva, Rojas, Medina, Herrera, Aguirre,
  Cabrera, Núñez, Luna, Paredes, Vera, Quiroga, Ríos, Cáceres.
- DNI de 8 dígitos. Legajo tipo `2026-014`.
- Estados: mayoría regulares, 3-4 en riesgo, 2 libres, 1 aprobada, 1 cursando.
- Evaluaciones: "Parcial 1" (15/05/2026), "TP 1" (05/06/2026), "Recuperatorio" (26/06/2026), escala 1-10.

Los valores de `porcentaje`, `estado` y `horasAsistidas` deben ser **coherentes entre sí**.
No lorem ipsum: nombres y datos realistas argentinos.

---

## 11. PANTALLAS

### 11.1 Planilla de cursada — `/comisiones/[id]/planilla` · LA PANTALLA CENTRAL
- Header: título de la unidad curricular, "1° Año · Div. A · Ciclo 2026 · Prof. Laura Giménez · 32 inscriptos".
- Acciones: "Exportar CSV" (funcional, con `Blob`) y "Tomar asistencia" (link a la pantalla de asistencia).
- Resumen: asistencia promedio, en riesgo, libres.
- Tabla: alumno sticky a la izquierda (nombre + DNI), una columna por clase (fecha + horas),
  horas `38/48`, porcentaje, estado.
- Celdas P/A/J/T: letra de 11px semibold, color según la marca, sin círculos.
- Clases `feriado`/`cancelada`: header tachado, celdas con guion.
- `thead` sticky, scroll horizontal, primera columna fija.
- Mobile: lista de alumnos con % y estado.

### 11.2 Tomar asistencia — `/comisiones/[id]/asistencia` · MOBILE
- `max-w-md`, sin sidebar. Pensada para usar con una mano.
- Fecha (`input type="date"`), tipo de clase (Normal / Cancelada / Feriado), horas (1-4).
- Contador "28 de 32 presentes". "Todos presentes" / "Todos ausentes".
- Filas de 56px que se togglean enteras (`label` + `Checkbox`), DNI debajo del nombre.
- Barra inferior fija con el resumen y "Guardar asistencia".
- Si es cancelada o feriado: lista deshabilitada, aviso, y el botón guarda como cancelada.
- Guardar: toast y volver a la planilla. Sin persistencia real.

### 11.3 Tablero — `/`
- Cuatro métricas en una sola caja con `divide-x`: alumnos activos, asistencia promedio,
  en riesgo, notas pendientes.
- Tabla "Estado por comisión": comisión, docente, inscriptos, asistencia (número + barra fina),
  regulares, libres, en riesgo, estado.
- Tabla "Docentes con notas pendientes": docente, comisión, evaluación, fecha límite, días de atraso.
- Sin gráficos.

### 11.4 Cargar notas — `/comisiones/[id]/notas`
- Tabs por evaluación. Grilla de alumnos con input numérico 1-10 (vacío permitido).
- Columnas: alumno, nota, promedio, asistencia, condición. Promedio y condición vienen del mock.
- Panel lateral: promedio del curso, máxima, mínima, aplazos, criterios de aprobación.
- "Guardar cambios" habilitado solo si hay cambios.

### 11.5 Comisiones — `/comisiones`
- Buscador y filtro por año, funcionando con `useState`.
- Tabla: comisión, año/división, docentes, inscriptos, asistencia, en riesgo, estado.
- El nombre linkea a la planilla. Estado vacío cuando no hay resultados.

### 11.6 Alumnos — `/alumnos` y `/alumnos/[id]`
- Listado con búsqueda por nombre, apellido o DNI.
- Tabla: alumno, DNI, legajo, año, comisiones, estado general
  (regular si todo regular/aprobada, en riesgo si alguna en riesgo, libre si alguna libre).
- Ficha: iniciales en `Avatar` sin imagen, datos, tres métricas y tabla de situación por unidad curricular.
- Solo lectura: sin editar, sin eliminar, sin dar de alta.

---

## 12. PROHIBIDO

- Botones, selects o tabs que no hacen nada ("solo visual"). Si no funciona, no se muestra.
- `useEffect` para sincronizar estado derivado.
- Componentes de más de 150 líneas.
- `any`, `as unknown as`, `@ts-ignore`.
- Datos hardcodeados dentro de un componente.
- `div` con `onClick` en lugar de `button`.
- Textos de marketing ("Potenciá tu gestión", "La solución integral").
- Gráficos decorativos, donuts, tarjetas gigantes con íconos.
- Login de alumnos, registro público, generación de PDFs, subida de archivos, pagos.

---

## 13. CÓMO TRABAJAR

1. **Antes de escribir código**, mostrá el árbol de archivos y un plan de 5 líneas. Esperá OK.
2. **Una pantalla por vez.** No generes todas juntas.
3. Si algo del pedido es ambiguo, preguntá antes de inventar.
4. Si una idea no está en este documento, anotala como propuesta y no la implementes.
5. Al terminar cada pantalla, corré `npx tsc --noEmit` y `npm run lint`.

---

## 14. DEFINITION OF DONE (por pantalla)

- [ ] `npx tsc --noEmit` sin errores y sin `any`.
- [ ] `npm run lint` limpio.
- [ ] Ningún componente supera las 150 líneas.
- [ ] No hay controles que no hagan nada.
- [ ] Las rutas cargan sin warnings de hidratación en consola.
- [ ] Se ve bien en 1280px y en 390px.
- [ ] Existen los estados vacíos.
- [ ] Se usan componentes de shadcn, no `div` estilizados a mano.
- [ ] No se agregó ninguna dependencia.
