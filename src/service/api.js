const API_BASE = "http://localhost:8080/api";

export const apiService = {
  // Conexión con AuthController (BFF Puerto 8080)
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Credenciales incorrectas");
    return res.json(); // Devuelve el objeto Usuario con su rol
  },

  // Conexión con ExpedienteController (BFF Puerto 8080)
  getExpedientes: async () => {
    const res = await fetch(`${API_BASE}/expedientes`);
    if (!res.ok) throw new Error("Error al obtener expedientes");
    return res.json();
  },

  getExpedienteById: async (id) => {
    const res = await fetch(`${API_BASE}/expedientes/${id}`);
    if (!res.ok) throw new Error("Error al obtener detalle del expediente");
    return res.json();
  },

  crearExpediente: async (expediente) => {
    const res = await fetch(`${API_BASE}/expedientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expediente),
    });
    if (!res.ok) throw new Error("Error al crear expediente");
    return res.json();
  },

  // Conexión con PlazoController (BFF Puerto 8080)
  getPlazosPorExpediente: async (expedienteId) => {
    const res = await fetch(`${API_BASE}/plazos/expediente/${expedienteId}`);
    if (!res.ok) throw new Error("Error al obtener plazos");
    return res.json();
  },

  crearPlazo: async (plazo) => {
    const res = await fetch(`${API_BASE}/plazos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plazo),
    });
    if (!res.ok) throw new Error("Error al crear plazo");
    return res.json();
  },

  // ADAPTACIÓN CRÍTICA: El backend devuelve void, por lo que no se debe mapear a .json()
  marcarPlazoCumplido: async (id) => {
    const res = await fetch(`${API_BASE}/plazos/${id}/cumplir`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Error al marcar plazo como cumplido");
    return true; // Retornamos true indicando éxito operacional en lugar de romper el flujo
  },

  getAlertasTresDias: async () => {
    const res = await fetch(`${API_BASE}/plazos/alertas`);
    if (!res.ok) throw new Error("Error al obtener alertas");
    return res.json();
  },

  // Conexión con AuditoriaController (BFF Puerto 8080)
  getTimelineAuditoria: async (expedienteId) => {
    const res = await fetch(`${API_BASE}/auditoria/expediente/${expedienteId}`);
    if (!res.ok) throw new Error("Error al obtener línea de tiempo");
    return res.json();
  },

  registrarAuditoria: async (auditoria) => {
    const res = await fetch(`${API_BASE}/auditoria`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auditoria),
    });
    if (!res.ok) throw new Error("Error al registrar auditoría");
    return res.json();
  }
};