# Cuentas: activar Supabase

Estado al 2026-10-24: proyecto `btlazjgmtwmikgeqniqw` creado por Marcos, quien
reporta registro correcto desde la web desplegada. El agente comprobó Auth
habilitado con confirmación y rechazo de lecturas anónimas (401/42501).
Aún no verificó las migraciones, políticas con sesiones autenticadas, entrega
de correos ni sincronización entre dispositivos. No se han contratado servicios
durante este trabajo; el plan de Cloudflare no se ha inspeccionado.

URL publicada: https://idiomas-plataforma-de-aprendizaje.marcos-gaitan.workers.dev/
Las instrucciones de creación siguientes sirven para instalaciones nuevas.

## 1. Crear el proyecto

Abre https://supabase.com/dashboard y crea un proyecto en una organización del
plan Free. Nombre sugerido: `idiomas`. Guarda la contraseña de base de datos en
tu gestor de contraseñas: la web no la necesita. Elige una región cercana a tus
primeros usuarios y espera a que termine la creación.

En la configuración de API / diálogo Connect, copia la URL del proyecto y su
clave pública **anon** o **publishable**. Nunca uses `service_role`, una clave
secret ni la contraseña de Postgres en Vite.

Copia `.env.example` a `.env.local` y completa:

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU-CLAVE-PUBLICA
```

El nombre de la variable admite también la clave publishable. `.env.local` está
excluido de Git. Reinicia `npm run dev` después de cambiarlo. Para Cloudflare,
añade estas dos variables al proyecto Pages y reconstruye la aplicación.

## 2. Crear las tablas y las reglas

En SQL Editor ejecuta, **en este orden**, el contenido de:

1. `supabase/migrations/202610220001_progress.sql` (solo una vez; crea las políticas).
2. `supabase/migrations/202610240001_progress_revision.sql`.

La segunda migración es obligatoria para esta versión: agrega `revision`,
revoca escrituras directas y habilita `save_learning_progress`. La función toma
el propietario exclusivamente de `auth.uid()`; el cliente no elige otro usuario.
Las lecturas siguen protegidas por RLS. Un conflicto de revisión devuelve NULL,
sin sustituir datos. XP continúa siendo motivacional y no una puntuación antifraude.

## 3. Correo y direcciones de retorno

Activa Email/password y **Confirm email** en Authentication. En URL Configuration:

- Site URL de desarrollo: `http://localhost:5173/` (ajusta el puerto si Vite usa otro).
- Redirect URLs: `http://localhost:5173/?auth=confirm` y `http://localhost:5173/?auth=recovery`.
- Al publicar, Site URL será el dominio HTTPS y se añadirán las dos variantes
  `https://TU-DOMINIO/?auth=confirm` y `https://TU-DOMINIO/?auth=recovery`.

Conserva las plantillas estándar con `{{ .ConfirmationURL }}`. El código usa PKCE:
los enlaces de confirmación y recuperación deben abrirse en el mismo navegador
que los solicitó. El callback se procesa antes del router, elimina código/errores
de la URL y muestra la cuenta o el formulario de contraseña. No uses un hash
`#/...` como callback del proveedor.

**Correo para pruebas frente a lanzamiento:** el SMTP incluido solo envía a
miembros del equipo del proyecto y tiene un límite de 2 correos por hora según
la documentación consultada. Para probar al principio, usa el correo de tu cuenta
Supabase. Para abrir el registro al público hay que configurar un SMTP propio;
no hemos contratado ni configurado uno. No desactives la confirmación como solución.

Fuentes oficiales consultadas el 2026-10-24:
[SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[límites](https://supabase.com/docs/guides/auth/rate-limits),
[PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow),
[recuperación](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail).

## 4. Qué guarda la aplicación

- Invitado: `idiomas:guest`, sin transferencia automática a una cuenta.
- Cuenta: `idiomas:account:<id>`, con progreso, revisión y marca de cambios pendientes.
- El registro antiguo `idiomas:<id>` se recupera conservadoramente como pendiente;
  si existe otra versión remota, se pide elegir.
- Los cambios se guardan localmente antes de intentar sincronizar. Sobreviven a
  cierre de sesión y recarga si el navegador permite almacenamiento.
- Reconexión, vuelta a la pestaña y Ajustes → Reintentar sincronización vuelven a
  intentarlo. Las peticiones se serializan; otra revisión no se sobrescribe.
- Si dos dispositivos divergen, Ajustes ofrece conservar la cuenta o el dispositivo.
  **No es una fusión automática**: la versión elegida reemplaza la otra. Antes se
  guarda una copia de ambas en `idiomas:account:<id>:backup`; también se puede
  descargar el JSON del progreso local desde Ajustes.
- Una sola pestaña por cuenta puede editar el progreso local. Las demás esperan
  hasta que se cierre la primera, usando Web Locks. Se requiere HTTPS o localhost
  y un navegador actualizado. El formulario de cuenta sigue accesible mientras espera.
- El modo `?capture=1` nunca inicializa Supabase ni persiste su demostración.

La caché local permanece al cerrar sesión; no es un almacén cifrado. En un equipo
compartido conviene usar un perfil privado y cerrar sesión al terminar. La sesión
se cierra solo en este dispositivo; los demás continúan conectados.

## 5. Comprobación real pendiente

Con correos autorizados por tu SMTP y dos sesiones independientes:

1. Registrar A; confirmar su correo; entrar; comprobar error de contraseña incorrecta.
2. Recuperar contraseña, guardar una nueva, salir y entrar con ella. Probar también
   enlace vencido y reenvío de confirmación sin exponer información de cuentas ajenas.
3. Completar una lección, cambiar meta y comprobar que otro dispositivo recibe
   progreso/XP/racha. Repetir la lección no debe volver a premiarla.
4. Desconectar la red, cambiar progreso, cerrar/abrir sesión y reconectar: el pendiente
   debe conservarse y sincronizarse o pedir resolver una divergencia.
5. Crear cambios diferentes en dos dispositivos; comprobar ambas elecciones y backup.
6. Abrir dos pestañas del mismo navegador; la segunda espera, y continúa al cerrar
   la primera sin borrar sus pendientes.
7. Entrar como B; no debe recibir datos de A ni del invitado. Con el JWT de B,
   pedir explícitamente la fila de A por REST debe devolver cero filas. Intentar
   INSERT/UPDATE/DELETE directo debe ser rechazado; la RPC solo modifica B.
8. Sin sesión, las lecturas/escrituras deben estar rechazadas. Sin sesión, ejecutar
   la RPC también debe fallar. Revisar políticas en la tabla antes de habilitar público.

Solo después de estas comprobaciones se marcará la integración como operativa.
Las pruebas locales con respuestas simuladas no sustituyen la validación de RLS,
configuración de correo ni ejecución de las migraciones reales.
