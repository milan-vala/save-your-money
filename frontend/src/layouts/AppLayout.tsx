import { useState } from "react";
import { Theme } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@src/components/app-header.tsx";
import { AppSidebar } from "@src/components/app-sidebar.tsx";

export function AppLayout() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <Theme
      appearance={isDark ? "dark" : "light"}
      accentColor="indigo"
      grayColor="slate"
      radius="large"
      scaling="100%"
      className={isDark ? "app-theme-dark" : "app-theme-light"}
    >
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[--gray-1] text-[--gray-12]">
        <AppHeader
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />
        <main className="relative z-10 min-h-0 flex-1">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)]">
            <AppSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            />
            <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </Theme>
  );
}
