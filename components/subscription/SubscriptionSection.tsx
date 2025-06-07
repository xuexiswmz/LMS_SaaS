"use client";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";

const SubscriptionSection = () => {
  const handleSelectPlan = (
    billingCycle: "monthly" | "quarterly" | "yearly",
  ) => {
    console.log(billingCycle);
  };
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 py-12">
      <SubscriptionCard
        title={"Monthly Subscription"}
        price={39}
        billingCycle={"monthly"}
        features={[
          "Access to basic courses",
          "Monthly content updates",
          "Community support",
          "1 learning project",
        ]}
        onSelect={handleSelectPlan}
      />
      <SubscriptionCard
        title={"Quarterly Subscription"}
        price={99}
        billingCycle={"quarterly"}
        features={[
          "All monthly features",
          "Save 15%",
          "Priority support",
          "3 learning project",
        ]}
        onSelect={handleSelectPlan}
      />
      <SubscriptionCard
        title={"Yearly Subscription"}
        price={249}
        billingCycle={"yearly"}
        features={[
          "All quarterly features",
          "Save 25%",
          "VIP support",
          "Unlimited learning projects",
        ]}
        onSelect={handleSelectPlan}
      />
    </div>
  );
};

export default SubscriptionSection;
