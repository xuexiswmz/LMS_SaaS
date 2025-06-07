"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BillingCycle = "monthly" | "quarterly" | "yearly";
interface SubscriptionCardProps {
  title: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isPopular?: boolean;
  onSelect: (cycle: BillingCycle) => void;
}
const SubscriptionCard = ({
  title,
  price,
  billingCycle,
  features,
  isPopular,
  onSelect,
}: SubscriptionCardProps) => {
  return (
    <Card
      className={`w-full max-w-md${isPopular ? `border-2 border-primary` : ""}`}
    >
      {isPopular && (
        <div className="bg-primary text-white text-center py-1 text-sm font-medium">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-4xl font-bold">￥{price}</span>
          <span className="text-muted-foreground">/{billingCycle}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2">✅</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onSelect(billingCycle)}>
          subscribe now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;
