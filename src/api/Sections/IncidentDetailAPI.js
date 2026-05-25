import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/incidentdetails/");
  },

  // async getByID(id) {
  //   return api.get("/load/" + id);
  // },
  
async add(values) {
  const formData = new FormData();
  
  Object.entries(values).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      // Archivos de imagen se agregan uno por uno
      value.forEach(file => formData.append('images', file));
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  return api.post('/incidentdetails/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
},


async edit(idGeneralInformation, values) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      value.forEach(file => formData.append('images', file));
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  return api.put('/incidentdetails/' + idGeneralInformation, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
},



  async delete(idGeneralInformation) {

    const data = await api.delete('/incidentdetails/' + idGeneralInformation);
    return data;    
  }
};
