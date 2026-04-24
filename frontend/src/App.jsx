import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        
        {/* রুট পেজ ('/'): এখানে শুধু লগইন আর সাইনআপ ফর্ম থাকবে */}
        <Route path="/" element={
          <div style={{ fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#2c3e50', textAlign: 'center', marginTop: '30px' }}>Event Management System</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
              <Login />
              <Register />
            </div>
          </div>
        } />

        {/* ড্যাশবোর্ড পেজ ('/dashboard'): লগইন সফল হলে এখানে আসবে */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;