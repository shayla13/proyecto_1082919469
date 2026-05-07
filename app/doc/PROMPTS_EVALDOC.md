# PROMPTS DE IMPLEMENTACIÓN — EvalDoc
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_EVALDOC.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_EVALDOC.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_EVALDOC.md
2. Leer doc/ESTADO_EJECUCION_EVALDOC.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer doc/PLAN_EVALDOC.md
y crear el archivo doc/ESTADO_EJECUCION_EVALDOC.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login, Registro y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, autenticación y correos`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT,
flujos de verificación de correo y gestión de dominios institucionales.

Tu mentalidad: EvalDoc existe para que los estudiantes puedan opinar sobre
sus profesores sin miedo. Esa promesa requiere que el sistema funcione bien
en dos niveles: técnico (el anonimato real, implementado en la Fase 5) y
de confianza (el registro funciona limpio, los correos llegan, la cuenta
se activa sin fricciones). Esta fase construye los cimientos de esa confianza.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — secciones 8 (stack y variables de entorno —
   nota que incluye RESEND_API_KEY y RESEND_FROM_EMAIL además de las
   variables estándar), 9 (reglas de oro), 10 (estructura del seed.json
   con system_config y el dominio por defecto), 11 (estructura de lib/ —
   nota especialmente lib/emailService.ts y sus tres funciones), 12 (migration
   0001 con las cuatro tablas: users, activation_tokens, password_reset_tokens,
   system_config), y 18 (identidad visual del login)
2. doc/ESTADO_EJECUCION_EVALDOC.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— RN-10: el registro valida el dominio del correo. El flujo es:
  (1) Extraer el dominio: email.split('@')[1].
  (2) Obtener system_config.allowed_domain desde la DB (o desde el seed
  en modo seed).
  (3) Si no coinciden: retornar 400 con el mensaje "Solo se aceptan correos
  del dominio [allowed_domain]." Sin revelar el dominio en el mensaje si
  es confidencial — pero sí en un texto informativo en la página de registro.

— El registro NO activa la cuenta inmediatamente — a diferencia de FlowMind,
  EquilibraStudy y otros proyectos del curso. Aquí se requiere verificación
  de correo porque el sistema necesita garantizar que el estudiante tiene
  acceso real al correo institucional. El usuario se crea con is_active=false
  y solo se activa al hacer clic en el enlace de verificación.

— activation_tokens: generar con crypto.randomBytes(32).toString('hex')
  (64 caracteres hex). Guardar en la tabla. expires_at = NOW() + 24 horas.
  Al activar: verificar que el token no está expirado (expires_at > NOW())
  y que used_at IS NULL. Si pasa: SET users.is_active = true y SET
  activation_tokens.used_at = NOW().

— password_reset_tokens: misma lógica pero expires_at = NOW() + 15 minutos
  (según RF-03 del plan). Al restablecer: verificar no expirado y no usado.
  Actualizar password_hash. Marcar used_at.

— El bloqueo por intentos de login (CU-02): 5 intentos fallidos consecutivos
  → SET users.locked_until = NOW() + 15 min. En cada intento de login,
  verificar locked_until > NOW() antes de verificar la contraseña. Si está
  bloqueado: retornar 429 con el mensaje "Cuenta bloqueada temporalmente.
  Intenta de nuevo en [minutos] minutos." Calcular los minutos restantes.

— El token de Blob se accede siempre con getBlobToken() como función lazy.
  La auditoría usa get() del SDK de Blob, nunca fetch(url).

— El admin del seed tiene is_active = true directamente — no pasa por el
  flujo de verificación de correo. Los administradores no se crean por el
  formulario público de registro.

— La identidad visual del login sigue el plan sección 18: fondo blanco,
  tarjeta con borde azul institucional en la parte superior, logo SVG de
  documento con estrella, tipografía Inter. El registro muestra un texto
  informativo con el dominio permitido para que el estudiante sepa qué
  correo usar antes de intentar registrarse.

Al terminar:
- npm run typecheck — cero errores
- Probar registro con correo del dominio correcto → recibir correo de
  verificación en Resend → hacer clic → cuenta activa → login exitoso
- Probar registro con correo de Gmail → debe retornar 400
- Probar login sin verificar cuenta → debe retornar 401 con mensaje claro
- Probar 5 intentos de login fallidos → 6to intento debe retornar 429
- Probar recuperación de contraseña: solicitar → recibir correo → usar link
  → nueva contraseña → login con nueva contraseña
- Probar link de recuperación expirado (cambiar expires_at en DB a pasado)
  → debe retornar 400 con "El link ha expirado"
- Registra el cierre en ESTADO_EJECUCION_EVALDOC.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. EvalDoc tiene páginas que no requieren autenticación
(el ranking público, los perfiles de profesores, la página de inicio) y páginas
que sí la requieren. El layout debe manejar esta distinción con claridad.

Tu mentalidad: la página de inicio de EvalDoc es pública. Cuando un estudiante
llega a la plataforma por primera vez sin estar logueado, debe ver el ranking
actual y entender para qué sirve el sistema. No debe ver una pantalla de login
en blanco. La confianza en el sistema se construye desde el primer vistazo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — paleta de colores (sección 18 — azul institucional
   como primario), los componentes PeriodBanner, ProgressTracker, ProfessorCard,
   SeedModeBanner, la Fase 2 del plan
2. doc/ESTADO_EJECUCION_EVALDOC.md — verifica Fase 1 completada, registra
   inicio de Fase 2

Puntos críticos que no puedes ignorar:

— app/page.tsx es pública y no redirige al login. Muestra: el nombre de la
  institución (desde system_config), el período activo si lo hay, y el ranking
  público de profesores (cuando hay datos). Si no hay período activo: mensaje
  "No hay un período de evaluación activo en este momento." Si no hay
  evaluaciones suficientes: "Aún no hay resultados publicados — participa
  en la evaluación cuando el período esté activo."

— El AppLayout tiene dos variantes: con sidebar (estudiante autenticado y
  admin) y sin sidebar (visitante no autenticado, que solo ve la barra de
  navegación superior con los botones de Login y Registrarse).

— El sidebar del estudiante: Inicio, Evaluar Profesores, Ranking, Perfil.
  El sidebar del admin: Inicio, Profesores, Períodos, Reportes, Comentarios,
  Configuración, Usuarios, Auditoría, Administración del Sistema.

— El middleware.ts debe ser cuidadoso con las rutas públicas. NO proteger:
  /, /login, /register, /verify, /forgot-password, /reset-password, /ranking,
  /professors/[id]. SÍ proteger: /dashboard, /evaluate/*, /profile, /admin/*.

— La página /admin/db-setup también verifica la conexión con Resend. Mostrar
  estado ✅ "Resend operativo" o ❌ "Error: [mensaje]" según si la API key
  es válida.

— El PeriodBanner muestra el período activo con su nombre y fecha de cierre.
  Color azul claro (#DBEAFE, borde #2563EB). Si no hay período activo, no
  mostrar el banner (simplemente no renderizar el componente).

Al terminar:
- Probar que / es accesible sin login y muestra la landing correctamente
- Probar que /ranking es accesible sin login
- Probar que /dashboard redirige a /login si no hay sesión
- Probar que /admin/users redirige a /dashboard si el usuario es estudiante
- Bootstrap completo: admin → db-setup → ejecutar → modo live
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Gestión de Profesores

### Rol: `Ingeniero Backend Senior — Catálogo de profesores e integridad del historial`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Backend Senior especializado en gestión
de catálogos de entidades con integridad referencial histórica.

Tu mentalidad: los profesores son las entidades evaluadas. Cada evaluación
apunta a un professor_id. Si ese registro desapareciera, el historial perdería
integridad. La regla RN-08 protege eso: no eliminación física si hay evaluaciones.
El catálogo debe ser robusto, consultable sin autenticación y gestionable
desde el admin de forma intuitiva.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — migration 0002 (professors), regla RN-08,
   los tipos Professor y sus campos, los endpoints de gestión y la Fase 3
2. doc/ESTADO_EJECUCION_EVALDOC.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— GET /api/professors es público — cualquier visitante (incluso sin login)
  puede ver la lista de profesores activos. Es lo que se muestra en el
  dashboard del estudiante y en el ranking. No requiere withAuth.

— deactivateProfessor verifica antes de proceder: SELECT COUNT(*) FROM
  evaluations WHERE professor_id = ?. Si el resultado es > 0: NO eliminar
  físicamente. Hacer soft delete (is_active = false). Si es 0: puede
  eliminarse físicamente si el admin lo solicita explícitamente. En ambos
  casos, retornar la acción tomada en la respuesta para que el frontend
  muestre el mensaje correcto.

— En el panel del admin /admin/professors, los profesores inactivos aparecen
  con badge "Inactivo" en rojo y opacidad reducida. El admin puede
  reactivarlos. Los profesores inactivos NO aparecen en el listado del
  estudiante ni en el ranking.

— El formulario de crear/editar profesor tiene: nombre (obligatorio, max 150),
  materia (obligatorio, max 150) y departamento (opcional, max 150).
  Simple pero completo.

Al terminar:
- Crear 3 profesores → verificar que aparecen en la lista pública
- Desactivar uno → verificar que desaparece del listado público pero
  sigue en el panel del admin
- Intentar eliminar un profesor con evaluaciones (agregar algunas
  directamente en Supabase) → debe hacer soft delete, no eliminar
- Reactivar el profesor desactivado → verificar que vuelve al listado
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_PROFESORES.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Gestión de Períodos y Notificación Masiva

### Rol: `Ingeniero Fullstack Senior — Períodos académicos y correo masivo`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en gestión
de períodos temporales, activación automática por fechas y envío de correo
masivo con restricciones de plan gratuito.

Tu mentalidad: el período académico es la ventana de tiempo en que los
estudiantes pueden evaluar. Su activación no depende de un botón ni de un
cron — depende de las fechas. Esa decisión de diseño es importante: si el
sistema cayó durante la noche y el período "debería" haberse activado a las
00:00, cuando vuelve a estar disponible detecta automáticamente el estado
correcto sin necesidad de intervención. Las fechas son la fuente de verdad.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — migration 0003 (periods), regla RN-11 (no
   solapamiento), la lógica de getActivePeriod() (query por fechas no por
   status), el endpoint de notificación masiva y la Fase 4 completa
2. doc/ESTADO_EJECUCION_EVALDOC.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— getActivePeriod() usa esta query exacta:
  SELECT * FROM periods
  WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
  ORDER BY start_date DESC LIMIT 1
  No usa el campo status para determinar si hay período activo. Si un período
  está en esas fechas, está activo — punto. El campo status es informativo
  y puede actualizarse cuando el admin cierra el período manualmente.

— RN-11: al crear un período, verificar que no se solape con otro período
  cuyas fechas aún no han terminado. La query de verificación:
  SELECT COUNT(*) FROM periods
  WHERE end_date >= new_start_date AND start_date <= new_end_date
  Si el resultado > 0: retornar 409 con "Ya existe un período con fechas
  solapadas. Verifica las fechas del período anterior."

— POST /api/admin/periods/[id]/notify — el endpoint que envía el correo
  masivo de apertura de período a todos los estudiantes activos:
  (1) Obtener todos los users WHERE role='estudiante' AND is_active=true.
  (2) Para cada uno, llamar emailService.sendPeriodOpenNotification.
  (3) Resend tiene rate limits en el plan gratuito. Agregar un delay de
  100ms entre envíos para no superar el límite. El endpoint retorna
  { sent: N, failed: M } al admin.
  Nota: este endpoint puede tardar varios segundos si hay muchos estudiantes.
  Mostrar un spinner mientras procesa y un toast con el resultado al terminar.

— El formulario de crear período tiene: nombre del período (ej: "Semestre
  2026-1"), fecha de inicio y fecha de cierre. Validar que inicio < fin.
  Los date pickers deben estar en la zona horaria local — el servidor guarda
  en DATE (sin hora), así que no hay problema de conversión UTC.

— La lógica de cierre manual (PUT period.status = 'cerrado'): el admin puede
  cerrar un período antes de su fecha de fin si es necesario. Cuando un período
  está cerrado manualmente, getActivePeriod no lo retorna aunque sus fechas
  sigan siendo válidas. Para implementar esto: agregar un campo is_manually_closed
  booleano a la tabla y agregarlo a la condición de getActivePeriod:
  AND (is_manually_closed IS NULL OR is_manually_closed = false).

Al terminar:
- Crear un período con fechas actuales → verificar que getActivePeriod lo
  retorna y que el PeriodBanner lo muestra en el dashboard
- Intentar crear otro período con fechas solapadas → debe retornar 409
- Cerrar el período manualmente → verificar que getActivePeriod retorna null
- Probar la notificación masiva: crear 2-3 usuarios estudiantes → enviar
  notificación → verificar que llegan los correos en Resend
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_PERIODOS.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Evaluaciones Anónimas y Sistema de Anonimización

### Rol: `Ingeniero Fullstack Senior — Módulo más crítico: anonimato por diseño`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en diseño
de sistemas con privacidad por arquitectura, criptografía aplicada básica y
mecanismos de control de unicidad sin identificación de usuarios.

Tu mentalidad: la promesa central de EvalDoc es que ningún estudiante puede
ser identificado por su evaluación. Esa promesa no se cumple con interfaces
— se cumple con el esquema de la base de datos. La tabla evaluations no tiene
student_id. Eso no es un olvido ni una simplificación — es una decisión de
diseño deliberada e irreversible. Esta fase la implementa y la verifica.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — sección 13 completa (Anonimización técnica por
   diseño — los cuatro niveles explicados), migration 0004 con evaluations
   SIN student_id y evaluation_tokens CON token_hash, lib/anonymizationService.ts
   con las dos funciones, lib/evaluationService.ts, la operación submitEvaluation
   completa (sección 11.3), reglas RN-02, RN-03, RN-04, RN-05, RN-06, RN-09,
   los componentes EvaluationForm, DimensionRating y AnonConfirmModal, y la
   Fase 5 completa del plan
2. doc/ESTADO_EJECUCION_EVALDOC.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar en el orden correcto:

PRIMERO — La migration 0004 tiene tres objetos:
(1) La tabla evaluations SIN student_id. El comentario "-- ¡ATENCIÓN! Esta
tabla NO tiene student_id" debe estar en el SQL como recordatorio permanente.
(2) La tabla evaluation_tokens con SOLO token_hash, professor_id y period_id.
Sin user_id ni student_id.
(3) La VIEW professor_period_stats que agrupa evaluaciones por professor_id
y period_id y calcula los promedios de las 5 dimensiones y el conteo total.
Aplicar la migration y verificar que la VIEW se creó correctamente con
SELECT * FROM professor_period_stats.

SEGUNDO — lib/anonymizationService.ts:
computeEvaluationToken usa el módulo nativo 'crypto' de Node (no npm):
import { createHash } from 'crypto';
El hash concatena con ':' como separador para evitar colisiones edge case:
SHA256("uuid1:uuid2:uuid3") en lugar de SHA256("uuid1uuid2uuid3").

verifyNotDuplicate hace:
const token = computeEvaluationToken(studentId, professorId, periodId);
const { count } = await supabase.from('evaluation_tokens')
  .select('*', { count: 'exact', head: true })
  .eq('token_hash', token);
Retorna true si NOT duplicate (puede evaluar), false si ya existe.

TERCERO — submitEvaluation en el dataService (secuencia exacta del plan):
Paso 1: Verificar que existe un período activo cuyo id coincide con el
period_id enviado. Si no: 403 "Período no activo".
Paso 2: Verificar que professor_id existe y está activo.
Paso 3: Verificar duplicado con verifyNotDuplicate. Si es duplicado: 409.
Paso 4: Calcular avg_general = (5 scores sumados) / 5.
Paso 5: INSERT INTO evaluations (professor_id, period_id, los 5 scores,
avg_general, comment). SIN student_id en ningún campo.
Paso 6: INSERT INTO evaluation_tokens (token_hash, professor_id, period_id).
Paso 7: NO registrar auditoría con user_id del estudiante. Solo registrar
un evento anónimo genérico o no registrar auditoría para esta operación.

CUARTO — getStudentProgress para el dashboard (RF-15):
Para cada profesor activo del período activo: computar el hash y verificar
si existe en evaluation_tokens. Retornar un array con { professor, evaluated: bool }.
Esta operación hace N queries (una por profesor). Para listas de hasta 50
profesores es aceptable. Usar Promise.all() para paralelizarlas.

QUINTO — getPublicRanking:
Consultar la VIEW professor_period_stats con JOIN a professors, filtrando
por period_id y total_evaluations >= system_config.min_evaluations_to_publish
(default 3). Ordenar por avg_overall DESC. No incluir comments en este endpoint.

SEXTO — EvaluationForm en el cliente:
DimensionRating muestra 5 botones numerados (1-2-3-4-5) por dimensión.
El botón seleccionado tiene bg azul primario (#2563EB), texto blanco.
Los no seleccionados tienen borde gris. Si se intenta enviar sin seleccionar
todos los puntajes: resaltar las dimensiones vacías con borde rojo y bloquear
el envío (RN-04).

AnonConfirmModal antes del envío final: "Tu evaluación es completamente
anónima. Una vez enviada, no puede modificarse ni eliminarse. ¿Confirmar?"
Con dos botones: "Sí, enviar" (azul) y "Cancelar" (gris).

Al terminar — estas verificaciones son obligatorias:

Verificación de anonimato real (la más importante de todo el proyecto):
(1) Completar el flujo de evaluación con un usuario estudiante.
(2) Ir a Supabase Table Editor → tabla evaluations.
(3) Verificar que la fila creada NO tiene columna student_id.
(4) Ir a tabla evaluation_tokens.
(5) Verificar que solo tiene token_hash, professor_id, period_id y created_at.
(6) Intentar escribir una query SQL que vincule evaluations con users → debe
    ser imposible porque no hay columna ni FK en común.
Si cualquiera de estas verificaciones falla, el anonimato está comprometido
y la Fase 5 no puede darse por completada.

Verificación de RN-02 (duplicados):
Enviar la misma evaluación dos veces → la segunda debe retornar 409.

Verificación de RN-06 (mínimo 3 evaluaciones):
Crear 2 evaluaciones para un profesor → verificar que NO aparece en el ranking.
Crear la tercera → verificar que ahora SÍ aparece con sus promedios.

Verificación de RN-03 (período activo):
Intentar enviar una evaluación con period_id de un período cerrado →
debe retornar 403.

- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_EVALUACIONES.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Reportes, Moderación y Configuración

### Rol: `Ingeniero Fullstack Senior + Diseñador Frontend — Panel administrativo completo`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior y Diseñador Frontend
trabajando en conjunto. El panel del admin es donde la institución extrae
valor de las evaluaciones. Los reportes deben ser útiles, filtrables y
nunca revelar la identidad de los evaluadores.

Tu mentalidad: el admin ve números, promedios y comentarios anónimos —
nunca nombres de estudiantes vinculados a evaluaciones. La moderación de
comentarios es una herramienta de cuidado comunitario, no de control:
el admin puede hacer invisible un comentario ofensivo, pero no puede
rastrear quién lo escribió ni alterarlo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — la restricción del admin (sección 4 — nunca
   accede a identidad de evaluadores), getAdminReport sin student_id,
   getComments con moderación, deleteComment como soft delete
   (comment_is_visible = false), updateSystemConfig y la Fase 6
2. doc/ESTADO_EJECUCION_EVALDOC.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Puntos críticos que no puedes ignorar:

— getAdminReport nunca retorna student_id ni ningún dato identificable
  del evaluador. Los campos que puede retornar son:
  evaluation_id, professor_id, professor_name, period_id, period_name,
  score_clarity, score_methodology, score_punctuality, score_treatment,
  score_knowledge, avg_general, created_at (fecha sin hora — suficiente
  granularidad para reportes sin ser rastreable en grupos grandes).
  Nunca: student_id, student_email, student_name, token_hash.
  Verificar que el endpoint no expone estos campos inadvertidamente.

— Los comentarios en /admin/comments se muestran agrupados por profesor y
  período. Cada comentario tiene un botón "Moderar" que abre un modal de
  confirmación: "¿Marcar este comentario como inapropiado? Dejará de ser
  visible en el ranking público, pero quedará registrado en el sistema."
  Al confirmar: UPDATE evaluations SET comment_is_visible = false.
  El comentario sigue apareciendo en /admin/comments con badge "Moderado"
  — el admin mantiene visibilidad pero el público no lo ve.

— En el ranking público y en los perfiles de profesores, los comentarios
  con comment_is_visible = false NO se muestran. Los reportes del admin
  SÍ los incluyen (con el badge "Moderado").

— /admin/config muestra y permite editar: institution_name, allowed_domain,
  min_evaluations_to_publish. Al cambiar allowed_domain: mostrar un modal
  de advertencia "Este cambio no afecta a los estudiantes ya registrados.
  Solo aplica para nuevos registros. ¿Confirmar?"

— /admin/users muestra los estudiantes registrados (no los admins) con:
  nombre, email, estado (Activo/Pendiente verificación/Bloqueado), fecha
  de registro, último login. Acciones: activar/desactivar. Un usuario
  desactivado no puede iniciar sesión aunque tenga cuenta verificada.

Al terminar:
- Crear evaluaciones con comentarios → verificar que aparecen en /admin/comments
- Moderar un comentario → verificar que desaparece del ranking público pero
  sigue en /admin/comments con badge "Moderado"
- Verificar que /admin/reports no expone student_id en ninguno de sus campos
  (revisar la respuesta del API directamente)
- Cambiar el dominio institucional en /admin/config → verificar que el
  nuevo registro rechaza correos del dominio anterior y acepta los del nuevo
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_6_ADMIN.md

Tu trabajo termina aquí. No avances a la Fase 7.
```

---

---

## PROMPT FASE 7 — Pulido final y Deploy

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de EvalDoc.

Tu mentalidad: EvalDoc tiene una promesa central — el anonimato técnico —
y una promesa secundaria — que participar tiene un efecto visible en el
ranking. Si el ranking no se actualiza cuando el estudiante evalúa, si los
promedios no aparecen después de la tercera evaluación, o si el estudiante
no puede confiar en que su identidad está protegida, el sistema falla en
su razón de existir. Esta fase verifica que todo funciona, que la UI es
coherente y que el anonimato está garantizado en producción.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EVALDOC.md — Fase 7 completa, los requerimientos no funcionales
   (RNF-01 al RNF-08) y las restricciones del sistema (sección 21)
2. doc/ESTADO_EJECUCION_EVALDOC.md — verifica Fases 1 a 6 completadas,
   registra inicio de Fase 7

Lo que debes completar en esta fase:

Empty states con mensajes apropiados para cada contexto:
- Página de inicio sin período activo: "No hay un período de evaluación
  activo en este momento." Con subtexto: "Cuando la institución abra un
  nuevo período, podrás evaluar a tus profesores aquí."
- Dashboard del estudiante sin profesores activos: "No hay profesores
  disponibles para evaluar en este momento."
- Dashboard del estudiante con todos los profesores ya evaluados: "¡Has
  evaluado a todos los profesores del período actual! Gracias por participar."
  Con botón para ver el ranking.
- Ranking sin evaluaciones suficientes: "Aún no hay resultados publicados
  para este período. Los resultados se publican cuando un profesor acumula
  al menos [min_evaluations_to_publish] evaluaciones."
- Reportes del admin sin datos para los filtros: "No hay evaluaciones para
  los filtros seleccionados."

Manejo de errores global:
- 401 (sesión expirada): toast "Tu sesión expiró" + redirect a /login.
- 401 (cuenta no verificada): mensaje especial en el login: "Tu cuenta
  aún no está verificada. Revisa tu correo institucional." Con link
  "Reenviar correo de verificación."
- 403 (período no activo para evaluación): mensaje prominente en la
  pantalla de evaluación, no un toast: "El período de evaluación está
  cerrado. No es posible enviar evaluaciones en este momento."
- 409 (ya evaluado): "Ya enviaste tu evaluación para este profesor en el
  período actual. Solo puedes evaluar una vez por período."
- 400 (dominio incorrecto en registro): "Solo se aceptan correos del
  dominio institucional. Si tu institución usa [allowed_domain], usa
  ese correo para registrarte."
- 500: toast genérico.

Reenvío de correo de verificación:
Implementar endpoint POST /api/auth/resend-verification que genera un nuevo
token de activación y envía el correo. Verificar que el usuario existe y
que is_active = false antes de proceder.

Verificación del anonimato en producción (test final):
(1) Registrar 3 estudiantes de prueba con correos del dominio configurado.
(2) Evaluar el mismo profesor desde las 3 cuentas (con valores distintos).
(3) Ir a Supabase → Table Editor → tabla evaluations.
(4) Confirmar: ninguna fila tiene student_id.
(5) Ir a tabla evaluation_tokens.
(6) Confirmar: solo hay token_hash. No hay forma de saber qué estudiante
    hizo cada evaluación.
(7) Verificar que el profesor ahora aparece en el ranking (>= 3 evaluaciones)
    con los promedios correctos.

Verificar que todas las rutas públicas funcionan sin autenticación:
Abrir una ventana de incógnito → navegar a /ranking → verificar que carga.
Navegar a /professors/[id] → verificar que carga. Verificar que /dashboard
redirige a /login.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Verificar que ningún componente cliente importa variables privadas ni
  módulos de lib/ directamente
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL

Probar en producción el flujo completo:
Admin: bootstrap → configurar dominio → crear profesores → crear período
→ enviar notificación a estudiantes.
Estudiante: recibir correo → registrarse → verificar cuenta → login →
ver listado → evaluar 3 profesores → ver ranking actualizado.
Admin: ver reporte → moderar un comentario → verificar que desaparece del
ranking público.

Al cerrar el proyecto:
- Registra la Fase 7 como Completada en ESTADO_EJECUCION_EVALDOC.md con
  la URL de producción en el historial
- Crea doc/RESUMEN_FASE_7_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack (incluyendo Resend),
  tablas de Supabase creadas, decisiones técnicas destacadas (anonimato
  por diseño con hash SHA256, verification flow, período activo por fechas,
  RN-06 con VIEW de Supabase) y estado final del proyecto

El proyecto EvalDoc está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Shayla Bueno — Doc: 1082919469
> Curso: Lógica y Programación — SIST0200
