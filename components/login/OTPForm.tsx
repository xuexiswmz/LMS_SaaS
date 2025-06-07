import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CountdownTimer from "@/components/CountdownTimer";

interface OTPFormProps {
  otpCode: string;
  setOtpCode: (code: string) => void;
  isLoading: boolean;
  canResend: boolean;
  setCanResend: (canResend: boolean) => void;
  handleResend: () => Promise<void>;
}

export const OTPForm = ({
  otpCode,
  setOtpCode,
  isLoading,
  canResend,
  setCanResend,
  handleResend,
}: OTPFormProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <div className="flex-1 spacy-y-1">
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          id="otp"
          placeholder="123456"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          disabled={isLoading}
        />
      </div>
      {!canResend ? (
        <CountdownTimer
          initialSeconds={60}
          onComplete={() => setCanResend(true)}
          className="mt-4 h-10"
        />
      ) : (
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={async () => {
            setCanResend(false);
            await handleResend();
          }}
          className="mt-4 h-10"
        >
          Resend
        </Button>
      )}
    </div>
    <p className="text-sm text-muted-foreground">
      Enter the 6-digit code sent to your email address.
    </p>
  </div>
);
