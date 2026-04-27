import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { ShoppingBag, IndianRupee, Package, Clock, CheckCircle, Truck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#eab308', '#22c55e', '#64748b'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0,
    statusCounts: { RECEIVED: 0, PROCESSING: 0, READY: 0, DELIVERED: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  }

  const chartData = [
    { name: 'Received', count: stats.statusCounts.RECEIVED },
    { name: 'Processing', count: stats.statusCounts.PROCESSING },
    { name: 'Ready', count: stats.statusCounts.READY },
    { name: 'Delivered', count: stats.statusCounts.DELIVERED },
  ];

  const statusItems = [
    { label: 'Received', count: stats.statusCounts.RECEIVED, icon: Package, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Processing', count: stats.statusCounts.PROCESSING, icon: Clock, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    { label: 'Ready', count: stats.statusCounts.READY, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Delivered', count: stats.statusCounts.DELIVERED, icon: Truck, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <TrendingUp size={24} style={{ color: 'var(--accent-blue)' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard</h1>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card stat-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} color="#818cf8" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Orders</p>
            <p style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalOrders}</p>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={22} color="#4ade80" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Revenue</p>
            <p style={{ fontSize: 32, fontWeight: 700 }}>₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }} className="dashboard-grid">
        {/* Status Cards */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)' }}>Order Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statusItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10, background: item.bg,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={18} color={item.color} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: 'var(--text-secondary)' }}>Status Breakdown</h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                  contentStyle={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
