import { Button } from "@/components/ui/button";
import Image from "next/image";

interface OAuthButtonsProps {
  isLoading: boolean;
  handleOAuthLogin: (provider: "github" | "google") => Promise<void>;
}

export const OAuthButtons = ({
  isLoading,
  handleOAuthLogin,
}: OAuthButtonsProps) => (
  <div className="grid grid-cols-2 gap-2">
    <Button
      variant="outline"
      onClick={() => handleOAuthLogin("github")}
      disabled={isLoading}
    >
      {isLoading ? (
        <Image
          src="/icons/spinner.svg"
          alt="spinner"
          width={20}
          height={20}
          className=" animate-spin"
        />
      ) : (
        <Image src="/icons/github.svg" alt="github" width={20} height={20} />
      )}
      Github
    </Button>
    <Button
      variant="outline"
      onClick={() => handleOAuthLogin("google")}
      disabled={isLoading}
    >
      {isLoading ? (
        <Image
          src="/icons/spinner.svg"
          alt="spinner"
          width={20}
          height={20}
          className=" animate-spin"
        />
      ) : (
        <Image
          src="/icons/google.svg"
          alt="google"
          width={20}
          height={20}
          className="w-auto"
        />
      )}
      Google
    </Button>
  </div>
);
