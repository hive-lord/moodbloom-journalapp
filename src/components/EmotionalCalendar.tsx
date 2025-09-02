import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

interface MoodEntry {
  date: string;
  mood_color: string;
  emotion_label?: string;
  mood_intensity: number;
  journal_entry?: string;
}

interface EmotionalCalendarProps {
  moodEntries?: MoodEntry[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const MOOD_COLORS_MAP: Record<string, string> = {
  'Joy': 'hsl(45, 100%, 70%)',
  'Calm': 'hsl(195, 100%, 75%)', 
  'Energy': 'hsl(120, 100%, 70%)',
  'Love': 'hsl(330, 100%, 75%)',
  'Sadness': 'hsl(220, 50%, 60%)',
  'Anger': 'hsl(0, 100%, 65%)',
  'Anxiety': 'hsl(280, 50%, 65%)',
  'Neutral': 'hsl(0, 0%, 70%)'
};

export const EmotionalCalendar: React.FC<EmotionalCalendarProps> = ({
  moodEntries = [],
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate grid start (include previous month days to fill first week)
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  // Calculate grid end (include next month days to fill last week)
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getMoodForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return moodEntries.find(entry => entry.date === dateStr);
  };

  const getMoodColor = (moodColorName: string) => {
    return MOOD_COLORS_MAP[moodColorName] || 'hsl(0, 0%, 90%)';
  };

  const handleDateClick = (date: Date) => {
    if (isSameMonth(date, currentMonth)) {
      onDateSelect?.(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  return (
    <Card className="p-6 space-y-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">Emotional Journey</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="min-w-32 text-center">
            <h4 className="font-medium text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const moodEntry = getMoodForDate(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!isCurrentMonth}
              className={`
                relative aspect-square p-1 text-sm rounded-lg border transition-all duration-200
                ${isCurrentMonth 
                  ? 'hover:bg-muted/50 border-transparent hover:border-border' 
                  : 'text-muted-foreground/50 cursor-not-allowed border-transparent'
                }
                ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${isToday ? 'font-semibold' : ''}
              `}
            >
              {/* Mood color indicator */}
              {moodEntry && isCurrentMonth && (
                <div 
                  className="absolute inset-1 rounded-md opacity-60"
                  style={{ backgroundColor: getMoodColor(moodEntry.mood_color) }}
                />
              )}
              
              {/* Date number */}
              <span className={`relative z-10 ${moodEntry && isCurrentMonth ? 'text-white' : ''}`}>
                {format(date, 'd')}
              </span>

              {/* Today indicator */}
              {isToday && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}

              {/* Mood intensity indicator */}
              {moodEntry && isCurrentMonth && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Each day shows your mood color</p>
          <p>Click any date to view or edit your entry</p>
        </div>
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="animate-fade-in">
          <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary/60">
            <div className="text-sm font-medium text-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
            {(() => {
              const mood = getMoodForDate(selectedDate);
              if (mood) {
                return (
                  <div className="text-xs text-muted-foreground mt-1">
                    {mood.emotion_label || mood.mood_color} • Intensity {mood.mood_intensity}/10
                  </div>
                );
              } else {
                return (
                  <div className="text-xs text-muted-foreground mt-1">
                    No entry for this date
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </Card>
  );
};