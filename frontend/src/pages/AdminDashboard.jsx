import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pendingOnly, setPendingOnly] = useState(true);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true }); // 👈 avoids back button returning to dashboard
};

  const fetchRestaurants = async () => {
    try {
      const endpoint = pendingOnly ? '/admin/pending' : '/admin/restaurants';
      const res = await axios.get(endpoint);
      setRestaurants(res.data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    }
  };

  const approveRestaurant = async (id) => {
    try {
      await axios.put(`/admin/approve/${id}`);
      fetchRestaurants(); // Refresh list
    } catch (err) {
      alert('Approval failed');
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      await axios.delete(`/admin/remove/${id}`);
      fetchRestaurants(); // Refresh list
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [pendingOnly]);

  // new: fetch month‑old booking analytics
  const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        alert('Could not load analytics');
      }
    };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={logout} style={{ marginBottom: '1rem' }}>Logout</button>

      <button onClick={() => setPendingOnly(!pendingOnly)}>
        {pendingOnly ? 'View All Restaurants' : 'View Pending Only'}
      </button>

      <button onClick={fetchAnalytics} style={{ marginLeft: 10 }}>
        View Last‑Month Analytics
      </button>

      {restaurants.length === 0 ? (
        <p>No restaurants found.</p>
      ) : (
        <ul>
          {restaurants.map((rest) => (
            <li key={rest._id} style={{ marginBottom: '10px' }}>
              <strong>{rest.name}</strong> ({rest.city}) - Approved: {rest.approved ? '✅' : '❌'}
              <div>
                {!rest.approved && (
                  <button onClick={() => approveRestaurant(rest._id)}>✅ Approve</button>
                )}
                <button onClick={() => deleteRestaurant(rest._id)}>🗑️ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ─── Analytics Panel ───────────────────────────────────────────────────── */}
      {analytics && (
        <div style={{ marginTop: 40, padding: 20, border: '1px solid #666' }}>
          <h2>Last 30‑Day Reservations</h2>
          <p><strong>Total bookings:</strong> {analytics.totalBookings}</p>

          {/* group by restaurant name */}
          {analytics.bookings.length > 0 && (
            (() => {
              const counts = analytics.bookings.reduce((acc, b) => {
                const name = b.restaurant?.name || 'Unknown';
                acc[name] = (acc[name] || 0) + 1;
                return acc;
              }, {});
              return (
                <div>
                  <h3>By Restaurant:</h3>
                  <ul>
                    {Object.entries(counts).map(([name, cnt]) => (
                      <li key={name}>
                        {name}: {cnt} booking{cnt > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
