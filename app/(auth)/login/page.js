"use client";

import { LoginForm } from "@/components/ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <a
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white text-xl z-10"
      >
        <span className="text-sm">←</span>
        <span>Home</span>
      </a>
      <LoginForm className="w-full max-w-md" />
    </div>
  );
}
