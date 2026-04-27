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
};

export function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`flex h-full min-h-[calc(100vh-64px)] flex-col bg-[#24242b] transition-all duration-200 ${collapsed ? "w-[84px]" : "w-full lg:w-[290px]"}`}
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
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[--accent-9] px-3 py-2.5 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10] ${collapsed ? "px-0" : ""}`}
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
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-[--gray-3]/70 px-3 py-2 text-left transition hover:bg-[--gray-4]"
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
              className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-[#34343d] bg-[#17171d] p-2"
            >
              <Link
                to="/dashboard/profile"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[--gray-11] transition hover:bg-[--gray-4] hover:bg-blue-500/10 hover:text-[--gray-12]"
              >
                <User size={14} />
                Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[--gray-11] transition hover:bg-[--gray-4] hover:bg-blue-500/10 hover:text-[--gray-12]"
              >
                <Settings size={14} />
                Account settings
              </Link>
              <div className="my-1 h-px w-full bg-[--gray-6]" />
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
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
