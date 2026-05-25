import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/supervisors/");
  },
  async add(values) {
    const data = await api.post('/supervisors/', values);
    return data;
  }
,
  async edit(idSupervisor, values) { 
    const data = await api.put('/supervisors/' + idSupervisor, values);
    return data;
  }
,
  async delete(idSupervisor) {
    const data = await api.delete('/supervisors/' + idSupervisor, {});
    return data;
  },
};
