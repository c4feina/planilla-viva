# PLANILLA VIVA — Brief del proyecto y prompt maestro

> Este documento es el contexto único del proyecto. Sirve como `AGENTS.md` (OpenCode / Cursor / Codex / Claude Code)
> y como brief para cualquier persona que se sume. Si algo no está acá, no es parte del producto.

---

## 1. Contexto

- **Cliente:** un profesorado de Educación Física **privado**, en Merlo, Buenos Aires, Argentina.
- **Tamaño:** pequeño. Pocas materias y pocos docentes. Un secretario académico, un director/dueño.
- **Situación actual:** gestionan asistencias, notas y el estado de los alumnos con **planillas de Excel** sueltas
  (`Asistencia_1er_año_FINAL_v3.xlsx`), con versiones duplicadas, sin permisos y sin registro de quién cambió qué.
- **Quién construye:** un desarrollador junior que trabaja con asistencia de IA (vibecoding).
- **No hay** gimnasio, natatorio ni instalaciones deportivas propias. Es una institución que **forma docentes** de
  Educación Física. Las materias pueden ser teóricas o prácticas, pero no hay gestión de espacios físicos.

### Decisiones ya tomadas (no volver a proponerlas)

| Tema | Decisión |
|---|---|
| Documentos del alumno (PDFs: DNI, constancias, comprobantes de cuota) | **EN ALCANCE (v1.1).** Se suben y descargan desde la ficha. No se generan documentos institucionales. |
| Legajo digital / subida de archivos | **EN ALCANCE (v1.1) como documentos PDF por alumno.** Sin visor avanzado ni generación de PDFs. |
| Campus virtual, aula virtual, foros, entrega de TP | **FUERA DE ALCANCE.** No es un campus. |
| Reserva de gimnasio / natatorio / espacios | **FUERA DE ALCANCE.** No existen. |
| Prácticas docentes y residencias | **FUERA DE ALCANCE** (posible módulo futuro, no ahora). |
| Apto físico / datos de salud | **FUERA DE ALCANCE.** |
| Pagos, aranceles, contabilidad | **FUERA DE ALCANCE.** A lo sumo un campo `habilitado` que carga administración. La alerta de cuota queda en backlog hasta definir 5.º día hábil, vencimiento y descuento. |
| Acceso del alumno al sistema | **FUERA DE ALCANCE en v1.** El alumno no inicia sesión. |
| Offline real / sincronización | **FUERA DE ALCANCE en v1.** Solo UI optimista y reintento. |
| Comisiones / divisiones | **Una sola oferta por unidad curricular y año.** La UI las llama "Materias"; no hay comisiones A/B. El modelo interno conserva `comision` como la oferta materia-año. |
| Importar alumnos desde Excel | **Backlog.** Se evalúa después del backend; si el próximo ciclo se carga desde cero, la carga manual sigue siendo viable. |
| Finales y mesas de examen | **Backlog.** Se conversa en la reunión; no se construye en v1. |
| Auditoría global | **Backend.** `django-simple-history` + vista de auditoría para dirección; los permisos solos no responden "quién cambió el legajo". |

---

## 2. Definición del producto

> **Un registro académico interno para el profesorado: reemplaza las planillas de Excel por una sola base, donde se
> carga la asistencia y las notas, y el sistema dice en todo momento en qué estado está cada alumno.**

En una frase para el cliente:

> **"Tu planilla, pero viva: una sola, compartida, y que calcula sola."**

### Qué es
- Back-office: la trastienda administrativa del instituto.
- Una **fuente única de verdad** con permisos por rol y auditoría de cada cambio.
- Una herramienta para **secretaría, dirección y docentes**.

### Qué NO es
- No es un campus virtual.
- No es una app para alumnos.
- No es un ERP.
- No es un generador de documentos.

### La salida es la pantalla, no el papel
No hay un paso de "emitir documento". El valor es ver el estado en pantalla y, como mucho, exportar la tabla a CSV.
Los PDFs de documentos del alumno se **adjuntan**, no se generan.

### Filtro de alcance (aplicar a toda propuesta nueva)
> **"¿Esto cambia el estado de un alumno o la carga de un docente? Si no, no entra."**

Excepción aprobada: documentos PDF por alumno, porque secretaría los necesita junto a la ficha.

---

## 3. Usuarios y roles

| Rol | Superficie | Qué hace |
|---|---|---|
| **Secretaría / preceptoría** | Desktop, teclado, tablas densas | Inscribe, corrige, consulta, exporta. Es el usuario principal. |
| **Docente** | Celular, rápido | Toma asistencia y carga notas **solo de sus materias**. |
| **Dirección / dueño** | Desktop, ocasional | Mira el tablero. Solo lectura. |
| **Administración** | Desktop | Marca `habilitado` del alumno. Solo lectura académica. |
| **Alumno** | — | **No entra en v1.** |

Reglas:
- El docente no ve materias ajenas, ni datos de otros docentes, ni el tablero general.
- Dirección ve todo, pero no edita.
- Todo cambio en asistencia, nota, estado o documentos queda auditado con usuario y timestamp.

---

## 4. Alcance de la v1 — cinco piezas + documentos

1. **Personas** — alumnos y docentes (alta, edición, activo/inactivo).
2. **Estructura** — carrera, plan, unidades curriculares, ciclos lectivos, materias (una oferta por materia y año) y asignación docente.
3. **Inscripción a cursada** — qué alumno cursa qué materia en el ciclo.
4. **Asistencia** — carga por clase, medida en **horas**, con consolidado automático.
5. **Notas y condición** — evaluaciones y notas; el sistema calcula el estado del alumno.
6. **Documentos del alumno (v1.1)** — subir, listar y descargar PDFs desde la ficha. En el prototipo frontend se guardan en memoria; con backend, metadata en PostgreSQL y archivo en object storage.

Las **vistas de lectura** (tablero, planilla, ficha) se apoyan sobre esas piezas.

### Flujo completo

```
Arranca el ciclo → se crean las materias del año → se inscriben alumnos
   → el docente toma asistencia → el docente carga notas
      → el sistema calcula la CONDICIÓN
         → secretaría ve el estado de todos
            → dirección ve el tablero del instituto
```

**El vocabulario central es el estado del alumno:** `cursando` · `regular` · `libre` · `aprobada` · `recursa`.

---

## 5. Modelo de datos

Base de datos en **PostgreSQL**. Nombres de tablas, columnas y modelos **en español** (son términos del dominio);
funciones, variables y componentes **en inglés**.

```
instituto(id, nombre, cuit, direccion, activo)

carrera(id, instituto_id, nombre, activo)
plan(id, carrera_id, nombre, resolucion, anio_inicio, activo)
unidad_curricular(id, plan_id, nombre, anio, regimen, horas_totales, orden)
    -- regimen: 'anual' | 'cuatrimestral'

ciclo_lectivo(id, instituto_id, anio, fecha_inicio, fecha_fin, estado)

comision(id, ciclo_lectivo_id, unidad_curricular_id, nombre, cupo, activa)
    -- una sola oferta por unidad curricular y año; sin divisiones A/B
comision_docente(id, comision_id, persona_id, rol)
    -- permite co-docencia; rol: 'titular' | 'auxiliar'

persona(id, instituto_id, tipo, nombre, apellido, dni, email, telefono, activo)
    -- tipo: 'alumno' | 'docente' | 'administrativo'
alumno(id, persona_id, legajo, fecha_ingreso, habilitado)

cursada(id, comision_id, alumno_id, estado, origen, created_at)
    -- estado: 'cursando' | 'regular' | 'libre' | 'aprobada' | 'recursa'
    -- origen: 'importacion' | 'manual'

clase(id, comision_id, fecha, horas, tipo, observacion, created_by)
    -- horas: 1..4 (módulos)
    -- tipo: 'normal' | 'cancelada' | 'feriado'

asistencia(id, clase_id, cursada_id, estado, observacion)
    -- estado: 'presente' | 'ausente' | 'justificada' | 'tarde'

evaluacion(id, comision_id, nombre, tipo, fecha, peso, nota_maxima, obligatoria)
    -- tipo: 'parcial' | 'tp' | 'recuperatorio' | 'final' | 'coloquio'

nota(id, evaluacion_id, cursada_id, valor, observacion, created_by)

documento_alumno(id, alumno_id, categoria, nombre_archivo, mime_type, tamanio,
                 storage_key, created_by, created_at)
    -- categoria: 'dni' | 'constancia' | 'cuota' | 'analitico' | 'otro'
    -- el archivo vive en object storage; en la DB solo metadata

parametro_asistencia(id, plan_id, unidad_curricular_id, porcentaje_requerido,
                     justificada_cuenta, max_justificadas)
    -- unidad_curricular_id NULL = aplica a todo el plan
    -- porcentaje_requerido por defecto 75

parametro_nota(id, plan_id, nota_aprobacion, nota_promocion, escala_maxima)
    -- por defecto: aprobacion 4, promocion 7, escala 10

auditoria(id, tabla, registro_id, accion, datos_antes, datos_despues, usuario_id, created_at)
```

Notas de diseño:
- La **cursada** es el objeto central. Todo cuelga de ella.
- `asistencia` cuelga de `clase`, y `clase` de `comision`. Por eso el cálculo de horas sale solo.
- Nada se borra físicamente: baja lógica y cambios de estado auditados.
- `documento_alumno` guarda metadata; el archivo vive en object storage (S3/R2/Supabase Storage), nunca como blob en PostgreSQL.
- `instituto_id` existe desde el día 1 (seguro barato para el futuro), pero **no** se construye multi-tenant ni
  selector de institutos en v1.

---

## 6. Reglas de negocio (no negociables)

1. **La asistencia se mide en horas, no en clases.** Una clase puede ser de 1 a 4 módulos.
2. `horas_dictadas` = suma de `clase.horas` con `tipo = 'normal'`.
   Las clases `cancelada` y `feriado` **no** cuentan en el denominador.
3. `horas_asistidas` = suma de `clase.horas` de las asistencias en estado `presente`
   (y `justificada` solo si `parametro_asistencia.justificada_cuenta = true`).
4. `porcentaje = horas_asistidas / horas_dictadas * 100`. Si el denominador es 0, el porcentaje es `null` (no 0).
5. **Condición automática de la cursada:**
   - Si `porcentaje < porcentaje_requerido` → `libre`.
   - Si `porcentaje >= porcentaje_requerido` y todas las evaluaciones obligatorias tienen nota
     y el promedio `>= nota_aprobacion` → `regular`.
   - Si además el promedio `>= nota_promocion` → `aprobada`.
   - Si no hay notas cargadas todavía → se queda en `cursando`.
6. **Override manual:** secretaría puede forzar el estado, pero **siempre** con auditoría (quién, cuándo, valor anterior).
7. **Toda edición** de asistencia, nota o estado genera un registro en `auditoria`.
8. Los parámetros (`75%`, escala, aprobación) **nunca** van hardcodeados: salen de `parametro_*`.
9. **Documentos:** solo PDF, máximo 10 MB. Metadata en DB, archivo en object storage, acceso por URL firmada y permisos. Toda carga/descarga queda auditada.

---

## 7. Stack

### Decisión

**Backend: Django 5 + Django REST Framework sobre PostgreSQL.**
**Frontend: Next.js + TypeScript + Tailwind + shadcn/ui, consumiendo la API.**
**Deploy: Railway o Render (backend) + Neon o Supabase como Postgres + Vercel (frontend).**

Criterio de elección: **el lenguaje en el que se puede debuggear sin la IA**. El backend lo escribe la persona,
así que la prioridad no es "lo que más sabe la IA" sino lo que se puede entender y arreglar a las 2 de la mañana.

Por qué Django y no las otras opciones: el 80% de este producto es CRUD administrativo, permisos y reportes.
Django trae **admin, auth, ORM, migraciones y permisos** de fábrica. El admin cubre gratis las pantallas de
estructura y usuarios, y deja concentrarse en las 4 pantallas que importan (planilla, asistencia, notas, tablero).

| Opción | A favor | En contra | Veredicto |
|---|---|---|---|
| **Django + DRF** | Admin gratis, ORM, migraciones, auth, `simple-history` para auditoría | Menos "moderno" en lo async (irrelevante acá) | ✅ **Recomendado** |
| FastAPI | Moderno, OpenAPI nativo, liviano | Admin, auth, migraciones y permisos se arman a mano | ⚠️ Si se quiere control total |
| Spring Boot | Robusto, tipado, enterprise | Verboso; iteración lenta para un solo dev | ⚠️ Si Java es el fuerte |
| ASP.NET Core | Muy bueno, EF Core, rápido | Más ceremonia | ⚠️ Si C# es el fuerte |

Si el fuerte es Java o C#, se cambia el backend y **el resto del brief no cambia** (mismo modelo, mismas reglas).
Lo que no se hace es mezclar dos backends.

### Tabla de stack

| Capa | Elección |
|---|---|
| Lenguaje | Python 3.12+ |
| Backend | Django 5 + Django REST Framework |
| API | DRF + `drf-spectacular` (OpenAPI → tipos TS para el frontend) |
| Base de datos | PostgreSQL 16+ |
| ORM | Django ORM (sin SQL crudo salvo casos justificados) |
| Auth | `djangorestframework-simplejwt` (access corto + refresh en cookie httpOnly) |
| Permisos | Grupos de Django + **querysets `for_user()`** por modelo |
| Auditoría | `django-simple-history` en Asistencia, Nota y Cursada |
| Migraciones | Django migrations, versionadas en el repo |
| Tests backend | `pytest` + `pytest-django` + `factory_boy` |
| Frontend | Next.js (App Router) + TypeScript estricto |
| UI | Tailwind CSS + shadcn/ui + TanStack Table |
| Formularios | react-hook-form + zod |
| Fechas | date-fns con locale `es-AR` |
| Import Excel | `openpyxl` o `pandas` en un management command |
| Deploy | Railway o Render (API) + Neon/Supabase (DB) + Vercel (frontend) |
| Repo | Un repo con `backend/` y `frontend/` |

### Estructura del repo

```
planilla-viva/
├── AGENTS.md
├── BACKLOG.md
├── backend/
│   ├── config/            # settings, urls, wsgi
│   ├── apps/
│   │   ├── personas/      # Persona, Alumno, Docente
│   │   ├── estructura/    # Carrera, Plan, UnidadCurricular, Ciclo, Comision
│   │   ├── cursadas/      # Cursada, inscripción
│   │   ├── asistencia/    # Clase, Asistencia, cálculo
│   │   ├── evaluaciones/  # Evaluacion, Nota, condición
│   │   ├── auditoria/     # historial y vistas de solo lectura
│   │   └── reportes/      # tablero y agregaciones
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── app/
    ├── components/
    └── lib/api/
```

### Prohibido en este proyecto
- **MongoDB** (ver sección 7.1).
- Firebase.
- Microservicios, Docker en desarrollo, Kubernetes, GraphQL, monorepo con Nx/Turborepo.
- Redux o estado global complejo.
- Offline con sincronización en v1.
- Generación de PDFs o documentos.
- Mezclar dos backends (Django + Spring, etc.).

### 7.1 Por qué PostgreSQL y no MongoDB

No es una preferencia de stack: el dominio es relacional y los datos son registros académicos.

1. **Integridad referencial.** Una nota no puede existir sin una cursada; una cursada no puede existir sin comisión.
   En Postgres eso es un `FOREIGN KEY`. En Mongo se garantiza a mano, en cada endpoint, para siempre.
2. **Constraints.** `UNIQUE (cursada, evaluacion)` evita notas duplicadas. `CHECK (valor BETWEEN 1 AND 10)` evita
   una nota 15. En Mongo, si el código se olvida, el dato queda mal.
3. **Transacciones.** Cargar la asistencia de 40 alumnos tiene que ser todo o nada. Postgres lo hace nativo.
4. **Reportes.** La planilla y el tablero son `JOIN` + `GROUP BY`. En Mongo son `$lookup` encadenados, lentos y frágiles.
5. **Auditoría y evolución.** Las migraciones versionadas permiten cambiar el esquema **sin perder datos**.
   "Schema-less" no es más moldeable: es más fácil de romper.

Si algún día hace falta un campo flexible (atributos propios de un plan), se resuelve con una columna `JSONB`.
Se tiene la flexibilidad **sin** perder las relaciones.

### Costos de referencia
- Desarrollo: **USD 0**.
- Producción: **USD 10-25/mes** (Railway/Render ~5-10 + Postgres gestionado con backups + Vercel Hobby) + dominio.

---

## 8. Pantallas de la v1

1. **Login** (email + password).
2. **Tablero** (dirección / secretaría): estado por materia, carga de notas por docente, alumnos en riesgo.
3. **Materias** (lista filtrable por ciclo y unidad curricular; una oferta por materia/año).
4. **Planilla de cursada** — **la pantalla central**: filas = alumnos, columnas = clases, totales de horas y %,
   estado. Editable por secretaría. Exportable a CSV.
5. **Tomar asistencia** (docente): lista de alumnos, "todos presentes" + destildar, botón de clase cancelada/feriado.
   Optimizada para celular y para 40 alumnos en menos de 30 segundos.
6. **Cargar notas** (docente): evaluaciones de la materia y grilla de notas.
7. **Alumnos**: lista y ficha con el estado en cada materia y documentos PDF.
8. **Estructura** (admin): carreras, planes, unidades curriculares, ciclos, materias.
9. **Usuarios**: alta de docentes y secretaría, asignación de roles.

---

## 9. Convenciones

- **Idioma:** UI, base de datos, modelos y mensajes en **español (es-AR)**. Funciones, variables y componentes en **inglés**.
- **Fechas:** `dd/MM/yyyy` en pantalla, `date` en la base, nunca strings sueltos.
- **Porcentajes:** un decimal.
- **Nunca `any`** en TypeScript. Tipos del frontend generados desde el esquema OpenAPI.
- **Server Components por defecto**; `"use client"` solo cuando haya interacción real.
- **Migraciones versionadas** con Django migrations. Nunca editar una migración ya aplicada.
- **Permisos en el backend**, siempre. La UI no es un control de seguridad.
- **Commits** en formato Conventional Commits, en español o inglés, cortos.
- **Diseño:** sobrio, institucional, sin gradientes ni animaciones. Tablas legibles, botones grandes. Nada de "startup".

---

## 10. Reglas para el agente de IA

1. **No inventar funcionalidades.** Si algo no está en la sección 4, proponerlo en `BACKLOG.md` y esperar aprobación.
2. **No agregar pagos, aranceles, contabilidad ni generación de PDFs.** Los documentos PDF por alumno están aprobados (v1.1); no ampliar a otros uploads.
3. **Antes de cada etapa:** mostrar el plan (modelos, endpoints, pantallas, migraciones) y esperar OK.
4. **Cada cambio de esquema** va en una migración de Django nueva. Nunca editar una migración ya aplicada.
5. **Todo endpoint nuevo** declara su permiso y usa el queryset `for_user()` correspondiente. Sin excepción.
6. **Tests obligatorios** para el cálculo de horas, porcentaje y condición. Si se toca esa lógica, se actualizan los tests.
7. **La lógica de negocio vive en un `services.py`**, nunca en un serializer, una vista o un modelo. Los modelos solo describen datos.
8. **No cargar datos reales de alumnos** en el repo. Usar seed ficticio.
9. **Si una tarea requiere una decisión de producto, preguntar.** No asumir.

### División de trabajo: persona vs. IA

El backend se escribe a mano (con la IA como asistente, no como autora). El frontend se delega mucho más.

| Tarea | Quién | Por qué |
|---|---|---|
| Modelo de datos y migraciones | **Persona** | Es la decisión que no se puede deshacer barato |
| Reglas de negocio (asistencia, condición) | **Persona** + tests | Es el corazón del sistema y tiene que ser auditable |
| Permisos y querysets `for_user()` | **Persona** | Es donde se juega la seguridad (OWASP A01) |
| Endpoints CRUD simples | IA, revisados por la persona | Boilerplate |
| Componentes de UI, tablas, formularios, CSS | **IA** | Alto volumen, bajo riesgo |
| Tests de UI / Playwright | IA | |
| Script de importación de Excel | Persona con IA | Toca datos reales |

Regla práctica: **si no podés explicar una línea del backend sin la IA, no la mergeás.**

---

## 11. Seguridad (OWASP Top 10 aplicado a este sistema)

| Riesgo | Cómo se mitiga acá |
|---|---|
| **A01 Broken Access Control** | Querysets `for_user()` + tests de permisos. Un docente nunca ve materias ajenas, aunque cambie el ID en la URL. |
| **A02 Fallas criptográficas** | HTTPS obligatorio, `Argon2` para passwords, refresh token en cookie `httpOnly` + `Secure`. Nada sensible en logs. |
| **A03 Inyección** | Django ORM siempre. Si hay SQL crudo, con parámetros. Nunca concatenar strings. |
| **A04 Diseño inseguro** | Auditoría de todo cambio, sin borrado físico, estados explícitos. |
| **A05 Mala configuración** | `DEBUG=False`, `ALLOWED_HOSTS` cerrado, secretos en variables de entorno, `CORS` solo al dominio del frontend. |
| **A06 Componentes vulnerables** | `pip-audit` en CI, Dependabot activo. |
| **A07 Fallas de autenticación** | `django-axes` (rate limit y bloqueo), access token de 15 min, refresh de 7 días, logout que invalida. |
| **A09 Fallas de logging** | Log de accesos y de cambios de notas/asistencia. Sin datos personales en el log. |

---

## 12. Criterios de aceptación de la v1

- [ ] Un docente toma asistencia de 40 alumnos en menos de 30 segundos, desde el celular.
- [ ] El porcentaje de asistencia se calcula en horas y coincide con el cálculo manual en 3 casos de prueba.
- [ ] Las clases canceladas y los feriados no afectan el porcentaje.
- [ ] Un docente **no puede** ver ni editar materias que no le fueron asignadas (verificado con tests de permisos, no por la UI).
- [ ] Secretaría puede corregir una asistencia y queda registrado quién, cuándo y el valor anterior.
- [ ] El estado del alumno se actualiza automáticamente al cargar notas o asistencia.
- [ ] La planilla de una materia se exporta a CSV con las mismas columnas que se ven en pantalla.
- [ ] El tablero muestra, por materia: inscriptos, regulares, libres, en riesgo y % de asistencia promedio.
- [ ] El tablero muestra qué docentes tienen notas pendientes de carga.
- [ ] Secretaría puede subir un PDF a la ficha, verlo listado y descargarlo; queda registrado en el historial.

---

## 13. Roadmap posterior (no construir ahora)

- **Finales y mesas de examen** — materias adeudadas, inscripción, nota final. *(el más probable)*
- **Inscripción online a cursadas** con validación de correlatividades.
- **Autoservicio del alumno** — solo lectura de su estado.
- **Offline real** para toma de asistencia.
- **Multi-instituto**, si el producto se vende a otros profesorados.

Todos se enchufan sobre el mismo núcleo. Los documentos PDF ya están en v1.1; pagos, aranceles y contabilidad siguen fuera de alcance.

---

## 14. Preguntas abiertas (resolver con el secretario antes de codear)

1. ¿Quién toma la asistencia: el docente por unidad curricular, o el preceptor por turno?
2. ¿Cuál es el régimen exacto de asistencia? (porcentaje, justificaciones, recuperación de asistencia, validez de la regularidad)
3. ¿Qué escala de notas y qué condiciones usan? (aprobación, promoción directa, libre)
4. ¿Cómo resuelven hoy los finales y las materias adeudadas?
5. ¿La cuota condiciona lo académico? (solo para saber si hace falta el campo `habilitado`)
6. ¿Cuántas materias y alumnos hay en total? (define performance y permisos)
7. ¿Quién es el decisor real: el secretario o el dueño?
8. ¿Qué tarea de fin de año les lleva más tiempo?

---

## 15. Estado del proyecto

- [x] Definición del producto
- [x] Alcance y no-alcance
- [x] Modelo de datos inicial
- [x] Stack definido
- [ ] Relevamiento con el secretario
- [x] Prototipo funcional de pantallas para mostrar
- [x] Documentos PDF por alumno (frontend, en memoria)
- [x] Simplificación de comisiones a materias en la UI
- [ ] Setup del repo (Django + Postgres + Next.js)
- [ ] Núcleo + importación de alumnos
- [ ] Asistencia + planilla
- [ ] Notas + condición
- [ ] Tablero

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
