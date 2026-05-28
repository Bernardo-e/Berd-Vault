import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StudyState {
  totalStudySeconds: number;
  todayStudySeconds: number;
  currentStreak: number;
  sessionsCompleted: number;
  lastStudyDate: string;
  addSession: (seconds: number) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      totalStudySeconds: 0,
      todayStudySeconds: 0,
      currentStreak: 0,
      sessionsCompleted: 0,
      lastStudyDate: new Date().toDateString(),
      
      addSession: (seconds: number) => {
        const today = new Date().toDateString();
        const state = get();
        
        let newStreak = state.currentStreak;
        let newTodaySeconds = state.todayStudySeconds;
        
        if (state.lastStudyDate !== today) {
          // Check if yesterday was the last study date to maintain streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (state.lastStudyDate === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1; // Reset streak if missed a day
          }
          newTodaySeconds = 0; // Reset daily seconds
        }
        
        if (newStreak === 0) newStreak = 1; // First ever session
        
        set({
          totalStudySeconds: state.totalStudySeconds + seconds,
          todayStudySeconds: newTodaySeconds + seconds,
          sessionsCompleted: state.sessionsCompleted + 1,
          currentStreak: newStreak,
          lastStudyDate: today,
        });
      },
    }),
    {
      name: 'berd-vault-study-storage',
    }
  )
);
