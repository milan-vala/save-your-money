import { useState } from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { EllipsisVertical, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@src/lib/auth.tsx";

export function AppHeader() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(true);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="relative z-10 border-b border-[--gray-6] bg-[--color-panel-solid]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
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
            onClick={() => setIsDark((prev) => !prev)}
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

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                type="button"
                variant="ghost"
                color="gray"
                highContrast
                aria-label="Open options menu"
              >
                <EllipsisVertical aria-hidden size={18} strokeWidth={1.75} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item
                color="red"
                onSelect={() => void handleLogout()}
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
