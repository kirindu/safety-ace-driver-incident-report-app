import api from "@/lib/axios.js";

export default {
  async all() {
    return api.get("/routes/");
  },
  async add(values) {
    const data = await api.post('/routes/', values);
    return data;
  },
  async edit(idRoute, values) {
    const data = await api.put('/routes/' + idRoute, values);
    return data;
  },
  async delete(idRoute) {
    const data = await api.delete('/routes/' + idRoute, {});
    return data;
  },
  
 
};
