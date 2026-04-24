import { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ব্যাক-এন্ডের রেজিস্ট্রেশন API-তে ডাটা পাঠানো
    fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!") {
          setMessage(data.message); // সফল হলে মেসেজ দেখাবে
          setFormData({ name: '', email: '', password: '' }); // ফর্ম খালি করে দেবে
        } else {
          setMessage("এরর: " + (data.message || data.error));
        }
      })
      .catch((error) => {
        console.error("Error registering user:", error);
        setMessage("সার্ভারে সমস্যা হয়েছে! ব্যাক-এন্ড চালু আছে কি না চেক করুন।");
      });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Sign Up</h2>
      
      {/* মেসেজ দেখানোর জায়গা */}
      {message && <p style={{ textAlign: 'center', color: message.includes('সফল') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name:</label>
          <input 
            type="text" name="name" placeholder="Enter your name" 
            value={formData.name} onChange={handleInputChange} required 
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email Address:</label>
          <input 
            type="email" name="email" placeholder="Enter your email" 
            value={formData.email} onChange={handleInputChange} required 
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password" name="password" placeholder="Create a strong password" 
            value={formData.password} onChange={handleInputChange} required 
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ marginTop: '10px', padding: '12px', fontSize: '16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;