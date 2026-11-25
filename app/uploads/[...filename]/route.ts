import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { stat } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await context.params;
    const joined = Array.isArray(filename) ? filename.join('/') : filename;
    const filePath = path.join(process.cwd(), 'public', 'uploads', joined);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Fichier introuvable', { status: 404 });
    }

    const fileStat = await stat(filePath);
    const fileSize = fileStat.size;
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.ogg': 'video/ogg',
      '.m4v': 'video/mp4',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Support des Range Requests (HTTP 206) indispensable pour les vidéos HTML5 (Chrome / Safari)
    const range = req.headers.get('range');
    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Plage non satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(webStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('[UPLOADS ROUTE ERROR]:', err);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
