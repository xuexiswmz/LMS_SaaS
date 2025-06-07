import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface PasswordFormProps {
  control: Control;
  isLoading: boolean;
}

export const PasswordForm = ({ control, isLoading }: PasswordFormProps) => (
  <FormField
    control={control}
    name="password"
    render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input
            placeholder="********"
            {...field}
            type="password"
            disabled={isLoading}
          />
        </FormControl>
        {fieldState.error && (
          <FormMessage>{fieldState.error.message}</FormMessage>
        )}
      </FormItem>
    )}
  />
);
