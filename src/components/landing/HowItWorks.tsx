import Container from '../layout/Container';
import Section from '../layout/Section';
import { UserPlus, ShoppingCart, Share2, ChevronRight } from "lucide-react";




export default function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus size={26} />,
      title: "Sign Up",
      body: "Create your account and get your unique referral code",
    },
    {
      icon: <ShoppingCart size={26} />,
      title: "Shop & Earn",
      body: "Place orders above ₦15,000 monthly to qualify for rewards",
    },
    {
      icon: <Share2 size={26} />,
      title: "Refer & Grow",
      body: "Share your code and earn ₦300 per successful referral",
    },
  ];

  return (
    <Section>
      <Container>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-base font-semibold text-primary">
            How to get started
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-primary">More Than Just Food </span>
            <span className="text-accent">Delivery</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary">
            Enjoy cashback, referral rewards, and flexible bundle options
            while shopping for your daily essentials
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center relative"
            >
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full shadow-md text-white bg-primary">
                {step.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-primary">
                {step.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-gray-600">
                {step.body}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-8 -right-6 z-10">
                  <ChevronRight size={28} className="text-primary opacity-40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}