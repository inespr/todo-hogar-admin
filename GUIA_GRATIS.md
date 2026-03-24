# 🆓 Guía: Cómo subir imágenes GRATIS con Firebase Spark

## ✅ Lo que tienes (GRATIS):

- **Firebase Storage**: 5 GB de almacenamiento gratuito
- **1 GB de descarga por día** (más que suficiente para mostrar imágenes)
- **20,000 operaciones de escritura por día** (subir imágenes)
- **50,000 operaciones de lectura por día** (ver imágenes)

## 📋 Cómo funciona:

1. **Tú (admin)** subes imágenes desde este proyecto admin
2. Las imágenes se guardan en **Firebase Storage** (gratis)
3. Se guardan las **URLs** en Firestore (base de datos)
4. **Los clientes** ven las imágenes directamente desde Firebase Storage

## 🚀 Pasos para que funcione:

### Paso 1: Configurar Firebase Storage (SOLO UNA VEZ)

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto **todo-hogar-factory**
3. Ve a **Storage** → **Rules**
4. Copia y pega estas reglas:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /electrodomesticos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. Haz clic en **Publicar**

### Paso 2: Hacer las imágenes públicas (para que los clientes las vean)

Las reglas actuales solo permiten lectura a usuarios autenticados. Para que los clientes vean las imágenes SIN iniciar sesión, cambia la regla de lectura:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /electrodomesticos/{allPaths=**} {
      // Permitir lectura pública (para que los clientes vean las imágenes)
      allow read: if true;
      
      // Solo usuarios autenticados pueden subir/eliminar
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**⚠️ Importante**: Con `allow read: if true;` las imágenes son públicas. Esto está bien para un catálogo de productos, pero asegúrate de que solo usuarios autenticados puedan subir imágenes (como está configurado).

### Paso 3: Subir imágenes

1. Inicia sesión en el admin
2. Ve a "Nuevo producto"
3. Selecciona imágenes
4. Guarda el producto
5. Las imágenes se suben automáticamente a Firebase Storage

### Paso 4: Ver las imágenes

- En el admin: Verás las imágenes en el dashboard
- En la página de clientes: Las imágenes se cargarán automáticamente desde Firebase Storage

## 💰 ¿Cuánto cuesta?

**NADA. Es completamente GRATIS** con el plan Spark mientras:
- No subas más de 5 GB de imágenes en total
- No superes 1 GB de descarga por día (muy difícil con solo mostrar imágenes)
- No subas más de 20,000 imágenes por día

Para un catálogo normal, esto es más que suficiente.

## 🔍 Verificar que funciona:

1. Sube una imagen desde el admin
2. Abre la consola del navegador (F12)
3. Ve a la pestaña "Network"
4. Busca una solicitud a `firebasestorage.googleapis.com`
5. Si ves la imagen cargándose, ¡funciona!

## ❓ Problemas comunes:

### Error de CORS:
- **Solución**: Configura las reglas de Storage (Paso 1)

### Las imágenes no se ven:
- **Solución**: Cambia `allow read: if request.auth != null;` a `allow read: if true;` (Paso 2)

### Error al subir:
- Verifica que estés autenticado
- Verifica que la imagen sea menor a 10MB
- Verifica que sea un archivo de imagen (jpg, png, etc.)

## 📊 Monitorear el uso:

1. Ve a Firebase Console → Storage → Usage
2. Ahí verás cuánto espacio estás usando
3. Con el plan Spark tienes 5 GB gratis

---

**Resumen**: Todo es GRATIS con Firebase Spark. Solo necesitas configurar las reglas una vez y listo. 🎉

