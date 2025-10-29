import { defineConfig, presetWebFonts, presetWind3 } from "unocss";

export default defineConfig({
  presets: [
    presetWind3(),
    presetWebFonts({
      provider: "google",
      fonts: {
        golos: {
          name: "Golos Text",
          weights: ["400", "500", "600", "700"],
        },
        inter: {
          name: "Inter",
          weights: ["400", "500", "600", "700"],
        },
      },
    }),
  ],
  theme: {
    colors: {
      // Основные цвета бренда UDV
      primary: "#393043",

      // Вторичные цвета
      secondary: "#f8fafc",

      // Акцентные цвета
      accent: "#28CA9E",

      // Цвета для отделов (из ТЗ - 6 подразделений)
      department: {
        it: "#3697FF", // IT - синий
        hr: "#24D07A", // HR - зеленый
        finance: "#F59E0B", // Finance - оранжевый
        marketing: "#FF4671", // Marketing - красный
        sales: "#7D5EFA", // Sales - фиолетовый
        operations: "#2DD6C0", // Operations - голубой
      },

      // Семантические цвета
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",

      // Нейтральные цвета
      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
      },
    },

    // Дополнительные настройки темы
    boxShadow: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
  },
});
