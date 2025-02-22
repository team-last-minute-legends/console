import { useState, useCallback } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onTimeUpdate: (time: number) => void;
}

export function useAudioRecorder({ onRecordingComplete, onTimeUpdate }: AudioRecorderProps) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [time, setTime] = useState(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
        setChunks(audioChunks);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      
      // Start timer
      setTime(0);
      const intervalId = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
      setTimer(intervalId);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [onRecordingComplete, onTimeUpdate]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setTime(0);
  }, [mediaRecorder, timer]);

  return {
    startRecording,
    stopRecording,
  };
} 