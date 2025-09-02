import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Zap, Target } from 'lucide-react';

interface StreakCounterProps {
  journalStreak: number;
  meditationStreak: number;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  journalStreak,
  meditationStreak,
  className = ''
}) => {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '🌱';
    return '💧';
  };

  const getStreakMessage = (streak: number, type: 'journal' | 'meditation') => {
    if (streak === 0) return `Start your ${type} journey`;
    if (streak === 1) return `Great start!`;
    if (streak >= 7) return `Amazing consistency!`;
    if (streak >= 30) return `Incredible dedication!`;
    return `Keep it up!`;
  };

  return (
    <Card className={`p-4 space-y-4 shadow-card ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Daily Streaks
        </h3>
        <p className="text-sm text-muted-foreground">Your consistency journey</p>
      </div>

      <div className="space-y-3">
        {/* Journal Streak */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground">Journal</div>
              <div className="text-xs text-muted-foreground">
                {getStreakMessage(journalStreak, 'journal')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xl">{getStreakEmoji(journalStreak)}</span>
              <span className="text-lg font-bold text-primary">{journalStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>
        </div>

        {/* Meditation Streak */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Zap className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <div className="font-medium text-foreground">Meditation</div>
              <div className="text-xs text-muted-foreground">
                {getStreakMessage(meditationStreak, 'meditation')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xl">{getStreakEmoji(meditationStreak)}</span>
              <span className="text-lg font-bold text-secondary">{meditationStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>
        </div>
      </div>

      {/* Motivation message */}
      <div className="text-center">
        {(journalStreak > 0 || meditationStreak > 0) ? (
          <p className="text-xs text-muted-foreground italic">
            Nice work! Your streak continues ✨
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Start today to begin your wellness journey
          </p>
        )}
      </div>

      {/* Milestones */}
      {(journalStreak >= 7 || meditationStreak >= 7) && (
        <div className="text-center animate-scale-in">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 rounded-full">
            <span className="text-accent text-sm">🎉</span>
            <span className="text-xs font-medium text-accent">
              Week milestone reached!
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};