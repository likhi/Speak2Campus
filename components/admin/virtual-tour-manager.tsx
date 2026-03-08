import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Video as VideoIcon, Loader } from 'lucide-react';

interface VirtualTour {
  id: number;
  title: string;
  video_path: string;
  description: string;
  uploaded_at: string;
}

export function VirtualTourManager() {
  const [tour, setTour] = useState<VirtualTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Campus Virtual Tour');
  const [description, setDescription] = useState('360-degree virtual tour of campus');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVirtualTour();
  }, []);

  const fetchVirtualTour = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/virtual-tour');
      const result = await response.json();
      if (result.success && result.data) {
        setTour(result.data);
      }
    } catch (err) {
      setError('Failed to fetch virtual tour');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      setError('Please provide title and select video');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'tour');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Upload failed');
        return;
      }

      // Step 2: Create or update virtual tour entry
      const tourResponse = await fetch('/api/virtual-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          video_path: uploadResult.path,
          description,
        }),
      });

      const tourResult = await tourResponse.json();
      if (tourResult.success) {
        setTour(tourResult.data);
        setSelectedFile(null);
        setError(null);
        // Reset form
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      setError('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete the virtual tour video?')) return;

    try {
      const response = await fetch('/api/virtual-tour', {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setTour(null);
      }
    } catch (err) {
      setError('Failed to delete video');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">🎬 Virtual Tour Management</h3>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-slate-700 rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Campus Virtual Tour"
            className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the virtual tour..."
            className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 placeholder-gray-400"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Select Video (MP4, WebM, etc)</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 bg-slate-600 text-gray-300 rounded border border-slate-500"
          />
          <p className="text-xs text-gray-400 mt-1">Max 500MB. Note: Only latest video is kept.</p>
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded transition"
        >
          {uploading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Video
            </>
          )}
        </button>
      </form>

      {/* Current Video Preview */}
      {loading ? (
        <div className="text-center text-gray-400">Loading virtual tour...</div>
      ) : tour ? (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">📹 Current Tour</h4>
          <p className="text-sm text-gray-300 mb-2">{tour.title}</p>
          <p className="text-xs text-gray-400 mb-3">{tour.description}</p>

          {/* Video Preview */}
          <video
            src={tour.video_path}
            controls
            className="w-full rounded bg-black mb-3"
            style={{ maxHeight: '300px' }}
          />

          <div className="text-xs text-gray-400 mb-3">
            Uploaded: {new Date(tour.uploaded_at).toLocaleString('en-IN')}
          </div>

          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Tour
          </button>
        </div>
      ) : (
        <div className="bg-slate-700 rounded-lg p-4 text-center text-gray-400">
          No virtual tour uploaded yet. Upload one above!
        </div>
      )}
    </div>
  );
}
