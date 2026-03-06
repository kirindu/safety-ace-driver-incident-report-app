import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/materials/");
  },
  async add(values) {
    const data = await api.post('/materials/', values);
    return data;
  }
,
  async edit(idMaterial, values) { 
    const data = await api.put('/materials/' + idMaterial, values);
    return data;
  }
,
  async delete(idMaterial) {
    const data = await api.delete('/materials/' + idMaterial, {});
    return data;
  },
};
