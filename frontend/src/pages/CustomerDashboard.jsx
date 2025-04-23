import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState({
    city: '',
    date: '',
    time: '',
    people: 1,
    zip: '',
    cuisine: '',
    minRating: ''
  });
  const [results, setResults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null); // for viewing reviews
  const [showReviewForm, setShowReviewForm] = useState(null); // restaurantId
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setSearch(s => ({ ...s, [name]: value }));
  };

  const searchRestaurants = async () => {
    const params = {};
    Object.entries(search).forEach(([k, v]) => {
      if (v !== '' && v != null) params[k] = v;
    });
    try {
      const res = await axios.get('/customer/search', { params });
      setResults(res.data);
    } catch (err) {
      console.error('Search error', err);
    }
  };

  const bookTable = async (restaurantId) => {
    try {
      const { date, time, people } = search;
      const res = await axios.post('/customer/book', {
        restaurantId,
        date,
        time,
        numPeople: parseInt(people)
      });
      alert(res.data.message);
      fetchMyBookings();
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message);
      alert(`Booking error: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('/customer/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await axios.delete(`/customer/cancel/${id}`);
      fetchMyBookings();
    } catch (err) {
      console.error('Cancel error:', err.response?.data || err.message);
      alert(`Error cancelling booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const submitReview = async (restaurantId) => {
    try {
      await axios.post(`/customer/review/${restaurantId}`, {
        rating: parseInt(newReview.rating),
        comment: newReview.comment
      });
      alert('Review submitted!');
      setShowReviewForm(null);
      const res = await axios.get(`/customer/get-restaurant/${restaurantId}`);
      const updatedRestaurant = res.data;

      const reviews = updatedRestaurant.reviews || [];
      const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
      updatedRestaurant.avgRating = avg;

      setResults(prev =>
        prev.map(r => r._id === restaurantId ? updatedRestaurant : r)
      );
    } catch (err) {
      console.error('Review error:', err.response?.data || err.message);
      alert('Failed to submit review');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const viewReviews = async (restaurant) => {
    try {
      const { data } = await axios.get(`/customer/get-restaurant/${restaurant._id}`);
      setSelectedRest(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const closeModal = () => {
    setSelectedRest(null);
  };

  useEffect(() => {
    window.history.replaceState(null, '', window.location.href);
    const handlePopState = () => window.history.go(1);
    window.addEventListener('popstate', handlePopState);
    fetchMyBookings();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div>
      <h1>Customer Dashboard</h1>
      <button onClick={logout} style={{ marginBottom: '1rem' }}>Logout</button>

      {/* Search Inputs */}
      <div style={{ marginBottom: 20 }}>
        <input
          name="city"
          placeholder="City"
          value={search.city}
          onChange={handleChange}
        />
        <input
          name="zip"
          placeholder="Zip Code"
          value={search.zip}
          onChange={handleChange}
          style={{ width: 100, marginLeft: 8 }}
        />
        <select
          name="cuisine"
          value={search.cuisine}
          onChange={handleChange}
          style={{ marginLeft: 8 }}
        >
          <option value="">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Indian">Indian</option>
          <option value="Mexican">Mexican</option>
        </select>
        <select
          name="minRating"
          value={search.minRating}
          onChange={handleChange}
          style={{ marginLeft: 8 }}
        >
          <option value="">Any Rating</option>
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>≥ {n} ⭐</option>
          ))}
        </select>
        <input
          name="date"
          type="date"
          value={search.date}
          onChange={handleChange}
          style={{ marginLeft: 8 }}
        />
        <input
          name="time"
          type="time"
          value={search.time}
          onChange={handleChange}
          style={{ marginLeft: 8 }}
        />
        <input
          name="people"
          type="number"
          min="1"
          value={search.people}
          onChange={handleChange}
          style={{ width: 60, marginLeft: 8 }}
        />
        <button onClick={searchRestaurants} style={{ marginLeft: 8 }}>
          Search
        </button>
      </div>

      {/* Results */}
      <h2>Results</h2>
      {results.length === 0 ? (
        <p>No restaurants found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map(rest => {
            // 1) build the address string
            const fullAddr = `${rest.address}, ${rest.city}, ${rest.state} ${rest.zipCode}`;
            // 2) generate the Google Maps query URL
            const mapsUrl =
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;

            return (
              <li key={rest._id} style={{ display: 'flex', marginBottom: 16 }}>
                <img
                  src={rest.photos[0]}
                  alt={rest.name}
                  style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <h3>{rest.name}</h3>
                  <p>
                    {rest.city} — {rest.cuisine} | 💵 {rest.cost} | ⭐{' '}
                    {rest.avgRating != null ? rest.avgRating.toFixed(1) : 'N/A'}
                  </p>

                  <button onClick={() => bookTable(rest._id)} style={{ marginRight: 10 }}>
                    Book
                  </button>
                  <button onClick={() => setShowReviewForm(rest._id)} style={{ marginRight: 10 }}>
                    Leave Review
                  </button>
                  <button onClick={() => viewReviews(rest)} style={{ marginRight: 10 }}>
                    View Reviews
                  </button>

                  {/* ─── Single “View on Map” button ────────────────────────── */}
                  <button
                    onClick={() => window.open(mapsUrl, '_blank', 'noopener')}
                    style={{ marginTop: 8 }}
                  >
                    View on Map
                  </button>

                  {/* Inline review form (unchanged) */}
                  {showReviewForm === rest._id && (
                    <div style={{ marginTop: '10px' }}>
                      <select
                        name="rating"
                        value={newReview.rating}
                        onChange={handleReviewChange}
                      >
                        <option value="1">⭐ 1</option>
                        <option value="2">⭐ 2</option>
                        <option value="3">⭐ 3</option>
                        <option value="4">⭐ 4</option>
                        <option value="5">⭐ 5</option>
                      </select>
                      <input
                        type="text"
                        name="comment"
                        placeholder="Write a review..."
                        value={newReview.comment}
                        onChange={handleReviewChange}
                        style={{ marginLeft: '10px' }}
                      />
                      <button onClick={() => submitReview(rest._id)} style={{ marginLeft: '10px' }}>
                        Submit
                      </button>
                      <button onClick={() => setShowReviewForm(null)} style={{ marginLeft: '5px' }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* My Bookings */}
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bookings.map((booking) => (
            <li key={booking._id} style={{ marginBottom: '0.5rem' }}>
              📅 {booking.date} @ {booking.time} → {booking.restaurant?.name || 'Unknown'}
              <button
                onClick={() => cancelBooking(booking._id)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Reviews Modal */}
      {selectedRest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 5, width: 400, color: 'black' }}>
            <h2>Reviews for {selectedRest.name}</h2>
            {selectedRest.reviews?.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <ul>
                {selectedRest.reviews.map((r, i) => (
                  <li key={i}>
                    ⭐ {r.rating} – {r.comment?.trim() || 'No comment'}{r.user?.name && ` (by ${r.user.name})`}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={closeModal} style={{ marginTop: 10 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
