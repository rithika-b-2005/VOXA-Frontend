'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push('/Dashboard')
    } else {
      setError(result.error || "Login failed")
    }
    setIsLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-black/80 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle
            className="text-2xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff, #c0c0c0, #e0e0e0, #a0a0a0, #ffffff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Login to your account
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="p-3 rounded-md bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email" className="text-white/90">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-white/90">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm text-white/70 underline-offset-4 hover:underline hover:text-white"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </Field>
              <Field className="gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-black font-semibold disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #c0c0c0, #e0e0e0, #a0a0a0, #ffffff)'
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center text-white/70">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="text-white underline-offset-4 hover:underline">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
