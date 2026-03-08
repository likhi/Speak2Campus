import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_BASE_DIR = path.join(process.cwd(), 'public', 'uploads');
const GALLERY_DIR = path.join(UPLOAD_BASE_DIR, 'gallery');
const TOUR_DIR = path.join(UPLOAD_BASE_DIR, 'virtual-tour');

// Ensure directories exist
async function ensureDirectories() {
  try {
    if (!existsSync(GALLERY_DIR)) await mkdir(GALLERY_DIR, { recursive: true });
    if (!existsSync(TOUR_DIR)) await mkdir(TOUR_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'gallery' or 'tour'

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: 'File and type are required' },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Validation — gallery accepts images AND videos, tour only accepts videos
    let isValidType = false;
    let maxSize = 50 * 1024 * 1024; // default 50MB

    if (type === 'gallery') {
      isValidType = isImage || isVideo;
      maxSize = isVideo ? 200 * 1024 * 1024 : 50 * 1024 * 1024; // 200MB video, 50MB image
    } else if (type === 'tour') {
      isValidType = isVideo;
      maxSize = 500 * 1024 * 1024; // 500MB for virtual tour
    }

    if (!isValidType) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Gallery accepts images and videos (MP4, WebM, etc).` },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File size exceeds limit (${Math.round(maxSize / 1024 / 1024)}MB)` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${ext}`;

    const uploadDir = type === 'gallery' ? GALLERY_DIR : TOUR_DIR;
    const filePath = path.join(uploadDir, filename);
    const publicPath = type === 'gallery'
      ? `/uploads/gallery/${filename}`
      : `/uploads/virtual-tour/${filename}`;

    // Write file
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      path: publicPath,
      filename,
      fileType: isVideo ? 'video' : 'image',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
