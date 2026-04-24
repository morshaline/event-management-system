import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', event_date: '' });
  const [editingId, setEditingId] = useState(null); // কোন ইভেন্ট এডিট হচ্ছে তা মনে রাখার জন্য
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchEvents();
    }
  }, [navigate, user]);

  const fetchEvents = () => {
    fetch(`http://localhost:5000/api/events/${user?.id}`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ইভেন্ট সাবমিট এবং আপডেট করার ফাংশন
  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = { ...formData, user_id: user.id };

    if (editingId) {
      // যদি এডিট মোডে থাকে, তবে PUT রিকোয়েস্ট পাঠাবে
      fetch(`http://localhost:5000/api/events/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'ইভেন্ট আপডেট হয়েছে!');
          setFormData({ title: '', description: '', event_date: '' });
          setEditingId(null);
          fetchEvents();
        });
    } else {
      // যদি নতুন ইভেন্ট হয়, তবে POST রিকোয়েস্ট পাঠাবে
      fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'ইভেন্ট সফলভাবে যুক্ত হয়েছে!');
          setFormData({ title: '', description: '', event_date: '' });
          fetchEvents();
        });
    }
  };

  // এডিট বাটনে ক্লিক করলে ফর্মে ডাটা বসানোর ফাংশন
  const handleEdit = (event) => {
    const formattedDate = new Date(event.event_date).toISOString().split('T')[0];
    setFormData({ title: event.title, description: event.description, event_date: formattedDate });
    setEditingId(event.id);
    window.scrollTo(0, 0); // এডিট চাপলে পেজের ওপরে ফর্মে চলে যাবে
  };

  const handleDelete = (id) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই ইভেন্টটি ডিলিট করতে চান?")) {
      fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then((data) => {
          if(data.message) alert(data.message);
          fetchEvents(); 
        });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ textAlign: 'center', backgroundColor: '#ecf0f1', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>স্বাগতম, <span style={{ color: '#2980b9' }}>{user.name}</span>!</h3>
        <button onClick={handleLogout} style={{ padding: '8px 20px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>{editingId ? "Update Event" : "Create New Event"}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleInputChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <textarea name="description" placeholder="Event Description" value={formData.description} onChange={handleInputChange} required rows="3" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
          <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: editingId ? '#3498db' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingId ? 'Update Event' : 'Add Event'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', event_date: '' }); }} style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>Your Upcoming Events:</h2>
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>{event.title}</h3>
            <p style={{ color: '#555' }}>{event.description}</p>
            <p style={{ fontWeight: 'bold', color: '#e67e22' }}>📅 Date: {new Date(event.event_date).toLocaleDateString('en-GB')}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => handleEdit(event)} style={{ padding: '8px 15px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(event.id)} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>আপনি এখনো কোনো ইভেন্ট তৈরি করেননি।</p>
      )}
    </div>
  );
};

export default Dashboard;