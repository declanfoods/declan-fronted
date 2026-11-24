import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { userApi, type ReferralsMetrics } from '../api/userApi';
import { formatProfileDate } from '../formatters';

export default function ProfileReferrals() {
  const [referralsOpen, setReferralsOpen] = useState(false);
  const [referrals, setReferrals] =
    useState<ReferralsMetrics | null>(null);

  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');

  const toggleReferrals = async () => {
    setReferralsOpen(!referralsOpen);
    if (referralsOpen || referrals || referralsLoading) return;

    setReferralsLoading(true);
    setReferralsError('');
    try {
      const { data } = await userApi.getReferralsOverview();
      setReferrals(data.data.metrics);
    } catch (error) {
      setReferralsError(getApiErrorMessage(error, 'Failed to load referrals.'));
    } finally {
      setReferralsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleReferrals}
        aria-expanded={referralsOpen}
        className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-primary/5"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-ink">
          <span
            className="text-primary"
            aria-hidden
          >
            ⛁
          </span>

          Referral Dashboard
        </span>

        <span className="text-primary">
          {referralsOpen ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </span>
      </button>

      {referralsOpen && (
        <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">

          {referralsLoading && (
            <p className="animate-pulse py-6 text-center text-sm font-medium text-primary">
              Loading referrals...
            </p>
          )}

          {referralsError && (
            <p className="py-4 text-center text-sm font-medium text-red-600">
              {referralsError}
            </p>
          )}

          {referrals && (
            <div className="flex flex-col gap-4">

              <div className="grid grid-cols-3 gap-3">

                <div className="rounded-xl bg-primary/10 p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {referrals.totalDirectReferrals}
                  </p>

                  <p className="mt-1 text-xs font-medium text-ink-soft">
                    Total
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {referrals.totalActiveReferrals}
                  </p>

                  <p className="mt-1 text-xs font-medium text-ink-soft">
                    Active
                  </p>
                </div>

                <div className="rounded-xl bg-primary/5 p-3 text-center">
                  <p className="break-all text-sm font-bold text-primary">
                    {referrals.referralCode}
                  </p>

                  <p className="mt-1 text-xs font-medium text-ink-soft">
                    Your Code
                  </p>
                </div>
              </div>

              {referrals.referrals.length ===
              0 ? (
                <p className="py-4 text-center text-sm text-ink-soft">
                  No referrals yet. Share your
                  code to start earning!
                </p>
              ) : (
                <div className="flex flex-col gap-2">

                  <p className="text-sm font-bold text-ink">
                    Your Referrals
                  </p>

                  {referrals.referrals.map(
                    (person, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-muted bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {person.firstName}{' '}
                            {person.lastName}
                          </p>

                          <p className="text-xs text-ink-soft">
                            Joined{' '}
                            {formatProfileDate(
                              person.dateJoined
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {
                              person.numberOfDeliveredOrders
                            }{' '}
                            orders
                          </p>

                          <p className="text-xs text-ink-soft">
                            {formatNaira(
                              Number(
                                person.totalAmountOfDeliveredOrders
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              <a
                href="/app/referrals"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                View Full Referral Dashboard ❯
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
