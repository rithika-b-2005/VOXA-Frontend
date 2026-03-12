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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPForm({
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
            Enter verification code
          </CardTitle>
          <CardDescription className="text-white/70">
            We sent a 6-digit code to your Mobile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <InputOTP maxLength={6} id="otp" required>
                  <InputOTPGroup className="gap-2.5 ml-15">
                    <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white rounded-md" />
                    <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white rounded-md" />
                    <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white rounded-md" />
                    <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white rounded-md" />
                    <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white rounded-md" />
                    <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white rounded-md" />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
              <Field className="gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full text-black font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #c0c0c0, #e0e0e0, #a0a0a0, #ffffff)'
                  }}
                >
                  Verify
                </Button>
                <FieldDescription className="text-center text-white/70">
                  Didn&apos;t receive the code?{" "}
                  <a href="#" className="text-white underline-offset-4 hover:underline">
                    Resend
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
