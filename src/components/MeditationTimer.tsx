import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface MeditationTimerProps {
  onSessionComplete?: (duration: number, ambientSound?: string) => void;
  autoStart?: boolean;
}

// Audio Context for generating meditation sounds
const generateWhiteNoise = (audioContext: AudioContext, type: 'brown' | 'white' | 'pink' = 'white') => {
  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  
  if (type === 'brown') {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
  } else {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  
  return buffer;
};

const generateNatureSound = (audioContext: AudioContext, type: 'rain' | 'waves' | 'forest') => {
  const bufferSize = audioContext.sampleRate * 4;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    let sample = 0;
    
    if (type === 'rain') {
      // Simulate rain with high-frequency noise and filtering
      sample = (Math.random() * 2 - 1) * 0.3;
      if (Math.random() < 0.1) sample *= 2; // Random drops
    } else if (type === 'waves') {
      // Simulate waves with low-frequency oscillation
      const time = i / audioContext.sampleRate;
      sample = Math.sin(time * 0.5) * 0.4 + (Math.random() * 2 - 1) * 0.2;
    } else if (type === 'forest') {
      // Simulate forest with gentle wind and occasional bird sounds
      sample = (Math.random() * 2 - 1) * 0.15;
      if (Math.random() < 0.001) sample += Math.sin(i * 0.01) * 0.3; // Bird chirps
    }
    
    output[i] = sample;
  }
  
  return buffer;
};

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Silence', emoji: '🔇' },
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'waves', name: 'Ocean Waves', emoji: '🌊' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'brown-noise', name: 'Brown Noise', emoji: '🎵' }
];

const PRESET_DURATIONS = [
  { minutes: 3, label: '3 min' },
  { minutes: 5, label: '5 min' },
  { minutes: 10, label: '10 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 20, label: '20 min' }
];

export const MeditationTimer: React.FC<MeditationTimerProps> = ({ 
  onSessionComplete, 
  autoStart = false 
}) => {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [isComplete, setIsComplete] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context
  const initAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = isMuted ? 0 : volume[0];
    }
  };

  // Stop current audio
  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
  };

  // Start ambient sound
  const startAmbientSound = async () => {
    if (selectedSound === 'none') return;
    
    await initAudioContext();
    if (!audioContextRef.current || !gainNodeRef.current) return;

    let buffer: AudioBuffer;
    
    if (selectedSound === 'brown-noise') {
      buffer = generateWhiteNoise(audioContextRef.current, 'brown');
    } else {
      buffer = generateNatureSound(audioContextRef.current, selectedSound as 'rain' | 'waves' | 'forest');
    }

    sourceNodeRef.current = audioContextRef.current.createBufferSource();
    sourceNodeRef.current.buffer = buffer;
    sourceNodeRef.current.loop = true;
    sourceNodeRef.current.connect(gainNodeRef.current);
    sourceNodeRef.current.start();
  };

  // Effect for handling audio when running state changes
  useEffect(() => {
    if (isRunning && selectedSound !== 'none') {
      startAmbientSound();
    } else {
      stopAudio();
    }

    return () => stopAudio();
  }, [isRunning, selectedSound]);

  // Effect for volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume[0];
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (autoStart && !isRunning && timeLeft > 0) {
      setIsRunning(true);
    }
  }, [autoStart]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            onSessionComplete?.(selectedDuration, selectedSound !== 'none' ? selectedSound : undefined);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedDuration, selectedSound, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setIsComplete(false);
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
    setIsComplete(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setIsComplete(false);
  };

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  return (
    <Card className="p-6 space-y-6 shadow-card">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">Meditation Timer</h3>
        <p className="text-sm text-muted-foreground">
          {isComplete ? 'Session complete! Take a deep breath.' : 'Find your calm'}
        </p>
      </div>

      {/* Duration Selection */}
      {!isRunning && !isComplete && (
        <div className="space-y-3 animate-fade-in">
          <h4 className="text-sm font-medium text-foreground text-center">Choose duration</h4>
          <div className="flex gap-2 justify-center flex-wrap">
            {PRESET_DURATIONS.map((preset) => (
              <Button
                key={preset.minutes}
                variant={selectedDuration === preset.minutes ? "default" : "outline"}
                size="sm"
                onClick={() => handleDurationChange(preset.minutes)}
                className="min-w-16"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Progress Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-1000 ease-in-out"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Breathing Animation Circle */}
          <div 
            className={`
              absolute inset-4 rounded-full bg-gradient-calm opacity-20
              ${isRunning ? 'breathe' : ''}
            `}
          />
          
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-light text-foreground">
                {formatTime(timeLeft)}
              </div>
              {isRunning && (
                <div className="text-xs text-muted-foreground animate-gentle-pulse">
                  breathe
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handlePlayPause}
          size="lg"
          className="rounded-full w-16 h-16 shadow-soft hover:shadow-glow"
        >
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Ambient Sound Selection */}
      {!isRunning && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            <span>Ambient sound</span>
          </div>
          
          <Select value={selectedSound} onValueChange={setSelectedSound}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AMBIENT_SOUNDS.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  <span className="flex items-center gap-2">
                    <span>{sound.emoji}</span>
                    <span>{sound.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Volume Controls */}
          {selectedSound !== 'none' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Volume</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="flex-1">
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                    disabled={isMuted}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {isMuted ? '0%' : `${Math.round(volume[0] * 100)}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {isComplete && (
        <div className="text-center space-y-2 animate-scale-in">
          <p className="text-sm font-medium text-primary">✨ Well done!</p>
          <p className="text-xs text-muted-foreground">
            You meditated for {selectedDuration} minutes
          </p>
        </div>
      )}
    </Card>
  );
};