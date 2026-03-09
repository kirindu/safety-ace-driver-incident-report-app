import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/depts/");
  },
  async add(values) {
    const data = await api.post('/depts/', values);
    return data;
  }
,
  async edit(idTruck, values) { 
    const data = await api.put('/depts/' + idTruck, values);
    return data;
  }
,
  async delete(idTruck) {
    const data = await api.delete('/depts/' + idTruck, {});
    return data;
  },
};
