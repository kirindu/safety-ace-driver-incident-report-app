import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/incidentdetails/");
  },

  // async getByID(id) {
  //   return api.get("/load/" + id);
  // },
  
  async add(values) {


    const data = await api.post('/incidentdetails/', values);
    return data;

  },

  async edit(idGeneralInformation, values) {

    const data = await api.put('/incidentdetails/' + idGeneralInformation, values);
    return data;

  },
  async delete(idGeneralInformation) {

    const data = await api.delete('/incidentdetails/' + idGeneralInformation);
    return data;    
  }
};
