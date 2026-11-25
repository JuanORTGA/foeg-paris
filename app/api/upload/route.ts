import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const isVideo = file.type?.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Si Cloudinary est configuré avec de vrais identifiants
    const isCloudinaryReady =
      cloudName &&
      cloudName !== 'tu_cloud_name' &&
      apiKey &&
      apiKey !== 'tu_api_key' &&
      apiSecret &&
      apiSecret !== 'tu_api_secret';

    if (isCloudinaryReady) {
      try {
        const mimeType = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');
        const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
        const timestamp = Math.round(Date.now() / 1000);
        const stringToSign = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', base64Data);
        cloudinaryForm.append('api_key', apiKey!);
        cloudinaryForm.append('timestamp', String(timestamp));
        cloudinaryForm.append('signature', signature);
        cloudinaryForm.append('folder', 'foeg_atelier');

        const uploadEndpoint = isVideo
          ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
          : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const uploadRes = await fetch(uploadEndpoint, {
          method: 'POST',
          body: cloudinaryForm,
        });

        if (uploadRes.ok) {
          const cloudData = await uploadRes.json();
          return NextResponse.json({
            success: true,
            secure_url: cloudData.secure_url || cloudData.url,
            public_id: cloudData.public_id,
            isVideo,
          });
        }
      } catch (cloudErr) {
        console.error('[CLOUDINARY UPLOAD ERROR]:', cloudErr);
      }
    }

    // 2. Stockage local ultra-rapide dans public/uploads (URL légère /uploads/...)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || (isVideo ? 'mp4' : 'jpg');
    const filename = `foeg-${isVideo ? 'reel' : 'media'}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      secure_url: publicUrl,
      isVideo,
      message: isVideo ? 'Vidéo / Reel enregistré avec succès.' : 'Média enregistré avec succès.',
    });
  } catch (error: any) {
    console.error('[UPLOAD ROUTE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors du téléversement.' },
      { status: 500 }
    );
  }
}
