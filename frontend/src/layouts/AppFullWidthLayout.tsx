import { useState } from "react";
import { Theme } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@src/components/app-header.tsx";
import { AmbientGlow } from "@src/components/ambient-glow";

export function AppFullWidthLayout() {
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
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[--gray-1] text-[--gray-12]">
        <AmbientGlow visible={isDark} />
        <AppHeader
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />
        <main className="relative z-10 min-h-0 flex-1">
          <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </Theme>
  );
}
