import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/supervisornotes/");
  },

  async getByID(id) {
    return api.get("/supervisornotes/" + id);
  },
  
  async add(values) {


    const data = await api.post('/supervisornotes/', values);
    return data;

  },

  async edit(idCoverSheet, values) {

    const data = await api.put('/supervisornotes/' + idCoverSheet, values);
    return data;

  },
  async delete(idCoverSheet) {

    const data = await api.delete('/supervisornotes/' + idCoverSheet);
    return data;  
}
};
