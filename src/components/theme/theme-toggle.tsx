"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      title="Toggle theme"
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
