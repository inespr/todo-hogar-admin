import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
// Usa CLOUDINARY_URL si está disponible, sino usa las variables individuales
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dt3o9afla',
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '678563266156614',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'v52uw_tdrYYFdMs7jhvaYezaeSY',
  });
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dt3o9afla',
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '678563266156614',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'v52uw_tdrYYFdMs7jhvaYezaeSY',
  });
}

/**
 * Sube una imagen a Cloudinary y devuelve la URL pública
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        
        // Convertir a formato que Cloudinary acepta
        const base64Data = base64String.split(',')[1] || base64String;
        
        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(
          `data:${file.type};base64,${base64Data}`,
          {
            folder: 'electrodomesticos',
            resource_type: 'auto',
            format: 'auto',
          }
        );
        
        resolve(result.secure_url);
      } catch (error) {
        console.error('Error subiendo imagen a Cloudinary:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error leyendo el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Elimina una imagen de Cloudinary usando su URL
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extraer el public_id de la URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `electrodomesticos/${filename.split('.')[0]}`;
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    // No lanzar error, solo loguear (por si la imagen ya no existe)
  }
}

