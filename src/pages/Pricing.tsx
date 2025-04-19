
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PricingPage = () => {
  const pricingTiers = [
    {
      name: "Basic",
      price: "₹499",
      period: "/month",
      features: [
        "5 Job Applications",
        "3 Mock Interviews",
        "Basic Resume Review",
        "Email Support"
      ]
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      features: [
        "15 Job Applications",
        "10 Mock Interviews",
        "Advanced Resume Review",
        "Priority Support",
        "Career Coaching Session"
      ]
    },
    {
      name: "Enterprise",
      price: "₹1999",
      period: "/month",
      features: [
        "Unlimited Job Applications",
        "Unlimited Mock Interviews",
        "Premium Resume Review",
        "24/7 Priority Support",
        "Weekly Career Coaching",
        "Custom Interview Preparation"
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>
        <div className="grid md:grid-cols-3 gap-8 px-4">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className="p-6">
              <h2 className="text-2xl font-semibold text-center">{tier.name}</h2>
              <div className="text-center mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-600">{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-8">Get Started</Button>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
