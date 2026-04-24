import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // নতুন পেজে যাওয়ার হুক

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "লগইন সফল হয়েছে!") {
          // ১. ইউজারের তথ্য ব্রাউজারে সেভ করা
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // ২. লগইন সফল হলে ড্যাশবোর্ডে পাঠিয়ে দেওয়া
          navigate('/dashboard'); 
        } else {
          setMessage("এরর: " + (data.message || data.error));
        }
      })
      .catch((err) => setMessage("সার্ভার এরর!"));
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Log In</h2>
      {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required style={{ padding: '10px' }} />
        <input type="password" name="password" placeholder="Password" onChange={handleInputChange} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '12px', backgroundColor: '#e67e22', color: 'white', border: 'none', cursor: 'pointer' }}>Log In</button>
      </form>
    </div>
  );
};

export default Login;