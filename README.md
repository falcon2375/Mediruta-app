# MediRuta — App móvil instalable (PWA) con base de datos en tiempo real

Esta carpeta es una **Progressive Web App** conectada a **Firebase Firestore**:
una base de datos gratuita en la nube. Esto significa que cuando el paciente
crea un pedido desde su celular, la EPS lo ve en su panel (en otro celular o
computador) y cuando la EPS autoriza, el paciente ve el cambio al instante,
sin recargar la página. Los pedidos ya no se pierden ni dependen de un solo
dispositivo.

## Paso 1 — Crear el proyecto de Firebase (gratis, 5 minutos)

1. Entra a https://console.firebase.google.com y entra con una cuenta de Google
2. Clic en "Crear proyecto" → ponle nombre, por ejemplo `mediruta`
3. Cuando termine, en el menú lateral entra a **Firestore Database** → "Crear
   base de datos" → elige **modo de prueba** (test mode) → elige la región
   más cercana (ej. `southamerica-east1`)
4. En el menú lateral, en el ícono de engranaje → **Configuración del
   proyecto** → baja hasta "Tus apps" → clic en el ícono `</>` (Web) →
   regístrala con cualquier nombre (no marques Hosting)
5. Firebase te muestra un bloque `firebaseConfig = { ... }` — cópialo

## Paso 2 — Pegar la configuración en la app

Abre `index.html`, busca cerca de la línea 15 este bloque:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "TU_APP_ID"
};
```

Reemplázalo completo por el que copiaste de Firebase. Guarda el archivo.

## Paso 3 — Reglas de seguridad (importante)

Por defecto el "modo de prueba" deja la base de datos abierta por 30 días y
luego se bloquea sola. Para esta demo está bien, pero antes de usarla con
datos reales de pacientes debes restringirla. En Firestore → pestaña
**Reglas**, como mínimo usa esto para que solo se puedan crear y actualizar
pedidos (no borrarlos ni leer otras colecciones):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pedidos/{pedidoId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}
```

⚠️ Esto sigue siendo abierto (cualquiera con la URL puede leer y escribir
pedidos). Para producción real con datos de salud necesitas además
**autenticación** (Firebase Auth) para que cada rol solo pueda hacer lo que
le corresponde — eso es un paso aparte que podemos construir cuando quieras.

## Paso 4 — Publicar para que el botón "Instalar" funcione

Los navegadores solo permiten instalar una PWA desde un dominio real con
HTTPS. Tres opciones rápidas:

### Opción 1 — Netlify (la más fácil, sin cuenta de programador)
1. Entra a https://app.netlify.com/drop
2. Arrastra esta carpeta completa (ya con tu `firebaseConfig` pegado)
3. Netlify te da una URL tipo `https://algo-aleatorio.netlify.app`
4. Ábrela desde el celular → aparece el banner "Instalar MediRuta"

### Opción 2 — GitHub Pages
1. Crea un repositorio nuevo en GitHub y sube estos archivos
2. Settings → Pages → selecciona la rama `main` como fuente

### Opción 3 — Vercel
1. Entra a https://vercel.com, arrastra la carpeta o conecta tu GitHub
2. Te da una URL `https://tu-proyecto.vercel.app`

## Cómo se instala en el celular una vez publicada

**Android (Chrome):** aparece automáticamente el banner "Instalar MediRuta".

**iPhone (Safari):** Apple no permite el banner automático, por eso la app
indica: toca el ícono compartir (□↑) → "Agregar a pantalla de inicio".

## Archivos de este proyecto

| Archivo | Función |
|---|---|
| `index.html` | La app completa (Paciente / Farmacia / EPS) |
| `manifest.json` | Le dice al navegador el nombre, color e íconos de la app |
| `service-worker.js` | Permite que abra incluso sin conexión |
| `icon-192.png`, `icon-512.png` | Ícono de la app |
| `icon-512-maskable.png` | Versión del ícono para Android (se adapta a la forma del sistema) |

## Siguiente paso natural

Ya los pedidos persisten y se sincronizan entre EPS, farmacia y paciente en
tiempo real. Para llevarla a producción real lo siguiente sería:
- **Autenticación** (Firebase Auth): que cada paciente solo vea su propio
  pedido, y que solo usuarios de la EPS/farmacia puedan autorizar/despachar
- Validar la fórmula médica antes de aceptar la solicitud
- Notificaciones push reales cuando cambia el estado del pedido
- Separar esto en dos apps: una app de paciente (la que se instala) y un
  panel web de administración para farmacias/EPS (ellos no necesitan instalar
  nada, usan navegador de escritorio)
