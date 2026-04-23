import { useState } from "react";
import { Theme, Switch } from "@radix-ui/themes";
import { Link, NavLink, Outlet } from "react-router-dom";

export function RootLayout() {
  const [isDark, setIsDark] = useState<boolean>(false);

  return (
    <Theme
      appearance={isDark ? "dark" : "light"}
      accentColor="indigo"
      grayColor="slate"
      radius="large"
      scaling="100%"
    >
      <div className="min-h-screen bg-[--gray-1] text-[--gray-12]">
        <header className="border-b border-[--gray-6] bg-[--color-panel-solid]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              Save Your Money
            </Link>

            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-4 text-sm">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "font-semibold text-[--accent-11]"
                      : "text-[--gray-11]"
                  }
                >
                  Home
                </NavLink>
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

              <div className="flex items-center gap-2 text-sm text-[--gray-11]">
                <span className="hidden sm:inline">Dark</span>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setIsDark(checked)}
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </Theme>
  );
}
