import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/trucks/");
  },
  async add(values) {
    const data = await api.post('/trucks/', values);
    return data;
  }
,
  async edit(idTruck, values) { 
    const data = await api.put('/trucks/' + idTruck, values);
    return data;
  }
,
  async delete(idTruck) {
    const data = await api.delete('/trucks/' + idTruck, {});
    return data;
  },
};
