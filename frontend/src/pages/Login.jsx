// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    if (token && role) {
      const rolePath = role === 'RestaurantManager' ? 'manager' : role.toLowerCase();
      navigate(`/${rolePath}`, { replace: true });
    }
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role',  res.data.role);
      const rolePath = res.data.role === 'RestaurantManager'
        ? 'manager'
        : res.data.role.toLowerCase();
      navigate(`/${rolePath}`, { replace: true });
    } catch {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>HOTEL MANIA</h1>

        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <div style={styles.forgotWrapper}>
          <Link to="/forgot-password" style={styles.forgot}>
            Sign Up?
          </Link>
        </div>

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        <p style={styles.footerText}>
          Don't have an Account?{' '}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    background:     '#FFFFFF'   // pure white
  },
  card: {
    width:       320,
    padding:     '2rem',
    borderRadius: 8,
    background:  'white',
    boxShadow:   '0 4px 12px rgba(0,0,0,0.1)',
    textAlign:   'center'
  },
  title: {
    marginBottom: '1.5rem',
    fontSize:     '1.5rem',
    fontWeight:   'bold',
    color:        '#2D3748'
  },
  input: {
    width:        '100%',
    padding:      '0.75rem',
    marginBottom: '1rem',
    borderRadius: 4,
    border:       '1px solid #E2E8F0',
    fontSize:     '1rem',
    background:   'white',
    color:        '#2D3748'
  },
  forgotWrapper: {
    textAlign:  'right',
    marginBottom: '1rem'
  },
  forgot: {
    fontSize:      '0.875rem',
    color:         '#4A5568',
    textDecoration:'none'
  },
  button: {
    width:        '100%',
    padding:      '0.75rem',
    border:       'none',
    borderRadius: 4,
    background:   '#2C7A7B',
    color:        'white',
    fontSize:     '1rem',
    cursor:       'pointer'
  },
  footerText: {
    marginTop: '1rem',
    fontSize:  '0.875rem',
    color:     '#4A5568'
  },
  link: {
    color:         '#2C7A7B',
    textDecoration:'none'
  }
};

export default Login;
















// import { useState, useEffect } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';

// const Login = () => {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const role = localStorage.getItem('role');
//     if (token && role) {
//       navigate(`/${role.toLowerCase()}`, { replace: true }); // 🔁 Avoid back to login
//     }
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async () => {
//     try {
//       const res = await axios.post('/auth/login', form);
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('role', res.data.role);
//          // 🌟 Correct path mapping for roles
//         let rolePath = '';
//         if (res.data.role === 'RestaurantManager') {
//         rolePath = 'manager'; // ✅ This matches your <Route path="/manager" />
//         } else {
//         rolePath = res.data.role.toLowerCase();
//         }

//         navigate(`/${rolePath}`, { replace: true });
//     } catch (err) {
//         alert('Login failed');
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <input type="email" name="email" placeholder="Email" onChange={handleChange} />
//       <input type="password" name="password" placeholder="Password" onChange={handleChange} />
//       <button onClick={handleLogin}>Login</button>
//       <p>Don't have an account? <Link to="/register">Register here</Link></p>
//     </div>
//   );
// };

// export default Login;
