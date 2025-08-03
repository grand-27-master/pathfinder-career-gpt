import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraToggleProps {
  onCameraToggle: (enabled: boolean) => void;
}

const CameraToggle: React.FC<CameraToggleProps> = ({ onCameraToggle }) => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraEnabled(true);
      onCameraToggle(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      toast({
        title: "Camera enabled",
        description: "Your camera is now active for the interview",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Unable to access your camera. You can still proceed with audio-only interview.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraEnabled(false);
    onCameraToggle(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    toast({
      title: "Camera disabled",
      description: "Camera has been turned off",
    });
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Video Settings</h3>
            <Button
              onClick={cameraEnabled ? stopCamera : startCamera}
              variant={cameraEnabled ? "outline" : "default"}
              className={cameraEnabled ? "text-red-600 hover:text-red-700" : ""}
            >
              {cameraEnabled ? (
                <>
                  <CameraOff className="mr-2 h-4 w-4" />
                  Turn Off Camera
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Turn On Camera
                </>
              )}
            </Button>
          </div>

          {cameraEnabled && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-48 rounded-lg bg-gray-100 object-cover"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                LIVE
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {cameraEnabled 
              ? "Camera is active. The interviewer can see you during the interview."
              : "Camera is off. You can enable it to simulate a video interview experience."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraToggle;