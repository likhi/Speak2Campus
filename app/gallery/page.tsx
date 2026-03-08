'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Video, Image as ImgIcon, Film, AlertCircle } from 'lucide-react';

interface GalleryMedia {
  id: number;
  title: string;
  file_path: string;
  file_type?: string;
  description?: string;
}

interface GalleryAlbum {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
  media: GalleryMedia[];
}

const isVideoItem = (m: GalleryMedia) =>
  m.file_type === 'video' || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(m.file_path || '');

// ── Full-screen slideshow ──────────────────────────────────────────────────
function Slideshow({ album, onClose }: { album: GalleryAlbum; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const total = album.media.length;
  const cur = album.media[idx];

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose]);

  if (!cur) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/98 flex flex-col" onClick={onClose}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/80 to-transparent shrink-0"
        onClick={e => e.stopPropagation()}>
        <div>
          <h2 className="text-white text-lg font-semibold">{album.title}</h2>
          {album.description && <p className="text-gray-400 text-xs">{album.description}</p>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{idx + 1} / {total}</span>
          <button onClick={onClose}
            className="text-gray-300 hover:text-white transition p-1 rounded-full hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ── Main media area ── */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {total > 1 && (
          <button onClick={prev}
            className="absolute left-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition shadow-xl">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="flex flex-col items-center gap-2 max-h-full max-w-5xl w-full px-20">
          {isVideoItem(cur) ? (
            <video key={cur.file_path} src={cur.file_path} controls autoPlay
              className="max-h-[72vh] max-w-full rounded-xl shadow-2xl"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={cur.file_path} src={cur.file_path} alt={cur.title}
              className="max-h-[72vh] max-w-full rounded-xl shadow-2xl object-contain"
            />
          )}
          {cur.title && (
            <p className="text-white/80 text-sm text-center mt-1">{cur.title}</p>
          )}
        </div>

        {total > 1 && (
          <button onClick={next}
            className="absolute right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition shadow-xl">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {total > 1 && (
        <div className="shrink-0 flex gap-2 overflow-x-auto px-5 py-3
                        bg-gradient-to-t from-black/80 to-transparent"
          onClick={e => e.stopPropagation()}>
          {album.media.map((m, i) => (
            <button key={m.id} onClick={() => setIdx(i)}
              className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-90'
                }`}>
              {isVideoItem(m) ? (
                <div className="w-16 h-11 bg-slate-800 flex items-center justify-center">
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.file_path} alt="" className="w-16 h-11 object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gallery page ───────────────────────────────────────────────────────────
export default function GalleryPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAlbum, setOpenAlbum] = useState<GalleryAlbum | null>(null);

  useEffect(() => {
    fetch('/api/gallery/albums')
      .then(r => r.json())
      .then(json => { if (json.success) setAlbums(json.data); else setError('Failed to load gallery'); })
      .catch(() => setError('Failed to load gallery'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" />
        <p className="text-gray-400">Loading gallery…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <p className="text-white text-lg mb-4">{error}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-cyan-500 text-white rounded-lg">Go Home</button>
      </div>
    </div>
  );

  if (albums.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <ImgIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-white text-lg mb-2">No albums yet</p>
        <p className="text-gray-400 text-sm mb-6">Upload photos & videos from Admin Panel → Gallery</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-cyan-500 text-white rounded-lg">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📸 Campus Gallery</h1>
          <p className="text-gray-400 text-sm">{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm">
          <X className="w-4 h-4" /> Close
        </button>
      </div>

      {/* ── Album Grid ── */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(album => {
          const cover = album.media[0];
          const videos = album.media.filter(isVideoItem).length;
          const images = album.media.length - videos;

          return (
            <div key={album.id}
              onClick={() => album.media.length > 0 && setOpenAlbum(album)}
              className={`group rounded-2xl overflow-hidden bg-gray-900 shadow-xl border border-white/5
                         ${album.media.length > 0 ? 'cursor-pointer hover:border-white/20 hover:shadow-2xl' : 'opacity-60'}
                         transition-all duration-300`}>

              {/* Cover */}
              <div className="relative h-52 bg-gray-800 overflow-hidden">
                {cover ? (
                  isVideoItem(cover) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Film className="w-14 h-14 text-cyan-400/60" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.file_path} alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImgIcon className="w-12 h-12 text-gray-600" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Media count badges */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {images > 0 && (
                    <span className="flex items-center gap-1 bg-black/70 backdrop-blur text-xs text-white rounded-full px-2 py-0.5">
                      <ImgIcon className="w-3 h-3" /> {images}
                    </span>
                  )}
                  {videos > 0 && (
                    <span className="flex items-center gap-1 bg-black/70 backdrop-blur text-xs text-cyan-300 rounded-full px-2 py-0.5">
                      <Video className="w-3 h-3" /> {videos}
                    </span>
                  )}
                </div>

                {/* Hover thumbnail strip */}
                {album.media.length > 1 && (
                  <div className="absolute bottom-0 inset-x-0 flex h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                    {album.media.slice(0, 7).map((m, i) => (
                      isVideoItem(m) ? (
                        <div key={i} className="flex-1 h-full bg-slate-800 flex items-center justify-center border-r border-black/30">
                          <Video className="w-3 h-3 text-cyan-400" />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={m.file_path} alt="" className="flex-1 h-full object-cover border-r border-black/30" />
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white truncate">{album.title}</h3>
                {album.description && <p className="text-gray-400 text-sm truncate mt-0.5">{album.description}</p>}
                <p className="text-gray-500 text-xs mt-2">
                  {album.media.length === 0 ? 'Empty album' : `${album.media.length} item${album.media.length !== 1 ? 's' : ''} — click to view`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slideshow */}
      {openAlbum && <Slideshow album={openAlbum} onClose={() => setOpenAlbum(null)} />}
    </div>
  );
}
