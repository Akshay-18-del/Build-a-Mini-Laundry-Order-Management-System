import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Plus, Trash2, IndianRupee, PlusCircle, CheckCircle, Calendar, Hash } from 'lucide-react';

const PRICE_LIST = { Shirt: 50, Pants: 80, Saree: 100 };

const CreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [garments, setGarments] = useState([{ type: 'Shirt', quantity: 1 }]);

  const addGarment = () => setGarments([...garments, { type: 'Shirt', quantity: 1 }]);
  const removeGarment = (i) => {
    if (garments.length > 1) setGarments(garments.filter((_, idx) => idx !== i));
    else toast.error('Need at least one garment');
  };
  const updateGarment = (i, field, val) => {
    const g = [...garments];
    g[i][field] = field === 'quantity' ? Math.max(1, parseInt(val) || 1) : val;
    setGarments(g);
  };

  const total = garments.reduce((s, g) => s + PRICE_LIST[g.type] * g.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone) return toast.error('Fill in customer details');
    if (!/^\d{10}$/.test(phone)) return toast.error('Phone must be 10 digits');

    setLoading(true);
    setSuccessData(null);
    try {
      const { data } = await api.post('/orders', { customerName, phone, garments });
      toast.success('Order created!');
      setSuccessData(data);
      setCustomerName(''); setPhone(''); setGarments([{ type: 'Shirt', quantity: 1 }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <PlusCircle size={24} style={{ color: 'var(--accent-blue)' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>New Order</h1>
      </div>

      {/* Success Card */}
      {successData && (
        <div className="glass-card" style={{
          padding: 24, marginBottom: 24,
          borderLeft: '4px solid var(--accent-green)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CheckCircle size={20} color="var(--accent-green)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-green)' }}>Order Created Successfully!</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hash size={14} color="var(--text-secondary)" />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Order ID</p>
                <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{successData.orderId?.substring(0, 12)}...</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IndianRupee size={14} color="var(--text-secondary)" />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total</p>
                <p style={{ fontSize: 18, fontWeight: 700 }}>₹{successData.totalAmount}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} color="var(--text-secondary)" />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Est. Delivery</p>
                <p style={{ fontSize: 13, fontWeight: 500 }}>
                  {new Date(successData.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => setSuccessData(null)} className="btn-secondary" style={{ marginTop: 16, fontSize: 13 }}>
            <Plus size={14} /> Create Another
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Section */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Customer Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Rahul Sharma" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" className="input-field" required />
            </div>
          </div>
        </div>

        {/* Garments Section */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>Garments</h2>
            <button type="button" onClick={addGarment} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {garments.map((g, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'end', padding: 14,
                borderRadius: 10, background: 'var(--bg-input)',
                border: '1px solid var(--border-color)', flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Type</label>
                  <select value={g.type} onChange={(e) => updateGarment(i, 'type', e.target.value)} className="select-field">
                    <option value="Shirt">Shirt — ₹50</option>
                    <option value="Pants">Pants — ₹80</option>
                    <option value="Saree">Saree — ₹100</option>
                  </select>
                </div>
                <div style={{ flex: '0 0 100px' }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Qty</label>
                  <input type="number" min="1" value={g.quantity} onChange={(e) => updateGarment(i, 'quantity', e.target.value)} className="input-field" />
                </div>
                <div style={{ flex: '0 0 80px', textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Subtotal</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-blue)' }}>₹{PRICE_LIST[g.type] * g.quantity}</p>
                </div>
                <button type="button" onClick={() => removeGarment(i)} className="btn-danger" style={{ flexShrink: 0 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary & Submit */}
        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Estimated Total</span>
            <span style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={20} style={{ marginRight: 2 }} />{total}
            </span>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            {loading ? 'Creating...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
