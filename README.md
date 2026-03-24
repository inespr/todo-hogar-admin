This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Variables de entorno (Firebase)

Crea un archivo `.env.local` en la raíz con tus credenciales de Firebase (todas son públicas del lado cliente):

```
NEXT_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
```

Si no tienes un proyecto, crea uno en la consola de Firebase y habilita Authentication (Email/Password y Google), Firestore (modo producción) y Storage.

## Configuración de Cloudinary (Para subir imágenes)

Este proyecto usa **Cloudinary** para almacenar imágenes (gratis, sin método de pago).

### Variables de entorno necesarias:

Añade estas variables a tu `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

**📋 Guía completa**: Consulta `CONFIGURAR_CLOUDINARY.md` para obtener tus credenciales y configurar Cloudinary paso a paso.

## Configuración de Firebase Storage

**⚠️ IMPORTANTE**: Para que la subida de imágenes funcione, debes configurar las reglas de seguridad de Firebase Storage.

### Guía rápida:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Storage** > **Rules**
4. Copia y pega el contenido del archivo `storage.rules` (está en la raíz del proyecto)
5. Haz clic en **Publicar**

**📋 Guía detallada**: Consulta el archivo `CONFIGURACION_STORAGE.md` para instrucciones paso a paso.

**Importante**: 
- Las reglas permiten que usuarios autenticados suban imágenes de hasta 10MB
- Funciona perfectamente con el plan Spark (gratuito)
- El error de CORS se soluciona configurando estas reglas correctamente

## Configuración de CORS (Opcional)

Si sigues teniendo problemas de CORS, puedes configurar CORS en Firebase Storage usando el archivo `cors.json`:

```bash
gsutil cors set cors.json gs://tu-proyecto.appspot.com
```

Reemplaza `tu-proyecto` con el nombre de tu bucket de Storage.
