import { Theme } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@src/components/app-header.tsx";

export function AppLayout() {
  return (
    <Theme
      appearance="dark"
      accentColor="indigo"
      grayColor="slate"
      radius="large"
      scaling="100%"
      className="app-theme-dark"
    >
      <div className="relative min-h-screen overflow-x-hidden bg-[--gray-1] text-[--gray-12]">
        <AppHeader />
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>
    </Theme>
  );
}
