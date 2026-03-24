# 🔧 SOLUCIÓN INMEDIATA: Error de CORS

## ⚠️ El error que ves significa:

**Las reglas de Firebase Storage NO están configuradas correctamente.**

El error `CORS policy: Response to preflight request doesn't pass access control check` significa que Firebase está rechazando la solicitud porque no tiene las reglas de seguridad configuradas.

## ✅ SOLUCIÓN PASO A PASO (5 minutos):

### Paso 1: Abre Firebase Console
1. Ve a: https://console.firebase.google.com/
2. **Inicia sesión** con tu cuenta de Google
3. Selecciona el proyecto: **todo-hogar-factory**

### Paso 2: Habilitar Storage (IMPORTANTE - Primera vez)

**⚠️ Si ves el mensaje "Para usar Storage, actualiza el plan de facturación":**

Esto es NORMAL. Firebase requiere tener facturación habilitada, pero **NO te cobrará nada** mientras uses el plan Spark (gratuito).

#### Opción A: Habilitar facturación (Recomendado - Sin costos)
1. Haz clic en el mensaje o ve a **Configuración del proyecto** → **Uso y facturación**
2. Haz clic en **"Actualizar plan"** o **"Seleccionar plan"**
3. Selecciona el **Plan Spark** (el plan gratuito)
4. Añade una tarjeta de crédito (solo para verificación, NO se te cobrará nada)
5. Confirma que quieres el plan Spark
6. Vuelve a Storage y haz clic en **"Empezar"** o **"Get Started"**

#### Opción B: Si no quieres añadir tarjeta (Alternativa)
Si prefieres no añadir tarjeta, puedes usar Firebase Storage a través de Cloud Storage directamente, pero es más complicado. La opción A es la más fácil y sigue siendo completamente gratuita.

#### Después de habilitar:
1. En Storage, haz clic en **"Empezar"** o **"Get Started"**
2. Selecciona **"Modo de producción"**
3. Elige la ubicación (puede ser la misma que tu proyecto, ej: `europe-west1`)
4. Haz clic en **"Listo"**

### Paso 3: Configura las Reglas (MUY IMPORTANTE)
1. En la página de Storage, haz clic en la pestaña **"Rules"** (Reglas)
2. **BORRA TODO** lo que haya ahí
3. **COPIA Y PEGA** exactamente esto:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /electrodomesticos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }
  }
}
```

4. Haz clic en **"Publicar"** (Publish) - botón verde arriba
5. **ESPERA** 1-2 minutos para que se apliquen

### Paso 4: Verifica que funcionó
1. Vuelve a tu aplicación
2. **Recarga la página** (Ctrl+Shift+R o Cmd+Shift+R)
3. Intenta subir una imagen de nuevo

## 🔍 Cómo verificar que las reglas están bien:

1. En Firebase Console → Storage → Rules
2. Deberías ver el código que pegaste
3. Debe decir **"Published"** (Publicado) en verde
4. Si dice **"Draft"** (Borrador), haz clic en **"Publicar"**

## ❌ Si sigue sin funcionar:

### Verifica que estés autenticado:
1. En tu aplicación, asegúrate de estar **iniciado sesión**
2. Si no estás seguro, cierra sesión y vuelve a iniciar sesión

### Verifica el tamaño del archivo:
- Las imágenes deben ser **menores a 10MB**
- Si es más grande, comprímela antes de subirla

### Limpia la caché del navegador:
1. Presiona **Ctrl+Shift+Delete** (Windows) o **Cmd+Shift+Delete** (Mac)
2. Selecciona "Caché" o "Cache"
3. Haz clic en "Borrar datos"

### Verifica que Storage esté habilitado:
1. En Firebase Console → Storage
2. Debe mostrar tu bucket: `todo-hogar-factory.appspot.com`
3. Si no aparece, sigue el Paso 2 de arriba

## 📸 Captura de pantalla de referencia:

Cuando veas las reglas en Firebase Console, debería verse así:

```
Rules (Published)  ← Debe decir "Published"
┌─────────────────────────────────────┐
│ rules_version = '2';                │
│                                      │
│ service firebase.storage {          │
│   match /b/{bucket}/o {             │
│     match /electrodomesticos/...    │
│       allow read: if true;           │
│       allow write: if request...    │
│   }                                  │
│ }                                    │
└─────────────────────────────────────┘
```

## 🆘 Si NADA funciona:

1. **Verifica que el proyecto sea correcto**: Asegúrate de estar en `todo-hogar-factory`
2. **Verifica las variables de entorno**: Asegúrate de que `.env.local` tenga todas las variables correctas
3. **Revisa la consola del navegador**: Presiona F12 y ve a la pestaña "Console" para ver errores específicos

---

**IMPORTANTE**: Este error SOLO se soluciona configurando las reglas en Firebase Console. No hay forma de solucionarlo solo desde el código.

