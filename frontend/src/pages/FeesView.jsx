import React, { useState, useEffect } from 'react';
import { Receipt, CheckCircle, Clock, AlertCircle, CreditCard, Printer, X, ShieldCheck } from 'lucide-react';
import erpApi from '../api/client';

export default function FeesView({ onRefreshParent }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paying, setPaying] = useState(false);
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
      const res = await erpApi.payFee(fee.id, 'Online UPI (Auto-Settled)');
      setReceiptFee(res.fee);
      setSelectedFee(null);
      await fetchFees();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setPaying(false);
    }
  };

  const totalPaid = fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + parseFloat(f.amount), 0);
  const totalDue = fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + parseFloat(f.amount), 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Account Summary */}
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-icon success">
            <CheckCircle size={26} />
          </div>
          <div className="stat-info">
            <h4>Total Settled Fees</h4>
            <div className="stat-value">₹{totalPaid.toLocaleString()}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Official receipts verified</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className={`stat-icon ${totalDue > 0 ? 'warning' : 'success'}`}>
            <Receipt size={26} />
          </div>
          <div className="stat-info">
            <h4>Outstanding Dues</h4>
            <div className="stat-value" style={{ color: totalDue > 0 ? '#fbbf24' : '#34d399' }}>
              ₹{totalDue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {totalDue > 0 ? 'Pending clearance' : 'All clear for semester'}
            </span>
          </div>
        </div>
      </div>

      {/* Invoices and Payments */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Fee Invoices & Payment Ledger</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Year 2026-2027</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Voucher Description</th>
                <th>Semester</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Transaction / Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{fee.title}</td>
                  <td>Sem {fee.semester}</td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>₹{parseFloat(fee.amount).toLocaleString()}</strong>
                  </td>
                  <td>{fee.due_date}</td>
                  <td>
                    <span className={`badge ${fee.status === 'paid' ? 'badge-success' : fee.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                      {fee.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {fee.status === 'paid' ? (
                      <div>
                        <div style={{ color: '#818cf8', fontWeight: '600' }}>{fee.transaction_id}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{fee.payment_mode}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Pending Payment</span>
                    )}
                  </td>
                  <td>
                    {fee.status === 'paid' ? (
                      <button
                        className="btn btn-outline"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        onClick={() => setReceiptFee(fee)}
                      >
                        <Printer size={13} />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        onClick={() => setSelectedFee(fee)}
                      >
                        <CreditCard size={13} />
                        <span>Pay Online</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {selectedFee && (
        <div className="modal-overlay" onClick={() => setSelectedFee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="flex-between" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <ShieldCheck size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Fee Payment Gateway</h3>
              </div>
              <button onClick={() => setSelectedFee(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paying for:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedFee.title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#34d399', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
                  ₹{parseFloat(selectedFee.amount).toLocaleString()}
                </div>
              </div>

              <div className="form-group">
                <label>Select Payment Mode</label>
                <select className="form-control" defaultValue="upi">
                  <option value="upi">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="netbanking">Internet Banking (HDFC / SBI / ICICI)</option>
                  <option value="card">Debit / Credit Card</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={paying}
                onClick={() => handlePay(selectedFee)}
              >
                {paying ? 'Processing Payment...' : `Confirm & Pay ₹${parseFloat(selectedFee.amount).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptFee && (
        <div className="modal-overlay" onClick={() => setReceiptFee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="flex-between" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <CheckCircle size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Fee Payment Receipt</h3>
              </div>
              <button onClick={() => setReceiptFee(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', background: 'var(--bg-modal)' }}>
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>APEX INSTITUTE OF TECHNOLOGY</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Student Accounts & Finance Division</div>
                </div>

                <div className="flex flex-col gap-2" style={{ fontSize: '0.85rem' }}>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
                    <strong style={{ color: '#818cf8' }}>{receiptFee.transaction_id}</strong>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Fee Description:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{receiptFee.title}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Payment Date:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{receiptFee.payment_date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{receiptFee.payment_mode}</span>
                  </div>
                  <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Amount Paid:</span>
                    <strong style={{ color: '#34d399', fontSize: '1.2rem' }}>₹{parseFloat(receiptFee.amount).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2" style={{ marginTop: '20px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Print Receipt</span>
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setReceiptFee(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
