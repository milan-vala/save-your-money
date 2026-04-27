import { IconButton } from "@radix-ui/themes";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

type AppHeaderProps = {
  isDark: boolean;
  onToggleTheme: () => void;
};

export function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="relative z-10 border-b border-[#34343d] bg-[--color-panel-solid] backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
          Save Your Money
        </Link>

        <div className="flex items-center gap-3">
          <IconButton
            type="button"
            variant="ghost"
            color="gray"
            highContrast
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            onClick={onToggleTheme}
            style={{ cursor: "pointer" }}
          >
            {isDark ? (
              <Sun
                aria-hidden
                size={18}
                strokeWidth={1.75}
                className="cursor-pointer"
              />
            ) : (
              <Moon
                aria-hidden
                size={18}
                strokeWidth={1.75}
                className="cursor-pointer"
              />
            )}
          </IconButton>
        </div>
      </div>
    </header>
  );
}
