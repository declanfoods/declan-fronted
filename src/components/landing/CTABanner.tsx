
import Container from "../layout/Container";
import { useNavigate } from 'react-router-dom';

export default function CTABanner() {
  const stats = [
    { value: "2,000+", label: "Active Users" },
    { value: "₦500k+", label: "Rewards Paid" },
    { value: "4.9/5", label: "User Rating" },
  ];
const navigate = useNavigate();
  return (
    <section className="py-16 bg-primary">
      <Container className="text-center text-white">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to Start Earning
          <br />
          While Shopping?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base text-white/90">
          Join thousands of smart shoppers who are already earning cashback
          and building their networks with Declan Foods.
        </p>

      <button
  type="button"
  onClick={() => navigate('/signup')}
  className="mt-8 inline-flex items-center justify-center font-semibold rounded-full border-2 border-white bg-white text-primary text-base px-8 py-3.5 transition-all hover:bg-gray-100"
>
  Create Free Account
</button>

        <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/20 pt-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-2xl font-extrabold sm:text-3xl">{s.value}</span>
              <span className="mt-1 text-sm text-white/80">{s.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}