import { useState } from "react";
import { Theme } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@src/components/app-header.tsx";
import { AppSidebar } from "@src/components/app-sidebar.tsx";

export function AppLayout() {
  const [isDark, setIsDark] = useState<boolean>(true);

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
        <AppHeader
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />
        <main className="relative z-10 px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <AppSidebar />
            <div className="min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </Theme>
  );
}
