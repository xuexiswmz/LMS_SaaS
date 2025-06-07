import React from "react";
import SubscriptionSection from "@/components/subscription/SubscriptionSection";

const SubscriptionPage = () => {
  return (
    <div className="container mx-auto px-4 align-center">
      <div className="text-conter py-12">
        <h1 className="text-4xl font-bold">Select the plan you want</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Flexible subscription options to meet your learning needs
        </p>
      </div>
      <SubscriptionSection />
    </div>
  );
};

export default SubscriptionPage;
