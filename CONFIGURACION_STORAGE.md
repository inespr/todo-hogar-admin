# Configuración de Firebase Storage para Plan Spark

## Paso 1: Configurar las Reglas de Storage

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto **todo-hogar-factory**
3. En el menú lateral, ve a **Storage** (Almacenamiento)
4. Haz clic en la pestaña **Rules** (Reglas)
5. Reemplaza TODO el contenido con las siguientes reglas:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Reglas para la carpeta de electrodomésticos
    match /electrodomesticos/{allPaths=**} {
      // Permitir lectura a usuarios autenticados
      allow read: if request.auth != null;
      
      // Permitir escritura solo a usuarios autenticados
      // Limitar tamaño de archivo a 10MB (límite del plan Spark)
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      
      // Permitir eliminación solo a usuarios autenticados
      allow delete: if request.auth != null;
    }
    
    // Denegar acceso a todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

6. Haz clic en **Publicar** (Publish)

## Paso 2: Verificar que Storage esté habilitado

1. En la misma sección de Storage
2. Si es la primera vez, haz clic en **Empezar** (Get Started)
3. Selecciona **Modo de producción** (Production mode)
4. Elige la ubicación del bucket (puede ser la misma que tu proyecto)
5. Haz clic en **Listo**

## Paso 3: Verificar Autenticación

Asegúrate de que:
- ✅ Authentication esté habilitado en Firebase Console
- ✅ Tengas al menos un método de autenticación activado (Email/Password o Google)
- ✅ Estés iniciado sesión en la aplicación antes de subir imágenes

## Paso 4: Probar la subida de imágenes

1. Inicia sesión en tu aplicación
2. Ve a crear un nuevo producto
3. Selecciona una imagen
4. Intenta guardar el producto

## Solución de problemas

### Si sigues teniendo errores de CORS:

1. **Verifica que las reglas estén publicadas**: Las reglas deben estar en "Publicado" (Published), no en borrador
2. **Espera unos minutos**: A veces las reglas tardan unos minutos en aplicarse
3. **Limpia la caché del navegador**: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
4. **Verifica que estés autenticado**: Abre la consola del navegador (F12) y verifica que no haya errores de autenticación

### Límites del Plan Spark:

- ✅ 5 GB de almacenamiento gratuito
- ✅ 1 GB de descarga por día
- ✅ 20,000 operaciones de escritura por día
- ✅ 50,000 operaciones de lectura por día
- ⚠️ Tamaño máximo de archivo: 5 GB (pero limitamos a 10MB en las reglas)

## Nota importante

El plan Spark es completamente funcional para este proyecto. El error de CORS que estás experimentando es un problema de configuración de reglas, no una limitación del plan.

