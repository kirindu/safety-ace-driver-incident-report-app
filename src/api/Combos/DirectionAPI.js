import api from "@/lib/axios.js";

export default {

 async all() {
    return api.get("/landfills/");
  },
};
