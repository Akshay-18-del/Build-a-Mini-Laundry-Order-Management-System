import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Search, ListOrdered, Calendar, RefreshCw } from 'lucide-react';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', customerName: '', phone: '', garmentType: '' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const { data } = await api.get(`/orders?${params.toString()}`);
      setOrders(data);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filters.status, filters.garmentType]);

  const handleSearch = (e) => { e.preventDefault(); fetchOrders(); };
  const handleFilter = (e) => { setFilters({ ...filters, [e.target.name]: e.target.value }); };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      setOrders(orders.map((o) => o._id === id ? { ...o, status: newStatus } : o));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getBadgeClass = (s) => {
    const map = { RECEIVED: 'badge-received', PROCESSING: 'badge-processing', READY: 'badge-ready', DELIVERED: 'badge-delivered' };
    return `badge ${map[s] || ''}`;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ListOrdered size={24} style={{ color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Orders</h1>
        </div>
        <button onClick={fetchOrders} className="btn-secondary" style={{ fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input name="customerName" placeholder="Customer name" value={filters.customerName} onChange={handleFilter} className="input-field" style={{ paddingLeft: 34, fontSize: 13 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input name="phone" placeholder="Phone number" value={filters.phone} onChange={handleFilter} className="input-field" style={{ paddingLeft: 34, fontSize: 13 }} />
          </div>
          <select name="status" value={filters.status} onChange={handleFilter} className="select-field" style={{ fontSize: 13 }}>
            <option value="">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <select name="garmentType" value={filters.garmentType} onChange={handleFilter} className="select-field" style={{ fontSize: 13 }}>
              <option value="">All Garments</option>
              <option value="Shirt">Shirt</option>
              <option value="Pants">Pants</option>
              <option value="Saree">Saree</option>
            </select>
            <button type="submit" className="btn-primary" style={{ padding: '10px 16px', flexShrink: 0 }}>Go</button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Garments</th>
                <th>Delivery</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-blue)' }}>
                      {order.orderId?.substring(0, 8)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{order.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.phone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {order.garments?.map((g, i) => (
                        <span key={i} style={{
                          padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                          background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc',
                        }}>
                          {g.quantity}× {g.type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <Calendar size={13} />
                      {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>₹{order.totalAmount}</td>
                  <td><span className={getBadgeClass(order.status)}>{order.status}</span></td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="select-field"
                      style={{ fontSize: 12, padding: '6px 28px 6px 10px', minWidth: 130 }}
                    >
                      <option value="RECEIVED">Received</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="READY">Ready</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
