# ☁️ Configurar Cloudinary - Guía Completa

## ✅ Ventajas de Cloudinary:

- ✅ **25 GB de almacenamiento gratis**
- ✅ **25 GB de ancho de banda por mes gratis**
- ✅ **NO requiere método de pago**
- ✅ Transformación automática de imágenes
- ✅ CDN global para carga rápida
- ✅ Optimización automática de imágenes

## 📋 Paso 1: Crear cuenta en Cloudinary

1. Ve a: https://cloudinary.com/users/register/free
2. Completa el formulario:
   - Nombre
   - Email
   - Contraseña
3. Confirma tu email
4. Inicia sesión

## 📋 Paso 2: Obtener credenciales

1. En el Dashboard de Cloudinary, verás tu **Cloud Name** (ej: `dabc123`)
2. Haz clic en **"Settings"** (Configuración) o ve a: https://console.cloudinary.com/settings
3. En la sección **"API Keys"**, verás:
   - **API Key** (ej: `123456789012345`)
   - **API Secret** (ej: `abcdefghijklmnop`) - Mantén esto SECRETO

## 📋 Paso 3: Configurar variables de entorno

Añade estas variables a tu archivo `.env.local` (en la raíz del proyecto):

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name-aqui
NEXT_PUBLIC_CLOUDINARY_API_KEY=tu-api-key-aqui
CLOUDINARY_API_SECRET=tu-api-secret-aqui

# Firebase (mantén las que ya tienes)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_API_KEY` pueden ser públicas (empiezan con `NEXT_PUBLIC_`)
- `CLOUDINARY_API_SECRET` NO debe empezar con `NEXT_PUBLIC_` porque es secreto

## 📋 Paso 4: Reiniciar el servidor

Después de añadir las variables de entorno:

```bash
# Detén el servidor (Ctrl+C)
# Luego inicia de nuevo:
npm run dev
```

## 📋 Paso 5: Probar la subida

1. Inicia sesión en tu aplicación
2. Ve a "Nuevo producto"
3. Selecciona una imagen
4. Guarda el producto
5. ✅ La imagen debería subirse a Cloudinary

## 🔍 Verificar que funciona

1. Sube una imagen desde el admin
2. Abre la consola del navegador (F12)
3. Ve a la pestaña "Network"
4. Busca una solicitud a `/api/upload-image`
5. Si ves status 200, ¡funciona!

También puedes ver tus imágenes en: https://console.cloudinary.com/media

## 💰 Límites del plan gratuito:

- ✅ **25 GB de almacenamiento**
- ✅ **25 GB de ancho de banda por mes**
- ✅ **25,000 transformaciones por mes**
- ✅ Sin límite de solicitudes

Para un catálogo normal, esto es más que suficiente.

## 🆘 Solución de problemas:

### Error: "Cloudinary config is missing"
- Verifica que las variables de entorno estén en `.env.local`
- Reinicia el servidor después de añadir las variables

### Error: "Invalid API Key"
- Verifica que copiaste correctamente el API Key y API Secret
- Asegúrate de que no haya espacios extra

### Las imágenes no se suben
- Abre la consola del navegador (F12) y revisa los errores
- Verifica que la API route `/api/upload-image` esté funcionando

## 📸 Ver tus imágenes en Cloudinary:

1. Ve a: https://console.cloudinary.com/media
2. Verás todas las imágenes que has subido
3. Estarán en la carpeta `electrodomesticos/`

---

**¡Listo!** Ahora puedes subir imágenes sin necesidad de método de pago. 🎉

