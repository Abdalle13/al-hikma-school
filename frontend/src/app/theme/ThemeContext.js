import { createContext } from "react";

// { theme: "light" | "dark", toggleTheme: () => void, setTheme: (t) => void }
export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});
