import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDarkMode: boolean;
  accentColor: string;
  toggleDarkMode: () => void;
  setAccentColor: (color: string) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      accentColor: '#14b8a6', // Default teal

      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          // Update document class for CSS
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newMode };
        }),

      setAccentColor: (color: string) =>
        set({ accentColor: color }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
