import { useEffect, useState } from "react";

const useTheme = (): string => {
  const [themeValue, setThemeValue] = useState("");

  useEffect(() => {
    setThemeValue(
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    );
  }, []);

  return themeValue;
};

export default useTheme;
