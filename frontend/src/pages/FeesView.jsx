import React, { useState, useEffect } from 'react';
import erpApi from '../api/client';

export default function FeesView({ onRefreshParent }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI Instant Clearing (Google Pay / PhonePe)');
  const [payError, setPayError] = useState(null);
  const [receiptFee, setReceiptFee] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await erpApi.getFees();
      setFees(data);
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (fee) => {
    try {
      setPaying(true);
      setPayError(null);
      const res = await erpApi.payFee(fee.id, paymentMode);
      setReceiptFee(res.fee);
      setSelectedFee(null);
      await fetchFees();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Payment error:', err);
      setPayError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const totalPaid = fees
    .filter((f) => f.status === 'paid')
    .reduce((acc, f) => acc + parseFloat(f.amount), 0);
  const totalDue = fees
    .filter((f) => f.status !== 'paid')
    .reduce((acc, f) => acc + parseFloat(f.amount), 0);
  const paidCount = fees.filter((f) => f.status === 'paid').length;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Office of the University Bursar
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Fiscal Year 2025–2026 • Student Financial Services
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Financial Operations &amp; Tuition Ledger
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Student Accounts &amp; Disbursement Division
            </span>
            <span className="text-outline-variant">•</span>
            <span>Automated UPI / NEFT Clearing</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">
              {paidCount} of {fees.length} Vouchers Settled
            </span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            <span>Export Ledger</span>
          </button>
          <button
            onClick={fetchFees}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">sync</span>
            <span>Sync Bursar</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Settled Tuition
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              ₹{totalPaid.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">check_circle</span> Verified
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Receipts Issued
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Cleared Vouchers</span>
            <span className="font-semibold text-on-surface">{paidCount} Vouchers</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Outstanding Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              ₹{totalDue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {totalDue > 0 ? (
                <span className="inline-flex items-center text-error bg-error/10 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">warning</span> Action Due
                </span>
              ) : (
                <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  Zero Balance
                </span>
              )}
              <span className="font-body-sm text-body-sm text-on-surface-variant">Current Term</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Registration Hold</span>
            <span className={`font-semibold ${totalDue > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
              {totalDue > 0 ? 'Pending Clearance' : 'Released'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Payment Gateway
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">bolt</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              Instant
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                UPI / NetBanking
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Zero Surcharge</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Settlement SLA</span>
            <span className="font-semibold text-on-surface">Real-Time</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Bursar Audit
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">policy</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              Active
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                No Penalties
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Standing</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Financial Aid</span>
            <span className="font-semibold text-secondary">Eligible</span>
          </div>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-lg flex items-center justify-between border-b border-surface-container">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Fee Vouchers &amp; Transaction History
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Itemized tuition, examination, and laboratory fee assessments
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold uppercase">
            AY 2025–2026
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Voucher Description</th>
                <th>Semester</th>
                <th>Assessed Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Transaction Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-on-surface-variant">
                    Synchronizing bursar ledger...
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="font-semibold text-on-surface">{fee.title}</td>
                    <td className="text-on-surface-variant">Sem {fee.semester}</td>
                    <td>
                      <span className="font-bold text-on-surface">
                        ₹{parseFloat(fee.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="text-on-surface-variant">{fee.due_date}</td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold uppercase ${
                          fee.status === 'paid'
                            ? 'bg-surface-container-low text-on-tertiary-container'
                            : fee.status === 'overdue'
                            ? 'bg-error/10 text-error'
                            : 'bg-secondary/10 text-secondary'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.status === 'paid' ? (
                        <div>
                          <div className="font-label-md text-label-md text-secondary font-semibold">
                            {fee.transaction_id}
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">
                            {fee.payment_mode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-outline font-body-sm text-body-sm">
                          Awaiting Disbursement
                        </span>
                      )}
                    </td>
                    <td>
                      {fee.status === 'paid' ? (
                        <button
                          type="button"
                          onClick={() => setReceiptFee(fee)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">receipt_long</span>
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedFee(fee)}
                          className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm transition-all inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">credit_card</span>
                          <span>Pay Online</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {selectedFee && (
        <div className="modal-overlay" onClick={() => setSelectedFee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  University Bursar Payment Gateway
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFee(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-dim">
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Voucher Settlement
                </div>
                <div className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                  {selectedFee.title}
                </div>
                <div className="font-stat-metric text-stat-metric font-bold text-secondary mt-1">
                  ₹{parseFloat(selectedFee.amount).toLocaleString()}
                </div>
              </div>

              {payError && (
                <div className="p-space-sm rounded-lg bg-error/10 text-error font-label-md text-label-md">
                  {payError}
                </div>
              )}

              <div className="form-group mb-0">
                <label>Payment Instrument</label>
                <select
                  className="form-control"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="UPI Instant Clearing (Google Pay / PhonePe)">
                    UPI Instant Clearing (Google Pay / PhonePe)
                  </option>
                  <option value="Institutional NetBanking (SBI / HDFC / ICICI)">
                    Institutional NetBanking (SBI / HDFC / ICICI)
                  </option>
                  <option value="Debit / Credit Card (Visa / Mastercard / RuPay)">
                    Debit / Credit Card (Visa / Mastercard / RuPay)
                  </option>
                </select>
              </div>

              <button
                type="button"
                disabled={paying}
                onClick={() => handlePay(selectedFee)}
                className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold shadow-md transition-all"
              >
                {paying
                  ? 'Authorizing Settlement...'
                  : `Authorize & Pay ₹${parseFloat(selectedFee.amount).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptFee && (
        <div className="modal-overlay" onClick={() => setReceiptFee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-tertiary-container">
                  check_circle
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Official Bursar Payment Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptFee(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md">
              <div className="p-space-lg rounded-xl border-2 border-dashed border-surface-dim bg-surface">
                <div className="text-center border-b border-surface-dim pb-space-sm mb-space-md">
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    APEX UNIVERSITY
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Office of the Bursar &amp; Treasury
                  </div>
                </div>

                <div className="space-y-2 font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Transaction Reference:</span>
                    <strong className="text-secondary">{receiptFee.transaction_id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Voucher Description:</span>
                    <span className="font-semibold text-on-surface">{receiptFee.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Settlement Date:</span>
                    <span className="text-on-surface">
                      {receiptFee.payment_date || new Date().toISOString().split('T')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Clearing Channel:</span>
                    <span className="text-on-surface">{receiptFee.payment_mode}</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-dim pt-2 mt-2">
                    <span className="font-bold text-on-surface">Total Settled:</span>
                    <strong className="text-on-tertiary-container text-lg">
                      ₹{parseFloat(receiptFee.amount).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-4 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFee(null)}
                  className="flex-1 py-2 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
