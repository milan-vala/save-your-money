import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { Button, DropdownMenu, Popover } from "@radix-ui/themes";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@src/lib/auth.tsx";

type AppSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isDark: boolean;
};

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  isDark,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`flex h-full min-h-[calc(100vh-64px)] flex-col transition-all duration-200 ${isDark ? "bg-[#24242b]" : "border-r border-[#e0e0e0] bg-[#ffffff]"} ${collapsed ? "w-[84px]" : "w-full lg:w-[290px]"}`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed ? (
          <p className="text-xs font-semibold tracking-wide text-[--gray-11] uppercase">
            Workspace
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="ghost"
          onClick={onToggleCollapse}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md"
          style={{
            cursor: "pointer",
            padding: "12px",
            marginRight: collapsed ? "8px" : "0px",
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 space-y-3 px-3 py-3">
        {!collapsed ? (
          <p className="px-1 text-sm text-[--gray-11]">
            No loan accounts yet. Create one to start tracking interest, EMI,
            and savings opportunities.
          </p>
        ) : null}

        <Link
          to="/dashboard/loan-accounts/new"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[--accent-9] px-3 py-2.5 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10] ${collapsed ? "px-0" : ""} ${isDark ? "bg-[#24242b] hover:bg-[#34343d]" : "bg-[#e8edf8] hover:bg-[#dbe4f5]"}`}
        >
          <Plus size={16} />
          {!collapsed ? "Create Loan Account" : null}
        </Link>
      </div>

      <div className="mt-auto px-3 py-3">
        {collapsed ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[--gray-3]/70 px-3 py-2 text-left transition hover:bg-[--gray-4]"
                aria-label="Open account menu"
              >
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--accent-8]/70 text-[--accent-contrast]">
                  <User size={15} />
                </div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="center" side="top">
              <DropdownMenu.Item>
                <User size={14} />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Settings size={14} />
                Account settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                color="red"
                onSelect={() => void handleLogout()}
              >
                <LogOut size={14} />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <Popover.Root
            open={isAccountMenuOpen}
            onOpenChange={setIsAccountMenuOpen}
          >
            <Popover.Trigger>
              <button
                type="button"
                className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                  isDark
                    ? "bg-[--gray-3]/70 hover:bg-[--gray-4]"
                    : "bg-[#dde5f4] hover:bg-[#d1dcf0]"
                }`}
                aria-label="Toggle account menu"
              >
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--accent-8]/70 text-[--accent-contrast]">
                  <User size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[--gray-12]">
                    User account
                  </p>
                  <p className="truncate text-xs text-[--gray-11]">
                    session active
                  </p>
                </div>
                <ChevronsUpDown size={16} className="text-[--gray-11]" />
              </button>
            </Popover.Trigger>
            <Popover.Content
              side="top"
              align="start"
              sideOffset={8}
              className={`w-[var(--radix-popover-trigger-width)] rounded-xl p-2 ${
                isDark
                  ? "border border-[#34343d] bg-[#17171d]"
                  : "border border-[#cfd8ea] bg-[#f7f9ff]"
              }`}
            >
              <Link
                to="/dashboard/profile"
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isDark
                    ? "text-[--gray-11] hover:bg-[--gray-4] hover:text-[--gray-12]"
                    : "text-[#3b4860] hover:bg-[#e6ecf9] hover:text-[#1e293b]"
                }`}
              >
                <User size={14} />
                Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isDark
                    ? "text-[--gray-11] hover:bg-[--gray-4] hover:text-[--gray-12]"
                    : "text-[#3b4860] hover:bg-[#e6ecf9] hover:text-[#1e293b]"
                }`}
              >
                <Settings size={14} />
                Account settings
              </Link>
              <div
                className={`my-1 h-px w-full ${
                  isDark ? "bg-[--gray-6]" : "bg-[#d6dff0]"
                }`}
              />
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isDark
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-[#c14444] hover:bg-[#fbe7e7] hover:text-[#a53030]"
                }`}
              >
                <LogOut size={14} />
                Logout
              </button>
            </Popover.Content>
          </Popover.Root>
        )}
      </div>
    </aside>
  );
}
