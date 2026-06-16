import React, { useState, useEffect } from 'react';
import { apiService } from '../service/api';

export default function ExpedienteDetalle({ expedienteId, usuario, onVolver }) {
  const [expediente, setExpediente] = useState(null);
  const [plazos, setPlazos] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [descripcion, setDescripcion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [responsable, setResponsable] = useState('');

  useEffect(() => {
    cargarDetalles();
  }, [expedienteId]);

  const cargarDetalles = async () => {
    try {
      const exp = await apiService.getExpedienteById(expedienteId);
      setExpediente(exp);
      const listaPlazos = await apiService.getPlazosPorExpediente(expedienteId);
      setPlazos(listaPlazos);
      const listaLogs = await apiService.getTimelineAuditoria(expedienteId);
      setTimeline(listaLogs);
    } catch (error) {
      setErrorMsg("Error al conectar con los servicios de LexTech.");
    }
  };

  const handleAgregarPlazo = async (e) => {
    e.preventDefault();
    try {
      await apiService.crearPlazo({ 
        descripcion, 
        fechaVencimiento, 
        responsable, 
        cumplido: false, 
        expedienteId 
      });

      // Registro secuencial en Auditoría
      await apiService.registrarAuditoria({
        expedienteId: expedienteId,
        usuarioResponsable: usuario.username,
        accion: `Agregó plazo legal: "${descripcion}" asignado a ${responsable}`
      });

      setDescripcion(''); setFechaVencimiento(''); setResponsable('');
      cargarDetalles();
    } catch (error) {
      alert("No se pudo vincular el hito judicial.");
    }
  };

  const handleCumplirPlazo = async (id, descPlazo) => {
    try {
      // Consume la API adaptada para retornos vacíos (void del BFF)
      const exito = await apiService.marcarPlazoCumplido(id);

      if (exito) {
        // Al no caerse el flujo, se registra el rastro de auditoría sin problemas
        await apiService.registrarAuditoria({
          expedienteId: expedienteId,
          usuarioResponsable: usuario.username,
          accion: `Marcó como CUMPLIDO el plazo: "${descPlazo}"`
        });
        cargarDetalles();
      }
    } catch (error) {
      alert("Error al actualizar el estado del plazo.");
    }
  };

  if (errorMsg) return <div style={{ padding: '20px', color: 'red' }}>{errorMsg}</div>;
  if (!expediente) return <div style={{ padding: '20px' }}>Conectando con el servidor central de LexTech...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <button onClick={onVolver} style={{ padding: '8px 15px', marginBottom: '20px', cursor: 'pointer' }}>⬅ Volver al Panel</button>
      
      {/* TARJETA CORE INFORMATIVA */}
      <div style={{ background: '#eef2f7', padding: '20px', borderRadius: '6px', borderLeft: '5px solid #2c3e50', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Expediente: {expediente.numeroInterno}</h3>
        <p style={{ margin: '5px 0' }}><strong>Cliente:</strong> {expediente.clienteNombre} (RUT: {expediente.clienteRut})</p>
        <p style={{ margin: '5px 0' }}><strong>Materia:</strong> {expediente.materia} | <strong>Juzgado:</strong> {expediente.juzgado}</p>
        <p style={{ margin: '5px 0' }}><strong>Fecha Ingreso:</strong> {expediente.fechaIngreso}</p>
      </div>

      {/* SECCIÓN PLAZOS */}
      <h3>⏱️ Control de Plazos Legales</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
        <thead>
          <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Descripción</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Vencimiento</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Responsable</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Estado</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {plazos.map(p => (
            <tr key={p.id} style={{ background: p.cumplido ? '#fdfdfd' : '#fff9f9', borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px', textDecoration: p.cumplido ? 'line-through' : 'none', color: p.cumplido ? '#95a5a6' : '#2c3e50' }}>{p.descripcion}</td>
              <td style={{ padding: '10px' }}><strong>{p.fechaVencimiento}</strong></td>
              <td style={{ padding: '10px' }}>{p.responsable}</td>
              <td style={{ padding: '10px' }}>{p.cumplido ? '🟢 Cumplido' : '🔴 Pendiente'}</td>
              <td style={{ padding: '10px' }}>
                {!p.cumplido && (
                  <button onClick={() => handleCumplirPlazo(p.id, p.descripcion)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                    Marcar Cumplido
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FORMULARIO PLAZO */}
      <form onSubmit={handleAgregarPlazo} style={{ background: '#fff', border: '1px dashed #ced4da', padding: '15px', borderRadius: '5px', marginBottom: '30px' }}>
        <h5>Asignar Nuevo Hito / Plazo</h5>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Ej: Presentar recurso de apelación" value={descripcion} onChange={e => setDescripcion(e.target.value)} required style={{ flex: 2, padding: '6px' }} />
          <input type="date" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} required style={{ padding: '6px' }} />
          <input type="text" placeholder="Responsable" value={responsable} onChange={e => setResponsable(e.target.value)} required style={{ padding: '6px' }} />
          <button type="submit" style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Vincular</button>
        </div>
      </form>

      {/* TIMELINE DE AUDITORÍA */}
      <h3>📋 Registro de Trazabilidad e Historial (Auditoría)</h3>
      <div style={{ background: '#1e1e1e', color: '#39ff14', padding: '15px', fontFamily: 'monospace', borderRadius: '5px', maxHeight: '180px', overflowY: 'auto' }}>
        {timeline.length === 0 ? <p style={{ color: '#888' }}>Sin historial de cambios registrado.</p> : 
          timeline.map(log => (
            <div key={log.id} style={{ marginBottom: '6px' }}>
              &gt; [{log.fecha ? log.fecha.replace('T', ' ').substring(0, 19) : ''}] Operador: <strong>{log.usuarioResponsable}</strong> -&gt; {log.accion}
            </div>
          ))
        }
      </div>
    </div>
  );
}