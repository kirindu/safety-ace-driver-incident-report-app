import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/employeesignatures/");
  },

  async getByID(id) {
    return api.get("/employeesignatures/" + id);
  },
  
  async add(values) {


    const data = await api.post('/employeesignatures/', values);
    return data;

  },

  async edit(idGeneralInformation, values) {

    const data = await api.put('/employeesignatures/' + idGeneralInformation, values);
    return data;

  },
  async delete(idGeneralInformation) {

    const data = await api.delete('/employeesignatures/' + idGeneralInformation);
    return data;  
}
};
