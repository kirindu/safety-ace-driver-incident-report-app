import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/directions/");
  },
  async add(values) {
    const data = await api.post('/directions/', values);
    return data;
  }
,
  async edit(idDirection, values) { 
    const data = await api.put('/directions/' + idDirection, values);
    return data;
  }
,
  async delete(idDirection) {
    const data = await api.delete('/directions/' + idDirection, {});
    return data;
  },
};