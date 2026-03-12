'use client';

import { OTPForm } from "@/components/ui/OTPForm";

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OTPForm className="w-full max-w-md" />
    </div>
  );
}
