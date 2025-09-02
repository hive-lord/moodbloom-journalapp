import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

const MOOD_COLORS = [
  { name: 'Joy', color: 'hsl(45, 100%, 70%)', class: 'mood-joy', emotions: ['Happy', 'Excited', 'Grateful', 'Energetic'] },
  { name: 'Calm', color: 'hsl(195, 100%, 75%)', class: 'mood-calm', emotions: ['Peaceful', 'Relaxed', 'Centered', 'Serene'] },
  { name: 'Energy', color: 'hsl(120, 100%, 70%)', class: 'mood-energy', emotions: ['Motivated', 'Confident', 'Strong', 'Focused'] },
  { name: 'Love', color: 'hsl(330, 100%, 75%)', class: 'mood-love', emotions: ['Loving', 'Connected', 'Warm', 'Appreciated'] },
  { name: 'Sadness', color: 'hsl(220, 50%, 60%)', class: 'mood-sadness', emotions: ['Sad', 'Lonely', 'Disappointed', 'Melancholy'] },
  { name: 'Anger', color: 'hsl(0, 100%, 65%)', class: 'mood-anger', emotions: ['Frustrated', 'Irritated', 'Angry', 'Upset'] },
  { name: 'Anxiety', color: 'hsl(280, 50%, 65%)', class: 'mood-anxiety', emotions: ['Worried', 'Nervous', 'Stressed', 'Overwhelmed'] },
  { name: 'Neutral', color: 'hsl(0, 0%, 70%)', class: 'mood-neutral', emotions: ['Okay', 'Balanced', 'Steady', 'Present'] }
];

interface MoodColorPickerProps {
  onMoodChange: (mood: {
    color: string;
    intensity: number;
    emotion?: string;
    colorName: string;
  }) => void;
  selectedMood?: {
    color: string;
    intensity: number;
    emotion?: string;
    colorName: string;
  };
}

export const MoodColorPicker: React.FC<MoodColorPickerProps> = ({ 
  onMoodChange, 
  selectedMood 
}) => {
  const [selectedColor, setSelectedColor] = useState(selectedMood?.colorName || '');
  const [intensity, setIntensity] = useState(selectedMood?.intensity || 5);
  const [selectedEmotion, setSelectedEmotion] = useState(selectedMood?.emotion || '');

  const handleColorSelect = (moodColor: typeof MOOD_COLORS[0]) => {
    setSelectedColor(moodColor.name);
    const mood = {
      color: moodColor.color,
      intensity,
      emotion: selectedEmotion,
      colorName: moodColor.name
    };
    onMoodChange(mood);
  };

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setIntensity(newIntensity);
    
    if (selectedColor) {
      const colorData = MOOD_COLORS.find(c => c.name === selectedColor);
      if (colorData) {
        onMoodChange({
          color: colorData.color,
          intensity: newIntensity,
          emotion: selectedEmotion,
          colorName: selectedColor
        });
      }
    }
  };

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    
    if (selectedColor) {
      const colorData = MOOD_COLORS.find(c => c.name === selectedColor);
      if (colorData) {
        onMoodChange({
          color: colorData.color,
          intensity,
          emotion,
          colorName: selectedColor
        });
      }
    }
  };

  const selectedColorData = MOOD_COLORS.find(c => c.name === selectedColor);

  return (
    <Card className="p-6 space-y-6 shadow-card">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">Pick a color for your mood</h3>
        <p className="text-sm text-muted-foreground">Choose what feels right today</p>
      </div>

      {/* Color Selection */}
      <div className="grid grid-cols-4 gap-3">
        {MOOD_COLORS.map((moodColor) => (
          <button
            key={moodColor.name}
            onClick={() => handleColorSelect(moodColor)}
            className={`
              aspect-square rounded-2xl border-2 transition-all duration-300 hover-lift
              ${selectedColor === moodColor.name 
                ? 'border-primary scale-105 shadow-glow' 
                : 'border-border hover:border-primary/50'
              }
            `}
            style={{ backgroundColor: moodColor.color }}
            aria-label={`Select ${moodColor.name} mood`}
          >
            <span className="sr-only">{moodColor.name}</span>
          </button>
        ))}
      </div>

      {/* Intensity Slider */}
      {selectedColor && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center">
            <h4 className="text-sm font-medium text-foreground mb-2">
              How intense is this feeling?
            </h4>
            <div className="text-2xl font-semibold text-primary">{intensity}/10</div>
          </div>
          
          <Slider
            value={[intensity]}
            onValueChange={handleIntensityChange}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gentle</span>
            <span>Intense</span>
          </div>
        </div>
      )}

      {/* Emotion Labels */}
      {selectedColorData && (
        <div className="space-y-3 animate-fade-in">
          <h4 className="text-sm font-medium text-foreground text-center">
            What word describes this feeling?
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedColorData.emotions.map((emotion) => (
              <button
                key={emotion}
                onClick={() => handleEmotionSelect(emotion)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${selectedEmotion === emotion
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {emotion}
              </button>
            ))}
          </div>
          
          {selectedEmotion && (
            <div className="text-center text-sm text-muted-foreground">
              <em>Color + intensity = emotion labeling, a proven way to clarify feelings</em>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};