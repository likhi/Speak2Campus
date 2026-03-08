import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImgIcon, Video, Loader, Film, PlusCircle, ChevronLeft, ChevronRight, X, FolderOpen } from 'lucide-react';

interface GalleryMedia {
  id: number;
  title: string;
  file_path: string;
  file_type?: string;
  description?: string;
  album_id?: number;
  uploaded_at: string;
}

interface GalleryAlbum {
  id: number;
  title: string;
  description?: string;
  cover_path?: string;
  created_at: string;
  media: GalleryMedia[];
}

const isVideo = (item: GalleryMedia) =>
  item.file_type === 'video' || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(item.file_path || '');

// ── Slideshow lightbox ─────────────────────────────────────────────────────
function AlbumSlideshow({ album, onClose }: { album: GalleryAlbum; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const total = album.media.length;
  const cur = album.media[idx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + total) % total);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % total);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total, onClose]);

  if (!cur) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60" onClick={e => e.stopPropagation()}>
        <div>
          <h2 className="text-white font-semibold">{album.title}</h2>
          <p className="text-gray-400 text-xs">{idx + 1} / {total}</p>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white p-1">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
        {/* Prev */}
        {total > 1 && (
          <button
            onClick={() => setIdx(i => (i - 1 + total) % total)}
            className="absolute left-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="max-w-4xl w-full px-16 flex flex-col items-center gap-3">
          {isVideo(cur) ? (
            <video
              key={cur.file_path}
              src={cur.file_path}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full rounded-lg shadow-2xl"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={cur.file_path}
              src={cur.file_path}
              alt={cur.title}
              className="max-h-[70vh] max-w-full rounded-lg shadow-2xl object-contain"
            />
          )}
          {cur.title && <p className="text-white text-sm">{cur.title}</p>}
        </div>

        {/* Next */}
        {total > 1 && (
          <button
            onClick={() => setIdx(i => (i + 1) % total)}
            className="absolute right-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnails strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-black/60" onClick={e => e.stopPropagation()}>
          {album.media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setIdx(i)}
              className={`shrink-0 rounded overflow-hidden border-2 transition ${i === idx ? 'border-cyan-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              {isVideo(m) ? (
                <div className="w-14 h-10 bg-slate-700 flex items-center justify-center">
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.file_path} alt="" className="w-14 h-10 object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pending file row before upload ─────────────────────────────────────────
interface PendingFile { file: File; previewUrl: string; itemTitle: string; }

// ── Main component ─────────────────────────────────────────────────────────
export function GalleryManager() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  // Lightbox
  const [lightboxAlbum, setLightboxAlbum] = useState<GalleryAlbum | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery/albums');
      const json = await res.json();
      if (json.success) setAlbums(json.data);
    } catch { setError('Failed to fetch albums'); }
    finally { setLoading(false); }
  };

  // ── File picker (multi) ────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPending: PendingFile[] = [];
    for (const file of files) {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      if (!isImg && !isVid) { setError(`"${file.name}" is not an image or video.`); continue; }
      const maxMB = isVid ? 200 : 50;
      if (file.size > maxMB * 1024 * 1024) { setError(`"${file.name}" exceeds ${maxMB}MB limit.`); continue; }
      newPending.push({ file, previewUrl: URL.createObjectURL(file), itemTitle: file.name.replace(/\.[^.]+$/, '') });
    }
    setPendingFiles(prev => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePending = (idx: number) => {
    setPendingFiles(prev => { URL.revokeObjectURL(prev[idx].previewUrl); return prev.filter((_, i) => i !== idx); });
  };

  // ── Submit: create album + upload all files ────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) { setError('Album title is required'); return; }
    if (pendingFiles.length === 0) { setError('Add at least one image or video'); return; }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Create album
      const albumRes = await fetch('/api/gallery/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: albumTitle.trim(), description: albumDesc.trim() }),
      });
      const albumJson = await albumRes.json();
      if (!albumJson.success) throw new Error(albumJson.error || 'Failed to create album');
      const albumId: number = albumJson.data.id;

      // 2. Upload each file sequentially and register in gallery
      for (let i = 0; i < pendingFiles.length; i++) {
        const pf = pendingFiles[i];
        const fd = new FormData();
        fd.append('file', pf.file);
        fd.append('type', 'gallery');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) throw new Error(`"${pf.file.name}": ${uploadJson.error}`);

        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pf.itemTitle,
            file_path: uploadJson.path,
            file_type: pf.file.type.startsWith('video/') ? 'video' : 'image',
            description: '',
            album_id: albumId,
          }),
        });
      }

      setSuccess(`Album "${albumTitle}" created with ${pendingFiles.length} file(s)!`);
      pendingFiles.forEach(pf => URL.revokeObjectURL(pf.previewUrl));
      setPendingFiles([]);
      setAlbumTitle('');
      setAlbumDesc('');
      setTimeout(() => setSuccess(null), 4000);
      fetchAlbums();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete album ───────────────────────────────────────────────────────
  const deleteAlbum = async (id: number) => {
    if (!confirm('Delete this entire album and all its media?')) return;
    await fetch(`/api/gallery/albums?id=${id}`, { method: 'DELETE' });
    setAlbums(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      <h3 className="text-xl font-bold text-white mb-4">📸 Gallery — Albums</h3>

      {/* ── Create Album Form ── */}
      <form onSubmit={handleSubmit} className="bg-slate-700 rounded-lg p-5 space-y-4">
        <p className="text-sm text-gray-300 font-medium">Create New Album (Event)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Album Title <span className="text-red-400">*</span>
            </label>
            <input
              value={albumTitle}
              onChange={e => setAlbumTitle(e.target.value)}
              placeholder="e.g., Annual Day 2025"
              className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 placeholder-gray-400 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Description <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              value={albumDesc}
              onChange={e => setAlbumDesc(e.target.value)}
              placeholder="Brief description of the event…"
              className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 placeholder-gray-400 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>
        </div>

        {/* Multi-file picker */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Add Photos / Videos
            <span className="ml-2 text-gray-500 text-xs">Images ≤50MB · Videos ≤200MB · Select multiple files</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFilePick}
            className="w-full px-3 py-2 bg-slate-600 text-gray-300 rounded border border-slate-500 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white file:cursor-pointer hover:file:bg-cyan-700"
          />
        </div>

        {/* Pending files preview grid */}
        {pendingFiles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {pendingFiles.map((pf, i) => (
              <div key={i} className="relative group">
                {pf.file.type.startsWith('video/') ? (
                  <div className="w-full aspect-square bg-slate-600 rounded flex flex-col items-center justify-center gap-1">
                    <Video className="w-6 h-6 text-cyan-400" />
                    <span className="text-xs text-gray-300 text-center truncate w-full px-1">{pf.file.name.slice(0, 12)}</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pf.previewUrl} alt="" className="w-full aspect-square object-cover rounded" />
                )}
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate rounded-b">
                  {pf.file.type.startsWith('video/') ? '🎬' : '🖼'} {(pf.file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            ))}
            {/* Add more button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-slate-500 rounded flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition"
            >
              <PlusCircle className="w-6 h-6 mb-1" />
              <span className="text-xs">Add more</span>
            </button>
          </div>
        )}

        {error && <div className="text-red-400 text-sm bg-red-900/20 rounded px-3 py-2">⚠️ {error}</div>}
        {success && <div className="text-green-400 text-sm bg-green-900/20 rounded px-3 py-2">✅ {success}</div>}

        <button
          type="submit"
          disabled={uploading || pendingFiles.length === 0 || !albumTitle.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition font-medium text-sm"
        >
          {uploading
            ? <><Loader className="w-4 h-4 animate-spin" /> Uploading {pendingFiles.length} file(s)…</>
            : <><Upload className="w-4 h-4" /> Create Album ({pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''})</>
          }
        </button>
      </form>

      {/* ── Albums Grid ── */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading albums…</div>
      ) : albums.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No albums yet — create one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map(album => {
            const cover = album.media[0];
            const videoCount = album.media.filter(isVideo).length;
            const imgCount = album.media.length - videoCount;
            return (
              <div key={album.id} className="bg-slate-700 rounded-xl overflow-hidden shadow-lg group cursor-pointer"
                onClick={() => setLightboxAlbum(album)}>
                {/* Cover */}
                <div className="relative w-full h-40 bg-slate-800">
                  {cover ? (
                    isVideo(cover) ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Film className="w-12 h-12 text-cyan-400 opacity-70" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.file_path} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <ImgIcon className="w-12 h-12 text-slate-500" />
                    </div>
                  )}

                  {/* Media count badge */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {imgCount > 0 && (
                      <span className="flex items-center gap-0.5 bg-black/70 text-xs text-white rounded px-1.5 py-0.5">
                        <ImgIcon className="w-3 h-3" /> {imgCount}
                      </span>
                    )}
                    {videoCount > 0 && (
                      <span className="flex items-center gap-0.5 bg-black/70 text-xs text-cyan-300 rounded px-1.5 py-0.5">
                        <Video className="w-3 h-3" /> {videoCount}
                      </span>
                    )}
                  </div>

                  {/* Slide strip overlay */}
                  {album.media.length > 1 && (
                    <div className="absolute inset-x-0 bottom-0 flex h-8 opacity-0 group-hover:opacity-100 transition overflow-hidden">
                      {album.media.slice(0, 6).map((m, i) => (
                        isVideo(m) ? (
                          <div key={i} className="flex-1 bg-slate-800 flex items-center justify-center border-r border-slate-600">
                            <Video className="w-3 h-3 text-cyan-400" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={m.file_path} alt="" className="flex-1 h-8 object-cover border-r border-slate-600" />
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{album.title}</h4>
                    {album.description && <p className="text-xs text-gray-400 truncate">{album.description}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">{album.media.length} item{album.media.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteAlbum(album.id); }}
                    className="ml-2 p-1.5 rounded bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition"
                    title="Delete album"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Slideshow */}
      {lightboxAlbum && (
        <AlbumSlideshow album={lightboxAlbum} onClose={() => setLightboxAlbum(null)} />
      )}
    </div>
  );
}
