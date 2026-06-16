import React, { useState } from 'react';
import { apiService } from '../service/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuarioLogueado = await apiService.login(username, password);
      onLoginSuccess(usuarioLogueado); 
    } catch (err) {
      setError("Usuario o contraseña inválidos (Error 401)");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '5px' }}>LexTech SpA</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '0', marginBottom: '20px' }}>Gestión de Expedientes</p>
      
      {error && <div style={{ color: 'red', background: '#fdecea', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Usuario (username):</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} required />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}