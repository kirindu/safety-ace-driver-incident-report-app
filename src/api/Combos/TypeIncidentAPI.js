import api from "@/lib/axios.js";

export default {
  async all() {
    return api.get("/typeincidents/");
  },
  async add(values) {
    const data = await api.post('/typeincidents/', values);
    return data;
  },
  async edit(idTypeIncident, values) {
    const data = await api.put('/typeincidents/' + idTypeIncident, values);
    return data;
  },
  async delete(idTypeIncident) {
    const data = await api.delete('/typeincidents/' + idTypeIncident, {});
    return data;
  },
  
 
};
