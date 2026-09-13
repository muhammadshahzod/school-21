"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageCircle, Rocket, UserRound } from "lucide-react";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";

const items = [
  { href: "/feed", key: "nav.feed", icon: House },
  { href: "/incubator", key: "nav.incubator", icon: Rocket },
  { href: "/chat", key: "nav.chat", icon: MessageCircle },
  { href: "/profile", key: "nav.profile", icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { conversations } = useDemo();
  const { t } = useLang();
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  return (
    <nav className="bottom-nav" aria-label={t("nav.aria")}>
      <div className="bottom-nav-inner">
        {items.map(({ href, key, icon: Icon }) => (
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
                  aria-label={t("nav.unread_aria", { n: unread })}
                >
                  {unread}
                </span>
              )}
            </span>
            <span>{t(key)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
