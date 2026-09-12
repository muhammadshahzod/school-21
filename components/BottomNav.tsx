"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageCircle, UserRound } from "lucide-react";
import { useDemo } from "./DemoProvider";

const items = [
  { href: "/feed", label: "Lenta", icon: House },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { conversations } = useDemo();
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  return (
    <nav className="bottom-nav" aria-label="Asosiy navigatsiya">
      <div className="bottom-nav-inner">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname.startsWith(href) ? "active" : ""}`}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
          >
            <span className="nav-icon">
              <Icon
                size={21}
                strokeWidth={pathname.startsWith(href) ? 2.2 : 1.7}
              />
              {href === "/chat" && unread > 0 && (
                <span
                  className="nav-badge"
                  aria-label={`${unread} ta o‘qilmagan xabar`}
                >
                  {unread}
                </span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
