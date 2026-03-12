"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconChevronDown, IconCheck } from "@tabler/icons-react"
import { supportedLanguages, SupportedLanguage } from "@/lib/voice/languages"

interface VoiceLanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (languageCode: string) => void
  className?: string
}

export function VoiceLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  className = "",
}: VoiceLanguageSelectorProps) {
  const currentLanguage = supportedLanguages.find(l => l.code === selectedLanguage)

  return (
    <div className={`relative ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/10">
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span className="text-sm text-white/80 hidden sm:inline">
              {currentLanguage?.name.split(' ')[0]}
            </span>
            <IconChevronDown className="h-4 w-4 text-white/60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-black/95 border border-white/20 backdrop-blur-xl max-h-[300px] overflow-y-auto w-[280px]"
          align="end"
        >
          <div className="p-2 border-b border-white/10">
            <p className="text-xs text-white/50 uppercase tracking-wider px-2">Select Language</p>
          </div>
          {supportedLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/10 ${
                selectedLanguage === lang.code ? "bg-purple-500/20" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex-1">
                <p className="text-sm text-white">{lang.name}</p>
                <p className="text-xs text-white/50">{lang.nativeName}</p>
              </div>
              {selectedLanguage === lang.code && (
                <IconCheck className="h-4 w-4 text-purple-400" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default VoiceLanguageSelector
