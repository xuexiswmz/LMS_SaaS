import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  className?: string;
}

const CountdownTimer = ({
  initialSeconds,
  onComplete,
  className = "",
}: CountdownTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  return (
    <div className={`text-sm text-muted-foreground ${className}`}>
      {seconds > 0 ? <Button>resend after {seconds}s</Button> : ""}
    </div>
  );
};

export default CountdownTimer;
