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