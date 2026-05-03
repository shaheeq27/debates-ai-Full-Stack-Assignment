"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useConversations, useLogout } from "@/hooks";
import { SessionUser } from "@/types";
import toast from "react-hot-toast";
import { clsx } from "clsx";

interface Props {
  slug: string;
  projectName: string;
  user: SessionUser;
  isAdmin: boolean;
}

export function ProjectSidebar({ slug, projectName, user, isAdmin }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: conversations = [] } = useConversations(slug);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success("Logged out");
    router.push("/login");
  };

  const isOnAdmin = pathname.includes("/admin");
  const isOnChat = pathname.includes("/chat");

  return (
    <aside
      className={clsx(
        "flex flex-col border-r border-white/5 transition-all duration-300 relative",
        collapsed ? "w-[60px]" : "w-[260px]"
      )}
      style={{ background: "#0d0d15" }}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L2 6v8l8 4 8-4V6l-8-4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 6l8 4 8-4M10 10v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#5a5a72] font-medium">Debales AI</div>
            <div
              className="text-sm font-semibold text-white truncate"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {projectName}
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#5a5a72] hover:text-white transition-colors ml-auto flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d={collapsed ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <div className="p-2 space-y-1">
        <NavItem
          href={`/${slug}/chat`}
          icon={<ChatIcon />}
          label="Chat"
          active={isOnChat}
          collapsed={collapsed}
          testId="nav-chat"
        />
        {isAdmin && (
          <NavItem
            href={`/${slug}/admin`}
            icon={<DashboardIcon />}
            label="Dashboard"
            active={isOnAdmin}
            collapsed={collapsed}
            badge="Admin"
            testId="nav-admin"
          />
        )}
      </div>

      {/* Conversations list */}
      {!collapsed && isOnChat && (
        <div className="flex-1 overflow-y-auto px-2 py-2" data-testid="conversation-list">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[10px] font-semibold text-[#5a5a72] uppercase tracking-widest">
              Recent Chats
            </span>
          </div>
          {conversations.length === 0 ? (
            <div className="px-2 py-4 text-center">
              <p className="text-xs text-[#5a5a72]">No conversations yet</p>
              <p className="text-xs text-[#5a5a72] mt-1">Start a new chat below</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((conv) => {
                const isActive = pathname.includes(conv._id);
                return (
                  <Link
                    key={conv._id}
                    href={`/${slug}/chat/${conv._id}`}
                    className={clsx(
                      "flex flex-col gap-0.5 px-3 py-2 rounded-lg transition-all duration-150 group border border-transparent",
                      isActive
                        ? "sidebar-item-active"
                        : "hover:bg-white/5 hover:border-white/5 text-[#9090a8] hover:text-white"
                    )}
                  >
                    <span className="text-xs font-medium truncate">{conv.title}</span>
                    {conv.lastMessage && (
                      <span className="text-[11px] text-[#5a5a72] truncate">
                        {conv.lastMessage}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!collapsed && !isOnChat && <div className="flex-1" />}
      {collapsed && <div className="flex-1" />}

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-white/5 transition-colors"
            title={user.name}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: user.avatarColor }}
            >
              {user.name[0]}
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: user.avatarColor }}
            >
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user.name}</div>
              <div className="text-[10px] text-[#5a5a72] truncate">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#5a5a72] hover:text-[#f43f5e] transition-colors"
              title="Logout"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  collapsed,
  badge,
  testId,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: string;
  testId?: string;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 border",
        active
          ? "sidebar-item-active border-cyan-400/20"
          : "border-transparent hover:bg-white/5 hover:border-white/5 text-[#9090a8] hover:text-white"
      )}
    >
      <span className={clsx("flex-shrink-0", active ? "text-cyan-400" : "")}>
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="text-sm font-medium flex-1">{label}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/20">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 2v-2H3a1 1 0 01-1-1V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}
