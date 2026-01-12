import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/downtime/");
  },

  async getByID(id) {
    return api.get("/downtime/" + id);
  },
  
  async add(values) {


    const data = await api.post('/downtime/', values);
    return data;

  },

  async edit(idCoverSheet, values) {

    const data = await api.put('/downtime/' + idCoverSheet, values);
    return data;

  },
  async delete(idCoverSheet) {

    const data = await api.delete('/downtime/' + idCoverSheet);
    return data;    
  }

};
