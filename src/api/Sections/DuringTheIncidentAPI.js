import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/duringtheincidents/");
  },

  async getByID(id) {
    return api.get("/duringtheincidents/" + id);
  },
  
  async add(values) {


    const data = await api.post('/duringtheincidents/', values);
    return data;

  },

  async edit(idCoverSheet, values) {

    const data = await api.put('/duringtheincidents/' + idCoverSheet, values);
    return data;

  },
  async delete(idCoverSheet) {

    const data = await api.delete('/duringtheincidents/' + idCoverSheet);
    return data;    
  }

};
