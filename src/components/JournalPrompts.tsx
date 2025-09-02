import React from 'react';

interface JournalPromptsProps {
  mood?: {
    colorName: string;
    emotion?: string;
    intensity: number;
  };
}

export const JournalPrompts: React.FC<JournalPromptsProps> = ({ mood }) => {
  const getPromptsForMood = (colorName: string, emotion?: string, intensity?: number) => {
    const basePrompts = {
      Joy: [
        "What brought this happiness into your day?",
        "How can you hold onto this feeling?",
        "What are you most grateful for right now?",
        "Describe the best moment of your day so far."
      ],
      Calm: [
        "What is helping you feel peaceful right now?",
        "Where do you feel most at ease?",
        "What thoughts are you letting go of today?",
        "How does this calmness feel in your body?"
      ],
      Energy: [
        "What's motivating you today?",
        "How do you want to use this energy?",
        "What goals feel within reach right now?",
        "What makes you feel strong and capable?"
      ],
      Love: [
        "Who or what do you feel connected to today?",
        "How are you showing love to yourself?",
        "What relationships bring you joy?",
        "How does love show up in your life?"
      ],
      Sadness: [
        "What do you need to feel supported right now?",
        "What would you tell a friend feeling this way?",
        "What small comfort can you give yourself?",
        "What has helped you through difficult times before?"
      ],
      Anger: [
        "What boundary needs your attention?",
        "What is this frustration trying to tell you?",
        "How can you honor this feeling safely?",
        "What would make you feel heard?"
      ],
      Anxiety: [
        "What would help you feel safer right now?",
        "What can you control in this moment?",
        "What grounding techniques work for you?",
        "What would tomorrow-you want you to know?"
      ],
      Neutral: [
        "What are you noticing about today?",
        "How does 'okay' feel for you right now?",
        "What small moment can you appreciate?",
        "What would make today feel complete?"
      ]
    };

    const prompts = basePrompts[colorName as keyof typeof basePrompts] || basePrompts.Neutral;
    
    // Add intensity-based variations
    if (intensity && intensity >= 8) {
      return [
        `This feeling seems quite strong. ${prompts[0]}`,
        `When you feel ${emotion?.toLowerCase() || 'this way'} intensely, ${prompts[1]?.toLowerCase()}`,
        ...prompts.slice(2)
      ];
    } else if (intensity && intensity <= 3) {
      return [
        `This gentle feeling... ${prompts[0]?.toLowerCase()}`,
        `Even subtle emotions matter. ${prompts[1]}`,
        ...prompts.slice(2)
      ];
    }

    return prompts;
  };

  if (!mood) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Free writing</h3>
        <div className="space-y-3">
          <p className="text-muted-foreground">Write freely — no rules.</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• What's on your mind today?</p>
            <p>• How are you feeling right now?</p>
            <p>• What would you like to remember about today?</p>
          </div>
        </div>
      </div>
    );
  }

  const prompts = getPromptsForMood(mood.colorName, mood.emotion, mood.intensity);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-medium text-foreground">
          Guided reflection
        </h3>
        <p className="text-sm text-muted-foreground">
          {mood.emotion ? `Feeling ${mood.emotion?.toLowerCase()}` : `Exploring ${mood.colorName?.toLowerCase()}`} 
          {mood.intensity && ` at ${mood.intensity}/10`}
        </p>
      </div>

      <div className="space-y-3">
        {prompts.map((prompt, index) => (
          <div 
            key={index}
            className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary/30 hover:border-primary/60 transition-colors duration-200"
          >
            <p className="text-sm font-medium text-foreground">{prompt}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          Choose one that resonates, or write freely about anything
        </p>
      </div>
    </div>
  );
};