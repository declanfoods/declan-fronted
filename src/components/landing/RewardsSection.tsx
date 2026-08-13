import Container from '../layout/Container';
import Section from '../layout/Section';
import SectionHeading from '../ui/SectionHeading';
import RewardCard from './RewardCard';
import { BadgePercent, Users, Package, TrendingUp } from "lucide-react";


export default function RewardsSection() {
  const rewards = [
    {
      icon: <BadgePercent size={22} />,
      title: "1.5% Monthly Cashback",
      body: "Earn cashback rewards on orders above ₦15,000 every month. Save more while shopping for your everyday essentials.",
    },
    {
      icon: <Users size={22} />,
      title: "Referral Network",
      body: "Invite others to join and earn ₦300 per successful referral. The more you refer, the more you earn.",
    },
    {
      icon: <Package size={22} />,
      title: "Prepaid Bundle",
      body: "Unlock a 3% return when you keep your prepaid bundles for 30 days. Simple rewards designed to work for you.",
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Commission System",
      body: "Get 1.5% commission on orders from people in your referral network. The bigger your network, the more you can earn.",
    },
  ];

  return (
    <Section className="relative overflow-hidden bg-[#fafdf8]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full opacity-50 blur-3xl bg-amber-200"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full opacity-50 blur-3xl bg-green-200"
      />

   
  <Container className="relative">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading align="left" className="!text-left">
            Join Our Rewards Network
          </SectionHeading>
          <p className="max-w-sm text-right text-base leading-relaxed text-ink-soft md:text-right">
            Earn cashback, build your network, and unlock exclusive benefits with every
            purchase
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rewards.map((r) => (
            <RewardCard key={r.title} {...r} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

