import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/weatherconditions/");
  },
  async add(values) {
    const data = await api.post('/weatherconditions/', values);
    return data;
  }
,
  async edit(idHomeBase, values) { 
    const data = await api.put('/weatherconditions/' + idHomeBase, values);
    return data;
  }
,
  async delete(idHomeBase) {
    const data = await api.delete('/weatherconditions/' + idHomeBase, {});
    return data;
  },
};
