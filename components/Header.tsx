"use client";

import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { useDemo } from "./DemoProvider";

export function Brand() {
  return (
    <Link href="/feed" className="brand" aria-label="Peer Space — Lenta">
      <span className="brand-mark">
        21
        <span className="brand-square" />
      </span>
      <span className="brand-name">
        peer<span className="brand-slash">/</span>space
        <span className="brand-caption">SCHOOL 21 HAMJAMIYATI</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const { user } = useDemo();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <div className="campus-label">
          <span className="status-dot" />
          Toshkent kampusi
          <ArrowUpRight size={13} />
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <span className="header-divider" />
          <Link
            href="/profile"
            className="header-profile"
            aria-label="Mening profilim"
          >
            <Avatar user={user} size="sm" />
            <span>{user.name.split(" ")[0]}</span>
          </Link>
          <button
            className="icon-button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Chiqish"
            title="Akkauntdan chiqish"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
