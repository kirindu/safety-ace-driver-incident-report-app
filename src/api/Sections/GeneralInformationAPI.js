import api from "@/lib/axios.js";

// Helper para extraer el token sin repetir código en cada método
function getAuthHeader() {
  const currentUser = localStorage.getItem("USER-SAFETY-ACE") || '';
  const token = JSON.parse(currentUser).data.access_token;
  return { Authorization: `Bearer ${token}` };
}

export default {

  /**
   * Obtener todas las general informations (sin paginación)
   */
  async all() {
    return api.get("/generalinformations/", {
      headers: getAuthHeader()
    });
  },

  /**
   * Obtener general informations con paginación y filtros del lado del servidor
   * @param {Object} params - Parámetros de paginación y filtros
   * @param {number} params.page              - Número de página (default: 1)
   * @param {number} params.limit             - Registros por página (default: 50)
   * @param {string} params.start_date        - Fecha inicial (YYYY-MM-DD)
   * @param {string} params.end_date          - Fecha final (YYYY-MM-DD)
   * @param {string} params.employee_id       - ID del empleado
   * @param {string} params.truck_id          - ID del camión
   * @param {string} params.dept_id           - ID del departamento
   * @param {string} params.supervisor_id     - ID del supervisor
   * @param {string} params.typeOfIncident_id - ID del tipo de incidente
   * @param {string} params.sort_by           - Campo para ordenar (default: "incidentDate")
   * @param {number} params.sort_order        - Orden: -1 desc, 1 asc (default: -1)
   */
  async allPaginated(params = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/generalinformations/?${queryString}` : '/generalinformations/';

    return api.get(url, {
      headers: getAuthHeader()
    });
  },

  /**
   * Obtener general informations por fecha de incidente
   * @param {string} date - Fecha en formato YYYY-MM-DD
   */
  async allByDate(date) {
    return api.get(`/generalinformations/by-date/${date}`, {
      headers: getAuthHeader()
    });
  },

  /**
   * Obtener una general information por ID (incluye secciones hijas expandidas)
   * @param {string} id - ID de la general information
   */
  async getById(id) {
    return api.get(`/generalinformations/${id}`, {
      headers: getAuthHeader()
    });
  },

  /**
   * Crear una nueva general information
   * @param {Object} values - Datos del formulario
   */
  async add(values) {
    return api.post('/generalinformations/', values, {
      headers: getAuthHeader()
    });
  },

  /**
   * Actualizar una general information existente
   * @param {string} id     - ID de la general information
   * @param {Object} values - Campos a actualizar
   */
  async edit(id, values) {
    return api.put(`/generalinformations/${id}`, values, {
      headers: getAuthHeader()
    });
  },

  /**
   * Soft delete — marca la general information como inactiva
   * @param {string} id - ID de la general information
   */
  async delete(id) {
    return api.delete(`/generalinformations/${id}`, {
      headers: getAuthHeader()
    });
  },

  /**
   * Hard delete — elimina permanentemente la general information y todos sus documentos hijos
   * ⚠️ Esta operación es IRREVERSIBLE
   * @param {string} id - ID de la general information
   */
  async deletePermanent(id) {
    return api.delete(`/generalinformations/${id}/permanent`, {
      headers: getAuthHeader()
    });
  },

  // --- SECCIONES HIJAS ---

  /**
   * Obtener todas las secciones "During The Incident" de una general information
   * @param {string} id - ID de la general information
   */
  async getDuringTheIncident(id) {
    return api.get(`/generalinformations/${id}/duringtheincident`, {
      headers: getAuthHeader()
    });
  },

  /**
   * Obtener todas las Supervisor Notes de una general information
   * @param {string} id - ID de la general information
   */
  async getSupervisorNote(id) {
    return api.get(`/generalinformations/${id}/supervisornote`, {
      headers: getAuthHeader()
    });
  },

  /**
   * Obtener todos los Incident Details de una general information
   * @param {string} id - ID de la general information
   */
  async getIncidentDetail(id) {
    return api.get(`/generalinformations/${id}/incidentdetail`, {
      headers: getAuthHeader()
    });
  },
};