import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/ManagerDashboard.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    address: '',
    cuisine: '',
    cost: 1,
    contact: '',
    city: '',
    state: '',
    zipCode: '',
    availableTables: 0,
    bookingTimes: '',
    photos: ''
  });
  const [restaurants, setRestaurants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [bookings, setBookings] = useState({});

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/restaurant/my-listings');
      setRestaurants(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const fetchBookings = async (id) => {
    try {
      const res = await axios.get(`/restaurant/bookings/${id}`);
      setBookings(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const bookingTimesArray = form.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
    const photosArray = form.photos.split(',').map(u => u.trim()).filter(Boolean);
    const payload = { ...form, bookingTimes: bookingTimesArray, photos: photosArray };

    try {
      if (editingId) {
        await axios.put(`/restaurant/update/${editingId}`, payload);
        alert('Restaurant updated!');
      } else {
        await axios.post('/restaurant/add', payload);
        alert('Restaurant added!');
      }
      setForm({
        name: '', address: '', cuisine: '', cost: 1, contact: '',
        city: '', state: '', zipCode: '', availableTables: 0,
        bookingTimes: '', photos: ''
      });
      setEditingId(null);
      fetchRestaurants();
    } catch {
      alert('Error saving restaurant');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`/restaurant/delete/${id}`);
      fetchRestaurants();
    } catch {
      alert('Error deleting listing');
    }
  };

  const handleEdit = (rest) => {
    setForm({
      name: rest.name || '', 
      address: rest.address || '', 
      cuisine: rest.cuisine || '',
      cost: rest.cost || 1, 
      contact: rest.contact || '', 
      city: rest.city || '',
      state: rest.state || '', 
      zipCode: rest.zipCode || '',
      availableTables: rest.availableTables || 0,
      bookingTimes: (rest.bookingTimes || []).join(','),
      photos: (rest.photos || []).join(',')
    });
    setEditingId(rest._id);
  };

  useEffect(() => { fetchRestaurants(); }, []);

  return (
    <div className="page">
      <div className="header">
        <h1>Restaurant Manager Dashboard</h1>
        <button className="btn" onClick={logout}>Logout</button>
      </div>

      <h2>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
      <div className="form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="cuisine" placeholder="Cuisine" value={form.cuisine} onChange={handleChange} />
        <input name="cost" type="number" placeholder="Cost (1–5)" value={form.cost} onChange={handleChange} />
        <input name="contact" placeholder="Contact Info" value={form.contact} onChange={handleChange} />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} />
        <input name="zipCode" placeholder="Zip Code" value={form.zipCode} onChange={handleChange} />
        <input name="availableTables" type="number" placeholder="Tables" value={form.availableTables} onChange={handleChange} />
        <input name="bookingTimes" placeholder="e.g. 18:00,19:00" value={form.bookingTimes} onChange={handleChange} />
        <input name="photos" placeholder="Photo URLs (comma-sep)" value={form.photos} onChange={handleChange} />
        <button className="btn" onClick={handleSubmit}>
          {editingId ? 'Update Listing' : 'Add Listing'}
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h2>My Restaurants</h2>
      {restaurants.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        <div className="restaurants-container">
          {restaurants.map(rest => (
            <div key={rest._id} className="restaurant">
              <h3>{rest.name}</h3>
              {rest.photos?.length > 0 && (
                <div className="photos">
                  {rest.photos.map((url, i) => (
                    <img key={i} src={url} alt={`${rest.name} ${i + 1}`} />
                  ))}
                </div>
              )}
              <p>
                {rest.city} — {rest.cuisine} | Cost: {rest.cost} | Tables: {rest.availableTables}
              </p>
              <p>Times: {(rest.bookingTimes || []).join(', ')}</p>
              <div className="actions">
                <button className="btn" onClick={() => handleEdit(rest)}>Edit</button>
                <button className="btn danger" onClick={() => handleDelete(rest._id)}>Delete</button>
                <button className="btn" onClick={() => fetchBookings(rest._id)}>View Bookings</button>
              </div>
              {bookings[rest._id] && (
                <ul style={{ marginTop: '1rem' }}>
                  {bookings[rest._id].length === 0 ? (
                    <li>No bookings yet</li>
                  ) : (
                    bookings[rest._id].map((b) => (
                      <li key={b._id}>
                        📅 {b.date} @ {b.time} — {b.user?.name || 'Unknown'}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;


































// import { useState, useEffect } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';

// const ManagerDashboard = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     address: '',
//     cuisine: '',
//     cost: 1,
//     contact: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     availableTables: 0,
//     bookingTimes: '',
//     photos: ''               // ← NEW: comma‑sep list of URLs
//   });

//   const [restaurants, setRestaurants] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [bookings, setBookings] = useState({}); // { [restaurantId]: [...] }

//   const logout = () => {
//     localStorage.clear();
//     navigate('/login', { replace: true });
//   };

//   const fetchRestaurants = async () => {
//     try {
//       const res = await axios.get('/restaurant/my-listings');
//       setRestaurants(res.data);
//     } catch (err) {
//       console.error('Error fetching listings:', err);
//     }
//   };

//   const fetchBookings = async (restaurantId) => {
//     try {
//       const res = await axios.get(`/restaurant/bookings/${restaurantId}`);
//       setBookings(prev => ({ ...prev, [restaurantId]: res.data }));
//     } catch (err) {
//       console.error('Error fetching bookings:', err);
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       // split & clean up the comma‑sep strings
//       const bookingTimesArray = form.bookingTimes.split(',').map(t => t.trim()).filter(t => t);
//       const photosArray      = form.photos.split(',').map(u => u.trim()).filter(u => u);

//       const payload = {
//         ...form,
//         bookingTimes: bookingTimesArray,
//         photos       : photosArray     // ← UPDATED: include as array
//       };

//       if (editingId) {
//         await axios.put(`/restaurant/update/${editingId}`, payload);
//         alert('Restaurant updated!');
//       } else {
//         await axios.post('/restaurant/add', payload);
//         alert('Restaurant added!');
//       }

//       // reset, including photos
//       setForm({
//         name: '',
//         address: '',
//         cuisine: '',
//         cost: 1,
//         contact: '',
//         city: '',
//         state: '',
//         zipCode: '',
//         availableTables: 0,
//         bookingTimes: '',
//         photos: ''           // ← reset here too
//       });
//       setEditingId(null);
//       fetchRestaurants();
//     } catch (err) {
//       console.error(err);
//       alert('Error saving restaurant');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/restaurant/delete/${id}`);
//       alert('Deleted successfully');
//       fetchRestaurants();
//     } catch (err) {
//       console.error(err);
//       alert('Error deleting listing');
//     }
//   };

//   const handleEdit = (rest) => {
//     setForm({
//       name: rest.name,
//       address: rest.address,
//       cuisine: rest.cuisine,
//       cost: rest.cost,
//       contact: rest.contact,
//       city: rest.city,
//       state: rest.state,
//       zipCode: rest.zipCode,
//       availableTables: rest.availableTables,
//       bookingTimes: rest.bookingTimes.join(','),
//       photos: (rest.photos || []).join(',')   // ← put existing URLs back into the input
//     });
//     setEditingId(rest._id);
//   };

//   useEffect(() => {
//     fetchRestaurants();
//   }, []);

//   return (
//     <div>
//       <h1>Restaurant Manager Dashboard</h1>
//       <button onClick={logout} style={{ marginBottom: '1rem' }}>Logout</button>

//       <h2>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
//       <div>
//         <input name="name"          placeholder="Name"        value={form.name}          onChange={handleChange} />
//         <input name="address"       placeholder="Address"     value={form.address}       onChange={handleChange} />
//         <input name="cuisine"       placeholder="Cuisine"     value={form.cuisine}       onChange={handleChange} />
//         <input name="cost"    type="number" placeholder="Cost (1-5)" value={form.cost}          onChange={handleChange} />
//         <input name="contact"       placeholder="Contact"     value={form.contact}       onChange={handleChange} />
//         <input name="city"          placeholder="City"        value={form.city}          onChange={handleChange} />
//         <input name="state"         placeholder="State"       value={form.state}         onChange={handleChange} />
//         <input name="zipCode"       placeholder="Zip Code"    value={form.zipCode}       onChange={handleChange} />
//         <input
//           name="availableTables"
//           type="number"
//           placeholder="Tables"
//           value={form.availableTables}
//           onChange={handleChange}
//         />
//         <input
//           name="bookingTimes"
//           placeholder="e.g. 18:00,19:00"
//           value={form.bookingTimes}
//           onChange={handleChange}
//         />
//         <input
//           name="photos"                                  // ← NEW input
//           placeholder="Photo URLs (comma‑sep)"
//           value={form.photos}
//           onChange={handleChange}
//         />
//         <button onClick={handleSubmit}>
//           {editingId ? 'Update' : 'Add Listing'}
//         </button>
//       </div>

//       <hr />

//       <h2>My Restaurants</h2>
//       {restaurants.length === 0 ? (
//         <p>No listings yet.</p>
//       ) : (
//         restaurants.map(rest => (
//           <div key={rest._id} style={{ marginBottom: '1.5rem' }}>
//             <h3>{rest.name}</h3>

//             {/* ← NEW: render thumbnails */}
//             {rest.photos?.length > 0 && (
//               <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
//                 {rest.photos.map((url, i) => (
//                   <img
//                     key={i}
//                     src={url}
//                     alt={`${rest.name} #${i+1}`}
//                     style={{
//                       width: 120,
//                       height: 80,
//                       objectFit: 'cover',
//                       borderRadius: 4
//                     }}
//                   />
//                 ))}
//               </div>
//             )}

//             <p>
//               {rest.city} — {rest.cuisine} | Cost: {rest.cost} | Tables: {rest.availableTables}
//             </p>
//             <p>Times: {rest.bookingTimes.join(', ')}</p>

//             <button onClick={() => handleEdit(rest)}>Edit</button>
//             <button onClick={() => handleDelete(rest._id)} style={{ marginLeft: 8 }}>Delete</button>
//             <button onClick={() => fetchBookings(rest._id)} style={{ marginLeft: 8 }}>View Bookings</button>

//             {bookings[rest._id] && (
//               <ul>
//                 {bookings[rest._id].length === 0
//                   ? <li>No bookings yet</li>
//                   : bookings[rest._id].map(b => (
//                       <li key={b._id}>
//                         📅 {b.date} at {b.time} by {b.user?.name || 'Unknown'}
//                       </li>
//                     ))
//                 }
//               </ul>
//             )}
//             <hr />
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default ManagerDashboard;



