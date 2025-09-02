import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Sparkles, BookOpen, Music, BarChart3, Cloud, X } from 'lucide-react';

interface WelcomeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPremium: boolean;
  currentEntries: number;
  entryLimit: number;
}

export const WelcomeUpgradeModal: React.FC<WelcomeUpgradeModalProps> = ({
  isOpen,
  onClose,
  hasPremium,
  currentEntries,
  entryLimit
}) => {
  if (hasPremium) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-center flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Welcome Back, Premium User!
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-calm text-white text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <h3 className="text-lg font-medium">Premium Active</h3>
              <p className="text-sm opacity-90">
                Enjoy unlimited journal entries and premium features!
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Unlimited Entries</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Music className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">All Sounds</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Advanced Insights</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Cloud className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Cloud Sync</p>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">
              Start Journaling
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center">Welcome Back!</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Your Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentEntries} / {entryLimit} entries used
              </span>
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentEntries / entryLimit) * 100, 100)}%` }}
              />
            </div>
          </Card>

          {/* Upgrade CTA */}
          <Card className="p-6 bg-gradient-calm text-white text-center">
            <div className="space-y-3">
              <Crown className="h-10 w-10 mx-auto opacity-90" />
              <h3 className="text-lg font-medium">Upgrade to Premium</h3>
              <p className="text-sm opacity-90">
                Click the entry counter above to unlock unlimited journaling!
              </p>
            </div>
          </Card>

          {/* Premium Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-center">Premium Features:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Unlimited Entries</p>
                <p className="text-xs text-muted-foreground">No daily limits</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Music className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Premium Sounds</p>
                <p className="text-xs text-muted-foreground">All meditation audio</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Advanced Insights</p>
                <p className="text-xs text-muted-foreground">Detailed analytics</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Cloud className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs font-medium">Cloud Sync</p>
                <p className="text-xs text-muted-foreground">Access anywhere</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-center font-medium text-yellow-800 dark:text-yellow-200">
                💡 Tip: Click the entry counter at the top to upgrade instantly!
              </p>
            </div>
            
            <Button onClick={onClose} variant="outline" className="w-full">
              Continue with Free Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};