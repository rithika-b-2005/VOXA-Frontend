'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import GooeyNav from "@/components/ui/GooeyNav";
import MetallicPaint, { parseLogoFromUrl } from "@/components/ui/MetallicPaint";

const navItems = [
  { label: "Home", href: "#" },
  { label: "Docs", href: "#" },
];

export default function Home() {
  const [logoImageData, setLogoImageData] = useState(null);

  useEffect(() => {
    async function loadLogo() {
      try {
        const result = await parseLogoFromUrl("/logo.svg");
        setLogoImageData(result.imageData);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    }
    loadLogo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="relative rounded-full min-w-[800px]">
          <div className="backdrop-blur-md rounded-full px-10 py-2 flex items-center justify-between gap-32 border border-white/50 bg-black">
          <div className="w-[60px] h-[40px]">
            {logoImageData && (
              <MetallicPaint
                imageData={logoImageData}
                params={{
                  patternScale: 2,
                  refraction: 0.015,
                  edge: 1,
                  patternBlur: 0.005,
                  liquid: 0.07,
                  speed: 0.3
                }}
              />
            )}
          </div>
          <GooeyNav
            items={navItems}
            animationTime={600}
            particleCount={15}
            initialActiveIndex={0}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center min-h-screen pt-20">
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff, #c0c0c0, #e0e0e0, #a0a0a0, #ffffff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Stop chasing receipts,
            <br />
            let AI chase them for you.
          </h1>
          <Link
            href="/login"
            className="mt-8 px-8 py-3 rounded-full font-semibold text-black transition-all hover:scale-105 inline-block"
            style={{
              background: 'linear-gradient(135deg, #ffffff, #c0c0c0, #e0e0e0, #a0a0a0, #ffffff)'
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}