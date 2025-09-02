import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MoodColorPicker } from '@/components/MoodColorPicker';
import { JournalPrompts } from '@/components/JournalPrompts';
import { MeditationTimer } from '@/components/MeditationTimer';
import { EmotionalCalendar } from '@/components/EmotionalCalendar';
import { StreakCounter } from '@/components/StreakCounter';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, LogOut, User, BookOpen, Timer, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import heroImage from '@/assets/hero-calm.jpg';

interface MoodEntry {
  date: string;
  mood_color: string;
  mood_intensity: number;
  emotion_label?: string;
  journal_entry?: string;
  guided_prompt?: string;
}

interface UserStreak {
  journal_streak: number;
  meditation_streak: number;
}

const IndexContent = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  
  const [currentMood, setCurrentMood] = useState<{
    color: string;
    intensity: number;
    emotion?: string;
    colorName: string;
  } | null>(null);
  
  const [journalEntry, setJournalEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [userStreaks, setUserStreaks] = useState<UserStreak>({ journal_streak: 0, meditation_streak: 0 });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Guest mode - load from localStorage
      loadGuestData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load mood entries
      const { data: entries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (entries) setMoodEntries(entries);

      // Load user streaks
      const { data: streaks } = await supabase
        .from('user_streaks')
        .select('journal_streak, meditation_streak')
        .eq('user_id', user.id)
        .single();

      if (streaks) setUserStreaks(streaks);

      // Check if there's an entry for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayEntry = entries?.find(entry => entry.date === today);
      if (todayEntry) {
        setCurrentMood({
          color: todayEntry.mood_color,
          intensity: todayEntry.mood_intensity,
          emotion: todayEntry.emotion_label,
          colorName: todayEntry.mood_color
        });
        setJournalEntry(todayEntry.journal_entry || '');
        setSelectedPrompt(todayEntry.guided_prompt || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadGuestData = () => {
    const guestData = localStorage.getItem('calmJournal_guestData');
    if (guestData) {
      const data = JSON.parse(guestData);
      setMoodEntries(data.entries || []);
      setUserStreaks(data.streaks || { journal_streak: 0, meditation_streak: 0 });
      
      // Check today's entry
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayEntry = data.entries?.find((entry: MoodEntry) => entry.date === today);
      if (todayEntry) {
        setCurrentMood({
          color: todayEntry.mood_color,
          intensity: todayEntry.mood_intensity,
          emotion: todayEntry.emotion_label,
          colorName: todayEntry.mood_color
        });
        setJournalEntry(todayEntry.journal_entry || '');
        setSelectedPrompt(todayEntry.guided_prompt || '');
      }
    }
  };

  const saveEntry = async () => {
    if (!currentMood) {
      toast({
        title: "Pick a mood first",
        description: "Choose a color that represents how you're feeling",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    const entryData = {
      date: today,
      mood_color: currentMood.colorName,
      mood_intensity: currentMood.intensity,
      emotion_label: currentMood.emotion,
      journal_entry: journalEntry,
      guided_prompt: selectedPrompt
    };

    try {
      if (user) {
        // Save to Supabase
        await supabase
          .from('mood_entries')
          .upsert({ 
            ...entryData, 
            user_id: user.id 
          });

        // For now, manually increment streak in guest mode logic
        // TODO: Add proper streak calculation with RPC functions
        
        // Reload data
        loadUserData();
      } else {
        // Save to localStorage (guest mode)
        const guestData = JSON.parse(localStorage.getItem('calmJournal_guestData') || '{}');
        const existingEntries = guestData.entries || [];
        const filteredEntries = existingEntries.filter((entry: MoodEntry) => entry.date !== today);
        
        guestData.entries = [...filteredEntries, entryData];
        guestData.streaks = { ...userStreaks, journal_streak: userStreaks.journal_streak + 1 };
        
        localStorage.setItem('calmJournal_guestData', JSON.stringify(guestData));
        setMoodEntries(guestData.entries);
        setUserStreaks(guestData.streaks);
      }

      toast({
        title: "Entry saved",
        description: "Your thoughts are safely recorded ✨"
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Couldn't save entry",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMeditationComplete = async (duration: number, ambientSound?: string) => {
    try {
      if (user) {
        await supabase
          .from('meditation_sessions')
          .insert({
            user_id: user.id,
            duration_minutes: duration,
            ambient_sound: ambientSound
          });

        // TODO: Add proper streak calculation with RPC functions
        loadUserData();
      } else {
        // Guest mode
        const guestData = JSON.parse(localStorage.getItem('calmJournal_guestData') || '{}');
        guestData.streaks = { ...userStreaks, meditation_streak: userStreaks.meditation_streak + 1 };
        localStorage.setItem('calmJournal_guestData', JSON.stringify(guestData));
        setUserStreaks(guestData.streaks);
      }

      toast({
        title: "Meditation complete",
        description: `Well done! ${duration} minutes of mindfulness ✨`
      });
    } catch (error) {
      console.error('Error saving meditation:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = moodEntries.find(e => e.date === dateStr);
    
    if (entry) {
      setCurrentMood({
        color: entry.mood_color,
        intensity: entry.mood_intensity,
        emotion: entry.emotion_label,
        colorName: entry.mood_color
      });
      setJournalEntry(entry.journal_entry || '');
      setSelectedPrompt(entry.guided_prompt || '');
    } else {
      setCurrentMood(null);
      setJournalEntry('');
      setSelectedPrompt('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-calm rounded-full animate-breathe mx-auto" />
          <p className="text-muted-foreground">Loading your peaceful space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Calm meditation background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h1 className="text-3xl font-light">Calm Journal</h1>
              <p className="text-white/80">
                {user ? `Welcome back${user.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ''}` : 'Welcome, guest'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-white hover:bg-white/10"
                >
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="text-center text-white space-y-4">
            <h2 className="text-2xl font-light">How are you feeling today?</h2>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCalendar(!showCalendar)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Journey
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowMeditation(!showMeditation)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Timer className="h-4 w-4 mr-2" />
                Meditate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Quick Stats */}
          <StreakCounter 
            journalStreak={userStreaks.journal_streak}
            meditationStreak={userStreaks.meditation_streak}
          />

          {/* Calendar View */}
          {showCalendar && (
            <div className="animate-fade-in">
              <EmotionalCalendar 
                moodEntries={moodEntries}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
          )}

          {/* Meditation Timer */}
          {showMeditation && (
            <div className="animate-fade-in">
              <MeditationTimer onSessionComplete={handleMeditationComplete} />
            </div>
          )}

          {/* Today's Entry */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mood Selection */}
            <div className="space-y-6">
              <MoodColorPicker 
                onMoodChange={setCurrentMood}
                selectedMood={currentMood}
              />
            </div>

            {/* Journal Section */}
            <div className="space-y-6">
              <Card className="p-6 shadow-card">
                <JournalPrompts mood={currentMood} />
                
                <div className="mt-6 space-y-4">
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Write freely about your day, thoughts, or feelings..."
                    className="min-h-32 resize-none"
                  />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {journalEntry.length} characters
                    </div>
                    
                    <div className="flex gap-2">
                      {!user && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/auth">
                            <User className="h-3 w-3 mr-1" />
                            Save Progress
                          </Link>
                        </Button>
                      )}
                      
                      <Button 
                        onClick={saveEntry}
                        disabled={isSaving || !currentMood}
                        className="shadow-soft hover:shadow-glow"
                      >
                        {isSaving ? 'Saving...' : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Save Entry
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Meditation Suggestion */}
              {currentMood && !showMeditation && (
                <Card className="p-4 bg-gradient-calm text-white shadow-glow animate-fade-in">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium">Start meditation now?</h4>
                    <p className="text-sm opacity-90">
                      A few minutes of mindfulness can deepen your reflection
                    </p>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMeditation(true)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Timer className="h-3 w-3 mr-1" />
                      Begin
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Guest Mode Notice */}
          {!user && (
            <Card className="p-4 bg-accent/10 border-accent/20">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-accent">Guest Mode</p>
                <p className="text-xs text-muted-foreground">
                  Your entries are saved locally. <Link to="/auth" className="text-primary hover:underline">Create an account</Link> to sync across devices and never lose your progress.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
