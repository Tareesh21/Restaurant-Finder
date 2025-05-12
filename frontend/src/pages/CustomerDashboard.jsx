import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [search, setSearch]     = useState({ city:'', zip:'', cuisine:'', minRating:'', date:'', time:'', people:1 });
  const [results, setResults]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRest, setSelectedRest]   = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [newReview, setNewReview] = useState({ rating:5, comment:'' });

  const handleChange       = e => setSearch(s => ({ ...s, [e.target.name]: e.target.value }));
  const handleReviewChange = e => setNewReview(r => ({ ...r, [e.target.name]: e.target.value }));

  const searchRestaurants = async () => {
    const params = {};
    Object.entries(search).forEach(([k,v]) => {
      if (v !== '' && v != null) params[k] = v;
    });
    try {
      const { data } = await axios.get('/customer/search', { params });
      setResults(data);
    } catch (err) {
      console.error('Search error', err);
    }
  };

  const openTimeModal = rest => {
    setShowTimeModal({
      id: rest._id,
      name: rest.name,
      times: rest.bookingTimes || [],
      people: search.people
    });
  };

  const bookTable = async (restaurantId, time, numPeople) => {
    if (!search.date) {
      alert("Please pick a date before booking.");
        return;
    }
    try {
      await axios.post('/customer/book', {
        restaurantId,
        date : search.date,
        time,
        numPeople: parseInt(numPeople)
      });
      alert('Booked successfully and confirmation send to mail');
      await fetchMyBookings();
      await searchRestaurants();     
      setShowTimeModal(null);
    } catch (err) {
      console.error('Booking error:', err);
      alert(`Booking error: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/customer/my-bookings');
      setBookings(data);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    }
  };

  const cancelBooking = async id => {
    try {
      await axios.delete(`/customer/cancel/${id}`);
      fetchMyBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      alert(`Error cancelling booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const submitReview = async restaurantId => {
    try {
      await axios.post(`/customer/review/${restaurantId}`, {
        rating: parseInt(newReview.rating),
        comment: newReview.comment
      });
      alert("Review Submitted")
      // refresh single restaurant to pick up new avgRating
      const { data } = await axios.get(`/customer/get-restaurant/${restaurantId}`);
      setResults(r => r.map(x => x._id === restaurantId ? data : x));
      setShowReviewForm(null);
    } catch (err) {
      console.error('Review error:', err);
      alert('Failed to submit review');
    }
  };

  const viewReviews = async rest => {
    try {
      const { data } = await axios.get(`/customer/get-restaurant/${rest._id}`);
      setSelectedRest(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const closeModal = () => {
    setSelectedRest(null);
    setShowTimeModal(null);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    fetchMyBookings();
    // reset “timesBookedToday” at midnight
    const now   = new Date();
    const next  = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    const delay = next - now;
    const tid   = setTimeout(() => {
      setResults(r => r.map(x => ({ ...x, timesBookedToday: 0 })));
    }, delay);
    return () => clearTimeout(tid);
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>Customer Dashboard</h1>
        <button className="btn logout-btn" onClick={logout}>Logout</button>
      </header>

      <section className="search-form">
        <input     name="city"      placeholder="City"       value={search.city}      onChange={handleChange} />
        <input     name="zip"       placeholder="Zip Code"   value={search.zip}       onChange={handleChange} />
        <select    name="cuisine"   value={search.cuisine}   onChange={handleChange}>
          <option value="">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Indian">Indian</option>
          <option value="Mexican">Mexican</option>
        </select>
        <select    name="minRating" value={search.minRating} onChange={handleChange}>
          <option value="">Any Rating</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>≥ {n} ⭐</option>)}
        </select>
        <input     name="date" type="date"  value={search.date}  onChange={handleChange} />
        {/* <input     name="time" type="time"  value={search.time}  onChange={handleChange} />
        <input     name="people" type="number" min="1" max="10" value={search.people} onChange={handleChange} /> */}
        <button className="btn search-btn" onClick={searchRestaurants}>Search</button>
      </section>

      <h2 className="section-title">Results</h2>
      <div className="cards-grid">
        {results.length === 0 && <p className="no-items">No restaurants found.</p>}
        {results.map(rest => {
          const mapsUrl = 
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${rest.address}, ${rest.city}, ${rest.state} ${rest.zipCode}`
            )}`;
          return (
            <div key={rest._id} className="card">
              <img className="card-img" src={rest.photos[0]} alt={rest.name} />
              <div className="card-body">
                <h3 className="card-title">{rest.name}</h3>
                <p className="card-sub">
                  {rest.city} — {rest.cuisine} | 💵 {rest.cost} | ⭐{' '}
                  {rest.avgRating!=null ? rest.avgRating.toFixed(1) : 'N/A'}{' '}
                  | Number of times booked - {rest.timesBookedToday} today
                </p>
                <div className="card-actions">
                  <button className="btn" onClick={() => openTimeModal(rest)}>Book</button>
                  <button className="btn" onClick={() => {
                    setNewReview({ rating:5, comment:'' });
                    setShowReviewForm(rest._id);
                  }}>Leave Review</button>
                  <button className="btn" onClick={() => viewReviews(rest)}>View Reviews</button>
                  <button className="btn" onClick={() => window.open(mapsUrl,'_blank')}>View on Map</button>
                </div>

                {/* inline review form */}
                {showReviewForm === rest._id && (
                  <div className="review-form">
                    <select name="rating" value={newReview.rating} onChange={handleReviewChange}>
                      {[1,2,3,4,5].map(n=> <option key={n} value={n}>⭐ {n}</option>)}
                    </select>
                    <input name="comment" placeholder="Write a review…" value={newReview.comment}
                           onChange={handleReviewChange} />
                    <button className="btn submit" onClick={()=>submitReview(rest._id)}>Submit</button>
                    <button className="btn cancel" onClick={()=>setShowReviewForm(null)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">My Bookings</h2>
      <ul className="booking-list">
        {bookings.length === 0 && <li>No bookings yet.</li>}
        {bookings.map(b => (
          <li key={b._id}>
            <span>📅 {b.date} @ {b.time} → {b.restaurant?.name||'Unknown'}</span>
            <button className="btn cancel" onClick={()=>cancelBooking(b._id)}>Cancel</button>
          </li>
        ))}
      </ul>

      {/* Reviews modal */}
      {selectedRest && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>Reviews for {selectedRest.name}</h2>
            {(!selectedRest.reviews || !selectedRest.reviews.length)
              ? <p>No reviews yet.</p>
              : <ul className="reviews-list">
                  {selectedRest.reviews.map((r,i)=>(
                    <li key={i}>⭐ {r.rating} – {r.comment||'No comment'}{r.user?.name&&` (by ${r.user.name})`}</li>
                  ))}
                </ul>
            }
            <button className="btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Time-slot + seating modal */}
      {showTimeModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>Select a time slot for {showTimeModal.name}</h2>

            <div className="seating-control">
              <span className="people-icon">👤</span>
              <input
                type="number"
                className="people-input"
                min="1" max="10"
                value={showTimeModal.people}
                onChange={e => setShowTimeModal(m=>({
                  ...m,
                  people: Math.min(10, Math.max(1, parseInt(e.target.value)||1))
                }))}
              />
              <span>people</span>
            </div>

            <div className="times-list">
              {showTimeModal.times.length === 0
                ? <p>No slots available.</p>
                : showTimeModal.times.map((t,i)=>(
                    <button key={i}
                      className="btn time-slot"
                      onClick={()=>bookTable(showTimeModal.id, t, showTimeModal.people)}
                    >{t}</button>
                  ))
              }
            </div>

            <button className="btn cancel" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;


















