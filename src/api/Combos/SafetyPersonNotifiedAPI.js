import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/safetypersonsnotified/");
  },
  async add(values) {
    const data = await api.post('/safetypersonsnotified/', values);
    return data;
  }
,
  async edit(idSafetyPersonNotified, values) { 
    const data = await api.put('/safetypersonsnotified/' + idSafetyPersonNotified, values);
    return data;
  }
,
  async delete(idSafetyPersonNotified) {
    const data = await api.delete('/safetypersonsnotified/' + idSafetyPersonNotified, {});
    return data;
  },
};
