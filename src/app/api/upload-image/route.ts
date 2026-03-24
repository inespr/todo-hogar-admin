import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dt3o9afla',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '678563266156614',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v52uw_tdrYYFdMs7jhvaYezaeSY',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Convertir File a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convertir a base64
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'electrodomesticos',
      resource_type: 'image',
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Error al subir la imagen: ${message}` },
      { status: 500 }
    );
  }
}

