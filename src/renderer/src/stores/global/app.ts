// This file defines a Pinia store for managing global application state
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  // Initialize state from localStorage or use default values
  const layout = ref(localStorage.getItem("app-layout") || "default");
  const theme = ref(localStorage.getItem("app-theme") || "light");
  const language = ref(localStorage.getItem("app-language") || "en");

  // Define actions to update state and persist changes to localStorage
  const setLayout = (newLayout: string): void => {
    layout.value = newLayout;
    localStorage.setItem("app-layout", newLayout);
  };

  const setTheme = (newTheme: string): void => {
    theme.value = newTheme;
    localStorage.setItem("app-theme", newTheme);
  };

  const setLanguage = (newLanguage: string): void => {
    language.value = newLanguage;
    localStorage.setItem("app-language", newLanguage);
  };

  return { layout, theme, language, setLayout, setTheme, setLanguage };
});
