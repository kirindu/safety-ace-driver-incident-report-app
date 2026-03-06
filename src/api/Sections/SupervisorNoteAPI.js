import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/sparetruckinfo/");
  },

  async getByID(id) {
    return api.get("/sparetruckinfo/" + id);
  },
  
  async add(values) {


    const data = await api.post('/sparetruckinfo/', values);
    return data;

  },

  async edit(idCoverSheet, values) {

    const data = await api.put('/sparetruckinfo/' + idCoverSheet, values);
    return data;

  },
  async delete(idCoverSheet) {

    const data = await api.delete('/sparetruckinfo/' + idCoverSheet);
    return data;  
}
};
