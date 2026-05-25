import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/whodidyousendthepictureto/");
  },
  async add(values) {
    const data = await api.post('/whodidyousendthepictureto/', values);
    return data;
  }
,
  async edit(idTruck, values) { 
    const data = await api.put('/whodidyousendthepictureto/' + idTruck, values);
    return data;
  }
,
  async delete(idTruck) {
    const data = await api.delete('/whodidyousendthepictureto/' + idTruck, {});
    return data;
  },
};
