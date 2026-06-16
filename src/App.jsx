import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpedienteDetalle from './pages/ExpedienteDetalle';

export default function App() {
  const [usuario, setUsuario] = useState(null); 
  const [expedienteIdSeleccionado, setExpedienteIdSeleccionado] = useState(null);

  // Control 1: Si no se ha logueado, mostrar Login obligatoriamente
  if (!usuario) {
    return <Login onLoginSuccess={(u) => setUsuario(u)} />;
  }

  // Control 2: Si el usuario seleccionó "Ver Ficha", ir al detalle
  if (expedienteIdSeleccionado) {
    return (
      <ExpedienteDetalle 
        expedienteId={expedienteIdSeleccionado} 
        usuario={usuario} 
        onVolver={() => setExpedienteIdSeleccionado(null)} 
      />
    );
  }

  // Control 3: Mostrar Dashboard principal
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* NAVBAR GLOBAL */}
      <div style={{ background: '#2c3e50', color: 'white', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>LexTech SpA - Control Judicial</span>
        <div style={{ fontSize: '14px' }}>
          <span>Operador: <strong>{usuario.username}</strong> ({usuario.rol})</span>
          <button onClick={() => setUsuario(null)} style={{ marginLeft: '15px', background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <Dashboard 
        usuario={usuario} 
        onVerDetalle={(id) => setExpedienteIdSeleccionado(id)} 
      />
    </div>
  );
}