import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/homebases/");
  },
  async add(values) {
    const data = await api.post('/homebases/', values);
    return data;
  }
,
  async edit(idHomeBase, values) { 
    const data = await api.put('/homebases/' + idHomeBase, values);
    return data;
  }
,
  async delete(idHomeBase) {
    const data = await api.delete('/homebases/' + idHomeBase, {});
    return data;
  },
};
