import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/employees/");
  },

    async add(values) {


    const data = await api.post('/employees/', values);
    return data;

  },
  
  async edit(idEmployee, values) {    
    const data = await api.put('/employees/' + idEmployee, values);
    return data;

  },

  async delete(idEmployee) {
    const data = await api.delete('/employees/' + idEmployee, {});
    return data;
  },
};
