import { useState } from "react";
import { Theme } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@src/components/app-header.tsx";

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
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>
    </Theme>
  );
}
