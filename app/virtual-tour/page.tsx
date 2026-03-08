'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface VirtualTour {
  id: number;
  title: string;
  video_path: string;
  description?: string;
  uploaded_at: string;
}

export default function VirtualTourPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tour, setTour] = useState<VirtualTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    console.log("🎬 Virtual Tour page loaded");
    fetchVirtualTour();
  }, []);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!showControls && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  const fetchVirtualTour = async () => {
    try {
      console.log("🔄 Fetching virtual tour...");
      setLoading(true);
      const response = await fetch('/api/virtual-tour');
      const result = await response.json();
      
      console.log("📋 Virtual Tour API Response:", result);
      
      if (result.success && result.data) {
        setTour(result.data);
        console.log("✅ Loaded virtual tour:", result.data.title);
      } else {
        setError("Failed to load virtual tour");
        console.error("❌ Invalid response:", result);
      }
    } catch (error) {
      console.error('❌ Error fetching virtual tour:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch virtual tour');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const closeVirtualTour = () => {
    router.back();
  };

  const handleVideoError = (e: any) => {
    console.error("❌ Video playback error:", e);
    setError("Failed to play video. The video file may not be accessible.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 font-medium">Loading virtual tour...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-gray-300 text-lg font-semibold mb-2">Error Loading Virtual Tour</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={closeVirtualTour}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-300 text-lg font-semibold mb-2">No Virtual Tour Available</p>
          <p className="text-gray-500 text-sm mb-6">To add a virtual tour, go to the Admin Panel and upload a video to the Virtual Tour section</p>
          <button
            onClick={closeVirtualTour}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Close Button */}
      <button
        onClick={closeVirtualTour}
        className="absolute top-4 right-4 z-50 p-2 hover:bg-slate-800 rounded-full transition"
        title="Close virtual tour"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Video Player */}
      <div className="w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={tour.video_path}
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          onError={handleVideoError}
          onEnded={() => {
            console.log("🎬 Video playback completed");
            setIsPlaying(false);
          }}
        />
      </div>

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Info */}
        {tour.title && (
          <div className="mb-4">
            <h2 className="text-white font-semibold text-lg">{tour.title}</h2>
            {tour.description && (
              <p className="text-gray-300 text-sm">{tour.description}</p>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayPause}
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <p className="text-gray-300 text-sm ml-auto">Press ESC to exit</p>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute top-20 left-4 text-gray-400 text-xs pointer-events-none">
        <p>Space: Play/Pause • M: Mute • ESC: Exit</p>
      </div>
    </div>
  );
}
