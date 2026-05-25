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
  async edit(idDept, values) { 
    const data = await api.put('/depts/' + idDept, values);
    return data;
  }
,
  async delete(idDept) {
    const data = await api.delete('/depts/' + idDept, {});
    return data;
  },
};