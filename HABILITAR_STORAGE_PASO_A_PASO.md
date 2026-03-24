# 🎯 Habilitar Storage en Plan Spark - Paso a Paso

## ✅ Lo que tienes ahora:

Estás en el **Plan Spark** (gratuito), que incluye:
- ✅ Storage con 5 GB gratis
- ✅ 1 GB de descarga por día gratis
- ✅ Sin costos mientras uses el plan Spark

## 🔧 Lo que necesitas hacer:

Aunque Storage está incluido en tu plan, necesitas **habilitarlo manualmente** la primera vez.

### Paso 1: Ve a Storage

1. En Firebase Console, en el menú lateral izquierdo
2. Busca y haz clic en **"Storage"** o **"Almacenamiento"**
3. Si ves el mensaje: *"Para usar Storage, actualiza el plan de facturación"*

### Paso 2: Habilitar Storage (Primera vez)

**Opción A: Si ves el botón "Empezar" o "Get Started"**
1. Haz clic en **"Empezar"** o **"Get Started"**
2. Selecciona **"Modo de producción"**
3. Elige la ubicación del bucket (ej: `europe-west1` o la misma que tu proyecto)
4. Haz clic en **"Listo"**
5. ✅ ¡Listo! Storage está habilitado

**Opción B: Si te pide actualizar facturación**
1. Haz clic en el mensaje o ve a **Configuración** → **Uso y facturación**
2. Verás que ya estás en **Plan Spark**
3. Firebase puede pedirte añadir un método de pago para verificación
4. **IMPORTANTE**: 
   - No se te cobrará nada
   - Es solo para verificación de identidad
   - Puedes usar tarjeta de débito o crédito
5. Después de añadir el método de pago, vuelve a Storage
6. Haz clic en **"Empezar"** o **"Get Started"**
7. Configura Storage como en la Opción A

### Paso 3: Verificar que Storage está habilitado

Deberías ver:
- ✅ Tu bucket: `todo-hogar-factory.appspot.com`
- ✅ Pestañas: **Files**, **Rules**, **Usage**
- ✅ Un mensaje que dice que Storage está activo

### Paso 4: Configurar las Reglas

1. En Storage, haz clic en la pestaña **"Rules"**
2. Copia y pega estas reglas:

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

3. Haz clic en **"Publicar"**
4. Espera 1-2 minutos

### Paso 5: Probar

1. Vuelve a tu aplicación
2. Intenta subir una imagen
3. ✅ Debería funcionar ahora

## 🛡️ Garantías del Plan Spark:

- ✅ **NO se te cobrará nada** mientras uses el plan Spark
- ✅ Tienes **5 GB de almacenamiento gratis**
- ✅ Tienes **1 GB de descarga por día gratis**
- ✅ Si intentas usar más, simplemente no funcionará (no se cobra)
- ✅ Puedes desactivar servicios en cualquier momento

## ❓ Preguntas frecuentes:

### ¿Por qué pide método de pago si es gratis?

Firebase requiere método de pago para verificación de identidad y para prevenir abusos. Con el plan Spark, **NO se usa para cobros**.

### ¿Puedo quitar el método de pago después?

Sí, pero Storage dejará de funcionar. El método de pago es necesario para mantener Storage activo, aunque no se use para cobros.

### ¿Qué pasa si uso más de 5 GB?

Con el plan Spark, simplemente no podrás subir más archivos. No se te cobrará nada.

### ¿Se me cobrará automáticamente?

**NO**. El plan Spark tiene límites fijos. Solo se cobraría si cambias manualmente al plan Blaze Y usas más de los límites gratuitos.

## 📊 Verificar tu uso:

1. En Firebase Console → Storage → **Usage**
2. Ahí verás cuánto espacio estás usando
3. Con el plan Spark tienes 5 GB gratis

---

**Resumen**: Estás en el plan correcto. Solo necesitas habilitar Storage (una vez) y configurar las reglas. Todo sigue siendo gratis. 🎉

