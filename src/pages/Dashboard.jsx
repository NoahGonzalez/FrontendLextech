import React, { useState, useEffect } from 'react';
import { apiService } from '../service/api';

export default function Dashboard({ usuario, onVerDetalle }) {
  const [expedientes, setExpedientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [filtro, setFiltro] = useState('');
  
  const [nuevo, setNuevo] = useState({ numeroInterno: '', clienteRut: '', clienteNombre: '', materia: 'Civil', juzgado: '', fechaIngreso: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const listaExp = await apiService.getExpedientes();
      setExpedientes(listaExp);
      const listaAlertas = await apiService.getAlertasTresDias();
      setAlertas(listaAlertas);
    } catch (error) {
      console.error("Error cargando datos del backend", error);
    }
  };

  const handleCrearExpediente = async (e) => {
    e.preventDefault();
    try {
      const creado = await apiService.crearExpediente(nuevo);
      
      // Registro de Auditoría Obligatorio
      await apiService.registrarAuditoria({
        expedienteId: creado.id,
        usuarioResponsable: usuario.username,
        accion: `Creó el expediente N° ${creado.numeroInterno}`
      });

      setNuevo({ numeroInterno: '', clienteRut: '', clienteNombre: '', materia: 'Civil', juzgado: '', fechaIngreso: '' });
      cargarDatos();
      alert("Expediente creado y registrado en auditoría.");
    } catch (error) {
      alert("Error al guardar.");
    }
  };

  // BUSCADOR EN MEMORIA (Asegura respuesta < 400ms)
  const expedientesFiltrados = expedientes.filter(exp => 
    exp.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) ||
    exp.numeroInterno.toLowerCase().includes(filtro.toLowerCase()) ||
    exp.clienteRut.includes(filtro)
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Panel de Control — Usuario: <span style={{ color: '#2980b9' }}>{usuario.username}</span> ({usuario.rol})</h2>

      {/* ALERTAS CRÍTICAS DE 3 DÍAS */}
      {alertas.length > 0 && (
        <div style={{ background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🚨 ALERTA: Plazos Legales por Vencer (3 días o menos)</h4>
          <ul>
            {alertas.map(alerta => (
              <li key={alerta.id}>
                <strong>Vence: {alerta.fechaVencimiento}</strong> - {alerta.descripcion} (Responsable: {alerta.responsable})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FORMULARIO CRUD (Bloqueado para ASISTENTE según Requerimiento de Roles) */}
      {usuario.rol !== "ASISTENTE" ? (
        <form onSubmit={handleCrearExpediente} style={{ background: '#f8f9fa', padding: '15px', border: '1px solid #e9ecef', borderRadius: '5px', marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Registrar Nuevo Expediente</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <input type="text" placeholder="N° Interno" value={nuevo.numeroInterno} onChange={e => setNuevo({...nuevo, numeroInterno: e.target.value})} required />
            <input type="text" placeholder="RUT Cliente" value={nuevo.clienteRut} onChange={e => setNuevo({...nuevo, clienteRut: e.target.value})} required />
            <input type="text" placeholder="Nombre Cliente" value={nuevo.clienteNombre} onChange={e => setNuevo({...nuevo, clienteNombre: e.target.value})} required />
            <select value={nuevo.materia} onChange={e => setNuevo({...nuevo, materia: e.target.value})}>
              <option value="Civil">Civil</option>
              <option value="Laboral">Laboral</option>
              <option value="Penal">Penal</option>
            </select>
            <input type="text" placeholder="Juzgado" value={nuevo.juzgado} onChange={e => setNuevo({...nuevo, juzgado: e.target.value})} required />
            <input type="date" value={nuevo.fechaIngreso} onChange={e => setNuevo({...nuevo, fechaIngreso: e.target.value})} required />
          </div>
          <button type="submit" style={{ marginTop: '15px', background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Guardar Caso</button>
        </form>
      ) : (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '4px', marginBottom: '25px' }}>
          ℹ️ Vista de Asistente: Tienes permisos para buscar expedientes y gestionar sus plazos internos.
        </div>
      )}

      {/* ENTRADA DEL BUSCADOR */}
      <h3 style={{ marginBottom: '10px' }}>Buscador Avanzado</h3>
      <input 
        type="text" 
        placeholder="Filtrar instantáneamente por Cliente, RUT o Número Interno..." 
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '20px' }}
      />

      {/* TABLA DE RESULTADOS */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>N° Interno</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Cliente</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Materia</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Juzgado</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expedientesFiltrados.map(exp => (
            <tr key={exp.id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '12px' }}>{exp.numeroInterno}</td>
              <td style={{ padding: '12px' }}>{exp.clienteNombre} <br/><small style={{ color: '#6c757d' }}>{exp.clienteRut}</small></td>
              <td style={{ padding: '12px' }}>{exp.materia}</td>
              <td style={{ padding: '12px' }}>{exp.juzgado}</td>
              <td style={{ padding: '12px' }}>
                <button onClick={() => onVerDetalle(exp.id)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  Ver Ficha y Plazos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}