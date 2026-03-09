import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/roadconditions/");
  },
  async add(values) {
    const data = await api.post('/roadconditions/', values);
    return data;
  }
,
  async edit(idRoadCondition, values) { 
    const data = await api.put('/roadconditions/' + idRoadCondition, values);
    return data;
  }
,
  async delete(idRoadCondition) {
    const data = await api.delete('/roadconditions/' + idRoadCondition, {});
    return data;
  },
};
