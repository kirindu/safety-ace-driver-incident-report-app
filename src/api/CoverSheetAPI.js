import api from "@/lib/axios.js";

export default {

  async all() {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    return api.get("/coversheets/", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  /**
   * 🆕 NUEVO: Obtener coversheets con paginación y filtros del lado del servidor
   * @param {Object} params - Parámetros de paginación y filtros
   * @param {number} params.page - Número de página (default: 1)
   * @param {number} params.limit - Registros por página (default: 50)
   * @param {string} params.start_date - Fecha inicial (YYYY-MM-DD)
   * @param {string} params.end_date - Fecha final (YYYY-MM-DD)
   * @param {string} params.truck_id - ID del camión
   * @param {string} params.trailer_id - ID del trailer
   * @param {string} params.driver_id - ID del conductor
   * @param {string} params.homebase_id - ID del homebase
   * @param {string} params.sort_by - Campo para ordenar (default: "date")
   * @param {number} params.sort_order - Orden: -1 desc, 1 asc (default: -1)
   */
  async allPaginated(params = {}) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    // Construir query params solo con valores no vacíos
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/coversheets/?${queryString}` : '/coversheets/';

    return api.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async allByDate(date) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    return api.get('/coversheets/by-date/' + date, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  async add(values) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    const data = await api.post('/coversheets/', values, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async edit(idCoverSheet, values) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    const data = await api.put('/coversheets/' + idCoverSheet, values, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async getSpareTruckInfo(idCoverSheet) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    const data = await api.get('/coversheets/' + idCoverSheet + '/sparetruckinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async getDowntime(idCoverSheet) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    const data = await api.get('/coversheets/' + idCoverSheet + '/downtime', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async getLoad(idCoverSheet) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    const data = await api.get('/coversheets/' + idCoverSheet + '/load', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async delete(idCoverSheet) {
    const currentUser = localStorage.getItem('USER') || '';
    const token = JSON.parse(currentUser).data.access_token;

    const data = await api.delete('/coversheets/' + idCoverSheet, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },
};