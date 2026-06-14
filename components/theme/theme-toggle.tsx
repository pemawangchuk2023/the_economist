"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="cursor-pointer"
    >
      <Sun className="scale-100 transition-transform dark:scale-0" />
      <Moon className="absolute scale-0 transition-transform dark:scale-100" />
    </Button>
  );
};

export default ThemeToggle;
