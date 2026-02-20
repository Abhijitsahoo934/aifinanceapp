import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/forgot-password', { email });
      setMessage("Check your email (or backend console) for the reset link!");
    } catch (err) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', width: '380px', textAlign: 'center' }}>
        <h2 style={{ color: '#10b981' }}>Reset Password</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9em', marginBottom: '20px' }}>Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" required style={{ padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' }} onChange={e => setEmail(e.target.value)} />
          <button type="submit" style={{ padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send Link</button>
        </form>
        {message && <p style={{ color: '#10b981', marginTop: '15px', fontSize: '0.8em' }}>{message}</p>}
      </div>
    </div>
  );
}