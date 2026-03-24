# 🔐 Configurar Credenciales de Cloudinary

## ✅ Tus credenciales de Cloudinary:

- **Cloud Name**: `dt3o9afla`
- **API Key**: `678563266156614`
- **API Secret**: `v52uw_tdrYYFdMs7jhvaYezaeSY`

## 📋 Pasos para configurar:

### Paso 1: Crear/Actualizar archivo `.env.local`

En la raíz de tu proyecto, crea o actualiza el archivo `.env.local` con estas credenciales:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dt3o9afla
NEXT_PUBLIC_CLOUDINARY_API_KEY=678563266156614
CLOUDINARY_API_SECRET=v52uw_tdrYYFdMs7jhvaYezaeSY
```

**⚠️ IMPORTANTE:**
- El archivo `.env.local` NO debe subirse a Git (ya está en .gitignore)
- Mantén el API Secret seguro y no lo compartas

### Paso 2: Reiniciar el servidor

Después de añadir las credenciales:

```bash
# Detén el servidor (Ctrl+C)
# Luego inicia de nuevo:
npm run dev
```

### Paso 3: Verificar que funciona

1. Inicia sesión en tu aplicación
2. Ve a "Nuevo producto"
3. Selecciona una imagen
4. Guarda el producto
5. ✅ La imagen debería subirse a Cloudinary

## 🔍 Verificar en Cloudinary:

1. Ve a: https://console.cloudinary.com/media
2. Inicia sesión con tu cuenta
3. Verás todas las imágenes que subas en la carpeta `electrodomesticos/`

## 🆘 Si no funciona:

1. Verifica que el archivo `.env.local` esté en la raíz del proyecto
2. Verifica que las credenciales estén correctas (sin espacios extra)
3. Reinicia el servidor después de cambiar las variables
4. Abre la consola del navegador (F12) y revisa los errores

## 📝 Nota sobre seguridad:

- ✅ Las credenciales están configuradas con valores por defecto en el código como respaldo
- ✅ Pero es mejor usar variables de entorno para mayor seguridad
- ✅ El API Secret nunca se expone al cliente (solo se usa en el servidor)

---

**¡Listo!** Con estas credenciales, Cloudinary debería funcionar perfectamente. 🎉

