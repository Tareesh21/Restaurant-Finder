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
        <input     name="time" type="time"  value={search.time}  onChange={handleChange} />
        <input     name="people" type="number" min="1" max="10"
                   value={search.people} onChange={handleChange} />
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





















// import { useState, useEffect } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';
// import '../styles/CustomerDashboard.css';

// const CustomerDashboard = () => {
//   const navigate = useNavigate();

//   const [search, setSearch] = useState({
//     city: '',
//     date: '',
//     time: '',
//     people: 1,
//     zip: '',
//     cuisine: '',
//     minRating: ''
//   });
//   const [results, setResults] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [selectedRest, setSelectedRest] = useState(null);
//   const [showReviewForm, setShowReviewForm] = useState(null);
//   const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setSearch(s => ({ ...s, [name]: value }));
//   };

//   const searchRestaurants = async () => {
//     const params = {};
//     Object.entries(search).forEach(([k, v]) => {
//       if (v !== '' && v != null) params[k] = v;
//     });
//     try {
//       const res = await axios.get('/customer/search', { params });
//       setResults(res.data);
//     } catch (err) {
//       console.error('Search error', err);
//     }
//   };

//   const bookTable = async id => {
//     try {
//       const { date, time, people } = search;
//       const res = await axios.post('/customer/book', {
//         restaurantId: id,
//         date,
//         time,
//         numPeople: parseInt(people)
//       });
//       alert(res.data.message);
//       fetchMyBookings();
//     } catch (err) {
//       console.error('Booking error:', err);
//       alert(`Booking error: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const fetchMyBookings = async () => {
//     try {
//       const res = await axios.get('/customer/my-bookings');
//       setBookings(res.data);
//     } catch (err) {
//       console.error('Fetch bookings error:', err);
//     }
//   };

//   const cancelBooking = async id => {
//     try {
//       await axios.delete(`/customer/cancel/${id}`);
//       fetchMyBookings();
//     } catch (err) {
//       console.error('Cancel error:', err);
//       alert(`Error cancelling booking: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const handleReviewChange = e => {
//     setNewReview(n => ({ ...n, [e.target.name]: e.target.value }));
//   };

//   const submitReview = async id => {
//     try {
//       await axios.post(`/customer/review/${id}`, {
//         rating: parseInt(newReview.rating),
//         comment: newReview.comment
//       });
//       alert('Review submitted!');
//       setShowReviewForm(null);

//       // refresh that restaurant’s avgRating inline
//       const { data } = await axios.get(`/customer/get-restaurant/${id}`);
//       const reviews = data.reviews || [];
//       data.avgRating = reviews.length
//         ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
//         : null;
//       setResults(r => r.map(x => (x._id === id ? data : x)));
//     } catch (err) {
//       console.error('Review error:', err);
//       alert('Failed to submit review');
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     navigate('/login', { replace: true });
//   };

//   const viewReviews = async rest => {
//     try {
//       const { data } = await axios.get(`/customer/get-restaurant/${rest._id}`);
//       console.log("Reviews loading successfully")
//       setSelectedRest(data);
//     } catch (err) {
//       console.error('Failed to load reviews:', err);
//     }
//   };

//   const closeModal = () => setSelectedRest(null);

//   useEffect(() => {
//     window.history.replaceState(null, '', window.location.href);
//     window.addEventListener('popstate', () => window.history.go(1));
//     fetchMyBookings();
//     return () => window.removeEventListener('popstate', () => {});
//   }, []);

//   return (
//     <div className="page">
//       <header className="header">
//         <h1>Customer Dashboard</h1>
//         <button className="btn" onClick={logout}>Logout</button>
//       </header>

//       <section className="search-form">
//         <input name="city"     placeholder="City"     value={search.city}   onChange={handleChange} />
//         <input name="zip"      placeholder="Zip Code" value={search.zip}    onChange={handleChange} />
//         <select name="cuisine" value={search.cuisine} onChange={handleChange}>
//           <option value="">All Cuisines</option>
//           <option value="Italian">Italian</option>
//           <option value="Indian">Indian</option>
//           <option value="Mexican">Mexican</option>
//         </select>
//         <select name="minRating" value={search.minRating} onChange={handleChange}>
//           <option value="">Any Rating</option>
//           {[1,2,3,4,5].map(n => <option key={n} value={n}>≥ {n} ⭐</option>)}
//         </select>
//         <input name="date" type="date"  value={search.date} onChange={handleChange} />
//         <input name="time" type="time"  value={search.time} onChange={handleChange} />
//         <input name="people" type="number" min="1" value={search.people} onChange={handleChange} />
//         <button className="btn search-btn" onClick={searchRestaurants}>Search</button>
//       </section>

//       <h2 className="section-title">Results</h2>
//       <div className="cards-grid">
//         {results.length === 0 && <p className="no-items">No restaurants found.</p>}
//         {results.map(rest => {
//           const fullAddr = `${rest.address}, ${rest.city}, ${rest.state} ${rest.zipCode}`;
//           const mapsUrl  = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;

//           return (
//             <div key={rest._id} className="card">
//               <img className="card-img" src={rest.photos[0]} alt={rest.name} />
//               <div className="card-body">
//                 <h3 className="card-title">{rest.name}</h3>
//                 <p className="card-sub">
//                   {rest.city} — {rest.cuisine} | 💵 {rest.cost} | ⭐ 
//                   {rest.avgRating != null ? rest.avgRating.toFixed(1) : 'N/A'}
//                 </p>
//                 <div className="card-actions">
//                   <button className="btn" onClick={() => bookTable(rest._id)}>Book</button>
//                   <button className="btn" onClick={() => setShowReviewForm(rest._id)}>Leave Review</button>
//                   <button className="btn" onClick={() => viewReviews(rest)}>View Reviews</button>
//                   <button className="btn" onClick={() => window.open(mapsUrl, '_blank')}>View on Map</button>
//                 </div>

//                 {showReviewForm === rest._id && (
//                   <div className="review-form">
//                     <select name="rating" value={newReview.rating} onChange={handleReviewChange}>
//                       {[1,2,3,4,5].map(n => <option key={n} value={n}>⭐ {n}</option>)}
//                     </select>
//                     <input
//                       type="text"
//                       name="comment"
//                       placeholder="Write a review..."
//                       value={newReview.comment}
//                       onChange={handleReviewChange}
//                     />
//                     <button className="btn submit" onClick={() => submitReview(rest._id)}>Submit</button>
//                     <button className="btn cancel" onClick={() => setShowReviewForm(null)}>Cancel</button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <h2 className="section-title">My Bookings</h2>
//       <ul className="booking-list">
//         {bookings.length === 0 && <li>No bookings yet.</li>}
//         {bookings.map(b => (
//           <li key={b._id}>
//             <span>📅 {b.date} @ {b.time} → {b.restaurant?.name || 'Unknown'}</span>
//             <button className="btn cancel" onClick={() => cancelBooking(b._id)}>Cancel</button>
//           </li>
//         ))}
//       </ul>

//       {selectedRest && (
//         <div className="modal-backdrop">
//           <div className="modal">
//             <h2>Reviews for {selectedRest.name}</h2>
//             {(!selectedRest.reviews || !selectedRest.reviews.length)
//               ? <p>No reviews yet.</p>
//               : <ul className="reviews-list">
//                   {selectedRest.reviews.map((r,i) => (
//                     <li key={i}>
//                       ⭐ {r.rating} – {r.comment?.trim() || 'No comment'}
//                       {r.user?.name && ` (by ${r.user.name})`}
//                     </li>
//                   ))}
//                 </ul>
//             }
//             <button className="btn" onClick={closeModal}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerDashboard;









































// import { useState, useEffect } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';
// import '../styles/CustomerDashboard.css';

// const CustomerDashboard = () => {
//   const navigate = useNavigate();

//   const [search, setSearch] = useState({
//     city: '',
//     date: '',
//     time: '',
//     people: 1,
//     zip: '',
//     cuisine: '',
//     minRating: ''
//   });
//   const [results, setResults] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [selectedRest, setSelectedRest] = useState(null);
//   const [showReviewForm, setShowReviewForm] = useState(null);
//   const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setSearch(s => ({ ...s, [name]: value }));
//   };

//   const searchRestaurants = async () => {
//     const params = {};
//     Object.entries(search).forEach(([k, v]) => {
//       if (v !== '' && v != null) params[k] = v;
//     });
//     try {
//       const res = await axios.get('/customer/search', { params });
//       setResults(res.data);
//     } catch (err) {
//       console.error('Search error', err);
//     }
//   };

//   // now takes a slot string
//   const bookTable = async (restaurantId, slot) => {
//     try {
//       const { date, people } = search;
//       const res = await axios.post('/customer/book', {
//         restaurantId,
//         date,
//         time: slot,
//         numPeople: parseInt(people, 10)
//       });
//       alert(res.data.message);
//       fetchMyBookings();
//     } catch (err) {
//       console.error('Booking error:', err);
//       alert(`Booking error: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const fetchMyBookings = async () => {
//     try {
//       const res = await axios.get('/customer/my-bookings');
//       setBookings(res.data);
//     } catch (err) {
//       console.error('Fetch bookings error:', err);
//     }
//   };

//   const cancelBooking = async id => {
//     try {
//       await axios.delete(`/customer/cancel/${id}`);
//       fetchMyBookings();
//     } catch (err) {
//       console.error('Cancel error:', err);
//       alert(`Error cancelling booking: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const handleReviewChange = e => {
//     setNewReview(n => ({ ...n, [e.target.name]: e.target.value }));
//   };

//   const submitReview = async id => {
//     try {
//       await axios.post(`/customer/review/${id}`, {
//         rating: parseInt(newReview.rating, 10),
//         comment: newReview.comment
//       });
//       alert('Review submitted!');
//       setShowReviewForm(null);

//       // fetch updated restaurant to refresh avgRating
//       const { data } = await axios.get(`/customer/get-restaurant/${id}`);
//       const reviews = data.reviews || [];
//       data.avgRating = reviews.length
//         ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
//         : null;
//       setResults(r => r.map(x => (x._id === id ? data : x)));
//     } catch (err) {
//       console.error('Review error:', err);
//       alert('Failed to submit review');
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     navigate('/login', { replace: true });
//   };

//   const viewReviews = async rest => {
//     try {
//       const { data } = await axios.get(`/customer/get-restaurant/${rest._id}`);
//       setSelectedRest(data);
//     } catch (err) {
//       console.error('Failed to load reviews:', err);
//     }
//   };

//   const closeModal = () => setSelectedRest(null);

//   useEffect(() => {
//     window.history.replaceState(null, '', window.location.href);
//     window.addEventListener('popstate', () => window.history.go(1));
//     fetchMyBookings();
//     return () => window.removeEventListener('popstate', () => {});
//   }, []);

//   return (
//     <div className="page">
//       <header className="header">
//         <h1>Customer Dashboard</h1>
//         <button className="btn" onClick={logout}>Logout</button>
//       </header>

//       {/* ───────── SEARCH FORM ───────── */}
//       <section className="search-form">
//         <input name="city"     placeholder="City"     value={search.city}   onChange={handleChange} />
//         <input name="zip"      placeholder="Zip Code" value={search.zip}    onChange={handleChange} />
//         <select name="cuisine" value={search.cuisine} onChange={handleChange}>
//           <option value="">All Cuisines</option>
//           <option value="Italian">Italian</option>
//           <option value="Indian">Indian</option>
//           <option value="Mexican">Mexican</option>
//         </select>
//         <select name="minRating" value={search.minRating} onChange={handleChange}>
//           <option value="">Any Rating</option>
//           {[1,2,3,4,5].map(n => <option key={n} value={n}>≥ {n} ⭐</option>)}
//         </select>
//         <input name="date" type="date"  value={search.date} onChange={handleChange} />
//         <input name="time" type="time"  value={search.time} onChange={handleChange} />
//         <input name="people" type="number" min="1" value={search.people} onChange={handleChange} />
//         <button className="btn search-btn" onClick={searchRestaurants}>Search</button>
//       </section>

//       {/* ───────── RESULTS ───────── */}
//       <h2 className="section-title">Results</h2>
//       <div className="cards-grid">
//         {results.length === 0 && <p className="no-items">No restaurants found.</p>}
//         {results.map(rest => {
//           const fullAddr = `${rest.address}, ${rest.city}, ${rest.state} ${rest.zipCode}`;
//           const mapsUrl  = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;

//           return (
//             <div key={rest._id} className="card">
//               <img className="card-img" src={rest.photos[0]} alt={rest.name} />
//               <div className="card-body">
//                 <h3 className="card-title">{rest.name}</h3>
//                 <p className="card-sub">
//                   {rest.city} — {rest.cuisine} | 💵 {rest.cost} | ⭐{' '}
//                   {rest.avgRating != null ? rest.avgRating.toFixed(1) : 'N/A'}
//                 </p>

//                 {/* ← NEW: how many times booked today */}
//                 <p className="card-booked">
//                   📈 Booked {rest.timesBookedToday} time
//                   {rest.timesBookedToday !== 1 && 's'} today
//                 </p>

//                 <div className="card-actions">
//                   {/* ← NEW: one button per available slot */}
//                   {rest.bookingTimes.map(slot => (
//                     <button
//                       key={slot}
//                       className="btn"
//                       onClick={() => bookTable(rest._id, slot)}
//                     >
//                       {slot}
//                     </button>
//                   ))}

//                   <button className="btn" onClick={() => setShowReviewForm(rest._id)}>
//                     Leave Review
//                   </button>
//                   <button className="btn" onClick={() => viewReviews(rest)}>
//                     View Reviews
//                   </button>
//                   <button className="btn" onClick={() => window.open(mapsUrl, '_blank')}>
//                     View on Map
//                   </button>
//                 </div>

//                 {showReviewForm === rest._id && (
//                   <div className="review-form">
//                     <select name="rating" value={newReview.rating} onChange={handleReviewChange}>
//                       {[1,2,3,4,5].map(n => <option key={n} value={n}>⭐ {n}</option>)}
//                     </select>
//                     <input
//                       type="text"
//                       name="comment"
//                       placeholder="Write a review..."
//                       value={newReview.comment}
//                       onChange={handleReviewChange}
//                     />
//                     <button className="btn submit" onClick={() => submitReview(rest._id)}>
//                       Submit
//                     </button>
//                     <button className="btn cancel" onClick={() => setShowReviewForm(null)}>
//                       Cancel
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ───────── MY BOOKINGS ───────── */}
//       <h2 className="section-title">My Bookings</h2>
//       <ul className="booking-list">
//         {bookings.length === 0 && <li>No bookings yet.</li>}
//         {bookings.map(b => (
//           <li key={b._id}>
//             <span>📅 {b.date} @ {b.time} → {b.restaurant?.name || 'Unknown'}</span>
//             <button className="btn cancel" onClick={() => cancelBooking(b._id)}>
//               Cancel
//             </button>
//           </li>
//         ))}
//       </ul>

//       {/* ───────── REVIEWS MODAL ───────── */}
//       {selectedRest && (
//         <div className="modal-backdrop">
//           <div className="modal">
//             <h2>Reviews for {selectedRest.name}</h2>
//             {(!selectedRest.reviews || !selectedRest.reviews.length)
//               ? <p>No reviews yet.</p>
//               : (
//                 <ul className="reviews-list">
//                   {selectedRest.reviews.map((r,i) => (
//                     <li key={i}>
//                       ⭐ {r.rating} – {r.comment?.trim() || 'No comment'}
//                       {r.user?.name && ` (by ${r.user.name})`}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             <button className="btn" onClick={closeModal}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerDashboard;













































// import { useState, useEffect } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';

// const CustomerDashboard = () => {
//   const navigate = useNavigate();

//   const [search, setSearch] = useState({
//     city: '',
//     date: '',
//     time: '',
//     people: 1,
//     zip: '',
//     cuisine: '',
//     minRating: ''
//   });
//   const [results, setResults] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [selectedRest, setSelectedRest] = useState(null); // for viewing reviews
//   const [showReviewForm, setShowReviewForm] = useState(null); // restaurantId
//   const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setSearch(s => ({ ...s, [name]: value }));
//   };

//   const searchRestaurants = async () => {
//     const params = {};
//     Object.entries(search).forEach(([k, v]) => {
//       if (v !== '' && v != null) params[k] = v;
//     });
//     try {
//       const res = await axios.get('/customer/search', { params });
//       setResults(res.data);
//     } catch (err) {
//       console.error('Search error', err);
//     }
//   };

//   const bookTable = async (restaurantId) => {
//     try {
//       const { date, time, people } = search;
//       const res = await axios.post('/customer/book', {
//         restaurantId,
//         date,
//         time,
//         numPeople: parseInt(people)
//       });
//       alert(res.data.message);
//       fetchMyBookings();
//     } catch (err) {
//       console.error('Booking error:', err.response?.data || err.message);
//       alert(`Booking error: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const fetchMyBookings = async () => {
//     try {
//       const res = await axios.get('/customer/my-bookings');
//       setBookings(res.data);
//     } catch (err) {
//       console.error('Fetch bookings error:', err);
//     }
//   };

//   const cancelBooking = async (id) => {
//     try {
//       await axios.delete(`/customer/cancel/${id}`);
//       fetchMyBookings();
//     } catch (err) {
//       console.error('Cancel error:', err.response?.data || err.message);
//       alert(`Error cancelling booking: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const handleReviewChange = (e) => {
//     setNewReview({ ...newReview, [e.target.name]: e.target.value });
//   };

//   const submitReview = async (restaurantId) => {
//     try {
//       await axios.post(`/customer/review/${restaurantId}`, {
//         rating: parseInt(newReview.rating),
//         comment: newReview.comment
//       });
//       alert('Review submitted!');
//       setShowReviewForm(null);
//       const res = await axios.get(`/customer/get-restaurant/${restaurantId}`);
//       const updatedRestaurant = res.data;

//       const reviews = updatedRestaurant.reviews || [];
//       const avg =
//       reviews.length > 0
//         ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
//         : null;
//       updatedRestaurant.avgRating = avg;

//       setResults(prev =>
//         prev.map(r => r._id === restaurantId ? updatedRestaurant : r)
//       );
//     } catch (err) {
//       console.error('Review error:', err.response?.data || err.message);
//       alert('Failed to submit review');
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     navigate('/login', { replace: true });
//   };

//   const viewReviews = async (restaurant) => {
//     try {
//       const { data } = await axios.get(`/customer/get-restaurant/${restaurant._id}`);
//       setSelectedRest(data);
//     } catch (err) {
//       console.error('Failed to load reviews:', err);
//     }
//   };

//   const closeModal = () => {
//     setSelectedRest(null);
//   };

//   useEffect(() => {
//     window.history.replaceState(null, '', window.location.href);
//     const handlePopState = () => window.history.go(1);
//     window.addEventListener('popstate', handlePopState);
//     fetchMyBookings();
//     return () => window.removeEventListener('popstate', handlePopState);
//   }, []);

//   return (
//     <div>
//       <h1>Customer Dashboard</h1>
//       <button onClick={logout} style={{ marginBottom: '1rem' }}>Logout</button>

//       {/* Search Inputs */}
//       <div style={{ marginBottom: 20 }}>
//         <input
//           name="city"
//           placeholder="City"
//           value={search.city}
//           onChange={handleChange}
//         />
//         <input
//           name="zip"
//           placeholder="Zip Code"
//           value={search.zip}
//           onChange={handleChange}
//           style={{ width: 100, marginLeft: 8 }}
//         />
//         <select
//           name="cuisine"
//           value={search.cuisine}
//           onChange={handleChange}
//           style={{ marginLeft: 8 }}
//         >
//           <option value="">All Cuisines</option>
//           <option value="Italian">Italian</option>
//           <option value="Indian">Indian</option>
//           <option value="Mexican">Mexican</option>
//         </select>
//         <select
//           name="minRating"
//           value={search.minRating}
//           onChange={handleChange}
//           style={{ marginLeft: 8 }}
//         >
//           <option value="">Any Rating</option>
//           {[1,2,3,4,5].map(n => (
//             <option key={n} value={n}>≥ {n} ⭐</option>
//           ))}
//         </select>
//         <input
//           name="date"
//           type="date"
//           value={search.date}
//           onChange={handleChange}
//           style={{ marginLeft: 8 }}
//         />
//         <input
//           name="time"
//           type="time"
//           value={search.time}
//           onChange={handleChange}
//           style={{ marginLeft: 8 }}
//         />
//         <input
//           name="people"
//           type="number"
//           min="1"
//           value={search.people}
//           onChange={handleChange}
//           style={{ width: 60, marginLeft: 8 }}
//         />
//         <button onClick={searchRestaurants} style={{ marginLeft: 8 }}>
//           Search
//         </button>
//       </div>

//       {/* Results */}
//       <h2>Results</h2>
//       {results.length === 0 ? (
//         <p>No restaurants found.</p>
//       ) : (
//         <ul style={{ listStyle: 'none', padding: 0 }}>
//           {results.map(rest => {
//             // 1) build the address string
//             const fullAddr = `${rest.address}, ${rest.city}, ${rest.state} ${rest.zipCode}`;
//             // 2) generate the Google Maps query URL
//             const mapsUrl =
//               `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;

//             return (
//               <li key={rest._id} style={{ display: 'flex', marginBottom: 16 }}>
//                 <img
//                   src={rest.photos[0]}
//                   alt={rest.name}
//                   style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }}
//                 />
//                 <div style={{ flex: 1, marginLeft: 12 }}>
//                   <h3>{rest.name}</h3>
//                   <p>
//                     {rest.city} — {rest.cuisine} | 💵 {rest.cost} | ⭐{' '}
//                     {rest.avgRating != null ? rest.avgRating.toFixed(1) : 'N/A'}
//                   </p>

//                   <button onClick={() => bookTable(rest._id)} style={{ marginRight: 10 }}>
//                     Book
//                   </button>
//                   <button onClick={() => setShowReviewForm(rest._id)} style={{ marginRight: 10 }}>
//                     Leave Review
//                   </button>
//                   <button onClick={() => viewReviews(rest)} style={{ marginRight: 10 }}>
//                     View Reviews
//                   </button>

//                   {/* ─── Single “View on Map” button ────────────────────────── */}
//                   <button
//                     onClick={() => window.open(mapsUrl, '_blank', 'noopener')}
//                     style={{ marginTop: 8 }}
//                   >
//                     View on Map
//                   </button>

//                   {/* Inline review form (unchanged) */}
//                   {showReviewForm === rest._id && (
//                     <div style={{ marginTop: '10px' }}>
//                       <select
//                         name="rating"
//                         value={newReview.rating}
//                         onChange={handleReviewChange}
//                       >
//                         <option value="1">⭐ 1</option>
//                         <option value="2">⭐ 2</option>
//                         <option value="3">⭐ 3</option>
//                         <option value="4">⭐ 4</option>
//                         <option value="5">⭐ 5</option>
//                       </select>
//                       <input
//                         type="text"
//                         name="comment"
//                         placeholder="Write a review..."
//                         value={newReview.comment}
//                         onChange={handleReviewChange}
//                         style={{ marginLeft: '10px' }}
//                       />
//                       <button onClick={() => submitReview(rest._id)} style={{ marginLeft: '10px' }}>
//                         Submit
//                       </button>
//                       <button onClick={() => setShowReviewForm(null)} style={{ marginLeft: '5px' }}>
//                         Cancel
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       )}

//       {/* My Bookings */}
//       <h2>My Bookings</h2>
//       {bookings.length === 0 ? (
//         <p>No bookings yet.</p>
//       ) : (
//         <ul style={{ listStyle: 'none', padding: 0 }}>
//           {bookings.map((booking) => (
//             <li key={booking._id} style={{ marginBottom: '0.5rem' }}>
//               📅 {booking.date} @ {booking.time} → {booking.restaurant?.name || 'Unknown'}
//               <button
//                 onClick={() => cancelBooking(booking._id)}
//                 style={{ marginLeft: 10 }}
//               >
//                 Cancel
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Reviews Modal */}
//       {selectedRest && (
//         <div style={{
//           position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
//           background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center'
//         }}>
//           <div style={{ background: '#fff', padding: 20, borderRadius: 5, width: 400, color: 'black' }}>
//             <h2>Reviews for {selectedRest.name}</h2>
//             {selectedRest.reviews?.length === 0 ? (
//               <p>No reviews yet.</p>
//             ) : (
//               <ul>
//                 {selectedRest.reviews.map((r, i) => (
//                   <li key={i}>
//                     ⭐ {r.rating} – {r.comment?.trim() || 'No comment'}{r.user?.name && ` (by ${r.user.name})`}
//                   </li>
//                 ))}
//               </ul>
//             )}
//             <button onClick={closeModal} style={{ marginTop: 10 }}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerDashboard;
