// src/pages/Register.jsx
import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
    try {
      await axios.post('/auth/register', form);
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch {
      alert('Registration failed. An account with that email may already exist.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        <input
          style={styles.input}
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="email"
          placeholder="E‑mail"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <select
          // style={{ ...styles.input, padding: '0.5rem' }}
          style = {styles.input}
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="Customer">Customer</option>
          <option value="RestaurantManager">Restaurant Manager</option>
          <option value="Admin">Admin</option>
        </select>
        <button style={styles.button} onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EDF2F7',
  },
  card: {
    width: 340,
    padding: '2rem',
    borderRadius: 8,
    background: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#2D3748',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: 4,
    border: '1px solid #CBD5E0',
    fontSize: '1rem',
    // This made sure for being all four in the same alignment
    boxSizing: 'border-box'  
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    border: 'none',
    borderRadius: 4,
    background: '#38A169',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default Register;





























// import { useState } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';

// const Register = () => {
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'Customer' // default or your preference
//   });

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async () => {
//     try {
//       // Call your /auth/register endpoint
//       await axios.post('/auth/register', form);
//       alert('Registration successful! You can now log in.');
//       // After successful registration, redirect to login
//       navigate('/login');
//     } catch (err) {
//       console.error(err);
//       alert('Registration failed. Maybe user already exists.');
//     }
//   };

//   return (
//     <div>
//       <h2>Register</h2>
//       <input
//         name="name"
//         placeholder="Name"
//         value={form.name}
//         onChange={handleChange}
//       />
//       <input
//         name="email"
//         placeholder="Email"
//         value={form.email}
//         onChange={handleChange}
//       />
//       <input
//         name="password"
//         placeholder="Password"
//         type="password"
//         value={form.password}
//         onChange={handleChange}
//       />
//       <select name="role" value={form.role} onChange={handleChange}>
//         <option value="Customer">Customer</option>
//         <option value="RestaurantManager">RestaurantManager</option>
//         <option value="Admin">Admin</option>
//       </select>
//       <button onClick={handleRegister}>Register</button>
//     </div>
//   );
// };

// export default Register;
