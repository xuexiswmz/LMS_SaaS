import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EmailFormProps {
  control: any;
  isLoading: boolean;
}

export const EmailForm = ({ control, isLoading }: EmailFormProps) => (
  <FormField
    control={control}
    name="email"
    render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            placeholder="name@example.com"
            {...field}
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
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
