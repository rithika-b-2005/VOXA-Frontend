'use client'

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter your email address and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-white/90">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="team@mynaui.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </Field>
              <Field className="gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full text-black font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #c0c0c0, #e0e0e0, #a0a0a0, #ffffff)'
                  }}
                >
                  Send Reset Email
                </Button>
                <div className="text-center">
                  <a href="/login" className="text-white/70 text-sm underline-offset-4 hover:underline hover:text-white">
                    ← Back to Login
                  </a>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
