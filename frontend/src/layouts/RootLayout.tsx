import { useState } from "react";
import { IconButton, Theme } from "@radix-ui/themes";
import { Moon, Sun } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { AmbientGlow } from "@src/components/ambient-glow";
import { useAuth } from "@src/lib/auth.tsx";

export function RootLayout() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();

  return (
    <Theme
      appearance={isDark ? "dark" : "light"}
      accentColor="indigo"
      grayColor="slate"
      radius="large"
      scaling="100%"
      className={isDark ? "app-theme-dark" : "app-theme-light"}
    >
      <div className="relative min-h-screen overflow-x-hidden bg-[--gray-1] text-[--gray-12]">
        <AmbientGlow visible={isDark} />

        <header className="relative z-10 border-b border-[--gray-6] bg-[--color-panel-solid]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              Save Your Money
            </Link>

            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <nav className="flex items-center gap-4 text-sm">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive
                        ? "font-semibold text-[--accent-11]"
                        : "text-[--gray-11]"
                    }
                  >
                    Login
                  </NavLink>
                </nav>
              ) : null}

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
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <Outlet />
        </main>
      </div>
    </Theme>
  );
}
