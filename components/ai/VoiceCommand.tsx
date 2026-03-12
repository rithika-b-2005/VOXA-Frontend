"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPlayerPlay,
  IconVolume,
  IconWaveSquare,
  IconCheck,
  IconX,
  IconCommand,
  IconBrain,
  IconSparkles,
} from "@tabler/icons-react"

interface VoiceCommandProps {
  onResult: (transcript: string) => void
}

interface CommandHistoryItem {
  id: number
  command: string
  response: string
  timestamp: Date
  status: "success" | "failed" | "processing"
}

const voiceCommands = [
  { phrase: "Hey Voxa, show my expenses", category: "Navigation" },
  { phrase: "Generate invoice for [client name]", category: "Invoicing" },
  { phrase: "Pay [vendor] invoice", category: "Payments" },
  { phrase: "What's my cash flow this month?", category: "Analytics" },
  { phrase: "Schedule payroll for [month]", category: "Payroll" },
  { phrase: "Check GST compliance status", category: "Compliance" },
  { phrase: "Add expense [amount] for [category]", category: "Expenses" },
  { phrase: "Show unpaid bills", category: "Bills" },
]

export function VoiceCommand({ onResult }: VoiceCommandProps) {
  const [isListening, setIsListening] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [interimTranscript, setInterimTranscript] = React.useState("")
  const [voiceSupported, setVoiceSupported] = React.useState(false)
  const [commandHistory, setCommandHistory] = React.useState<CommandHistoryItem[]>([])
  const [audioLevel, setAudioLevel] = React.useState(0)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setVoiceSupported(true)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        setInterimTranscript(interim)
        if (final) {
          setTranscript(final)
          processVoiceCommand(final)
        }
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        stopAudioVisualization()
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        stopAudioVisualization()
      }
    }

    return () => {
      stopAudioVisualization()
    }
  }, [])

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const updateLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)
        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (err) {
      console.error("Error accessing microphone:", err)
    }
  }

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
  }

  const processVoiceCommand = (command: string) => {
    const newCommand: CommandHistoryItem = {
      id: Date.now(),
      command,
      response: "Processing...",
      timestamp: new Date(),
      status: "processing",
    }

    setCommandHistory((prev) => [newCommand, ...prev])

    // Simulate AI processing
    setTimeout(() => {
      setCommandHistory((prev) =>
        prev.map((item) =>
          item.id === newCommand.id
            ? {
                ...item,
                response: `Executing: "${command}"`,
                status: "success",
              }
            : item
        )
      )
      onResult(command)
    }, 1000)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      stopAudioVisualization()
      setIsListening(false)
    } else {
      setTranscript("")
      setInterimTranscript("")
      recognitionRef.current.start()
      startAudioVisualization()
      setIsListening(true)
    }
  }

  if (!voiceSupported) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
        <IconMicrophoneOff className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Voice Not Supported</h3>
        <p className="text-muted-foreground text-center">
          Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <IconMicrophone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Voice Commands</h3>
            <p className="text-xs text-muted-foreground">
              Speak naturally to control Voxa
            </p>
          </div>
        </div>
      </div>

      {/* Main Voice Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Voice Visualization */}
        <div className="relative">
          {/* Outer rings */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isListening ? "animate-ping" : ""
            }`}
            style={{
              transform: `scale(${1 + audioLevel * 0.5})`,
              background: isListening
                ? `radial-gradient(circle, rgba(147, 51, 234, ${0.1 + audioLevel * 0.3}) 0%, transparent 70%)`
                : "transparent",
            }}
          />
          <div
            className={`absolute inset-0 rounded-full transition-all duration-150`}
            style={{
              transform: `scale(${1 + audioLevel * 0.3})`,
              background: isListening
                ? `radial-gradient(circle, rgba(59, 130, 246, ${0.2 + audioLevel * 0.4}) 0%, transparent 70%)`
                : "transparent",
            }}
          />

          {/* Main button */}
          <button
            onClick={toggleListening}
            className={`relative z-10 p-8 rounded-full transition-all duration-300 ${
              isListening
                ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-[0_0_30px_rgba(147,51,234,0.3)]"
            }`}
          >
            {isListening ? (
              <IconMicrophoneOff className="h-12 w-12 text-white" />
            ) : (
              <IconMicrophone className="h-12 w-12 text-white" />
            )}
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          {isListening ? (
            <>
              <p className="text-lg font-semibold flex items-center gap-2 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Listening...
              </p>
              <p className="text-muted-foreground">
                {interimTranscript || "Speak your command"}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">Click to Start</p>
              <p className="text-muted-foreground">
                Say "Hey Voxa" followed by your command
              </p>
            </>
          )}
        </div>

        {/* Audio Level Bars */}
        {isListening && (
          <div className="flex items-end gap-1 h-8">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.random() * audioLevel * 100}%`,
                  minHeight: "4px",
                }}
              />
            ))}
          </div>
        )}

        {/* Last Transcript */}
        {transcript && !isListening && (
          <div className="w-full max-w-md p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Last command:</p>
            <p className="text-sm font-medium">{transcript}</p>
          </div>
        )}
      </div>

      {/* Available Commands */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <IconCommand className="h-3 w-3" />
          Available voice commands
        </p>
        <div className="grid grid-cols-2 gap-2">
          {voiceCommands.slice(0, 4).map((cmd, index) => (
            <div
              key={index}
              className="p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-xs font-medium truncate">{cmd.phrase}</p>
              <p className="text-[10px] text-muted-foreground">{cmd.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <div className="p-4 border-t border-white/10 max-h-48 overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-2">Recent commands</p>
          <div className="space-y-2">
            {commandHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
              >
                {item.status === "success" ? (
                  <IconCheck className="h-4 w-4 text-green-400 shrink-0" />
                ) : item.status === "failed" ? (
                  <IconX className="h-4 w-4 text-red-400 shrink-0" />
                ) : (
                  <IconSparkles className="h-4 w-4 text-purple-400 animate-pulse shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{item.command}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
