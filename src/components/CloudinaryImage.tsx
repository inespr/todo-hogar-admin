'use client';

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { ImageProps } from '@cloudinary/react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  objectFit = 'cover',
  quality = 'auto',
  format = 'auto',
}: CloudinaryImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dt3o9afla';
  
  // Si no hay cloudName configurado o la imagen no es de Cloudinary, usar imagen normal
  if (!cloudName || !src.includes('cloudinary.com') || !src.includes('res.cloudinary.com')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit }}
      />
    );
  }

  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudName,
    },
  });

  // Extraer el public_id de la URL de Cloudinary
  // Formato: https://res.cloudinary.com/cloudname/image/upload/v1234567890/folder/image.jpg
  let publicId = src;
  try {
    const urlParts = src.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Obtener todo después de 'upload'
      const afterUpload = urlParts.slice(uploadIndex + 1);
      // Saltar el version si existe (v1234567890)
      const startIndex = afterUpload[0]?.startsWith('v') ? 1 : 0;
      publicId = afterUpload.slice(startIndex).join('/');
      // Remover la extensión
      publicId = publicId.replace(/\.[^/.]+$/, '');
    }
  } catch (e) {
    // Si hay error parseando, usar la URL completa
    console.warn('Error parseando URL de Cloudinary:', e);
  }

  const img = cld
    .image(publicId)
    .format(format)
    .quality(quality);

  // Aplicar resize si se especifican dimensiones
  if (width || height) {
    img.resize(
      auto()
        .gravity(autoGravity())
        .width(width || 'auto')
        .height(height || 'auto')
    );
  }

  return (
    <AdvancedImage
      cldImg={img}
      alt={alt}
      className={className}
      style={{ objectFit, width: width || '100%', height: height || 'auto' }}
    />
  );
}

