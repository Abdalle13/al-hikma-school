import { useContext } from "react";
import { ThemeContext } from "./ThemeContext.js";

export function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
