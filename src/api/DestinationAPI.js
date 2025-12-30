import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/destinations/");
  },
  async add(values) {
    const data = await api.post('/destinations/', values);
    return data;
  }
,
  async edit(idDestination, values) { 
    const data = await api.put('/destinations/' + idDestination, values);
    return data;
  }
,
  async delete(idDestination) {
    const data = await api.delete('/destinations/' + idDestination, {});
    return data;
  },
};