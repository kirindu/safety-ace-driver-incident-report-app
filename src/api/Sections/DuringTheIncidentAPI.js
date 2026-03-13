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

  async edit(idGeneralInformation, values) {

    const data = await api.put('/duringtheincidents/' + idGeneralInformation, values);
    return data;

  },
  async delete(idGeneralInformation) {

    const data = await api.delete('/duringtheincidents/' + idGeneralInformation);
    return data;    
  }

};
