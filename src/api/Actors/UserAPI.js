import api from "@/lib/axios.js";
import qs from "qs";

export default {

  async all() {
    const currentUser = localStorage.getItem("USER-SAFETY-ACE") || '';
    const userData = JSON.parse(currentUser);
    const token = userData.data?.access_token;

    const data = await api.get('/users/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async loginEmployee(values) {
    const data = await api.post("/employees/login", values, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // ✅ La respuesta ahora tiene la estructura:
    // {
    //   "ok": true,
    //   "data": {
    //     "access_token": "...",
    //     "token_type": "bearer",
    //     "user": { ... }
    //   }
    // }
    
    return data;
  },

  async loginAdmin(values) {
    const form = qs.stringify({
      username: values.email,
      password: values.password
    });
  
    const data = await api.post("/users/login", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    // ✅ La respuesta tiene la estructura:
    // {
    //   "ok": true,
    //   "data": {
    //     "access_token": "...",
    //     "token_type": "bearer",
    //     "user": { ... }
    //   }
    // }
  
    return data;
  },

  async auth() {
    const currentUser = localStorage.getItem("USER-SAFETY-ACE") || '';
    const userData = JSON.parse(currentUser);
    const token = userData.data?.access_token;

    const data = await api.get('/auth/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async add(values) {
    const currentUser = localStorage.getItem("USER-SAFETY-ACE") || '';
    const userData = JSON.parse(currentUser);
    const token = userData.data?.access_token;

    const data = await api.post('/users/', values, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async delete(idUser) {
    const currentUser = localStorage.getItem("USER-SAFETY-ACE") || '';
    const userData = JSON.parse(currentUser);
    const token = userData.data?.access_token;

    const data = await api.delete('/users/' + idUser, {
     headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async edit(idUser, values) {
    const currentUser = localStorage.getItem("USER-SAFETY-ACE") || '';
    const userData = JSON.parse(currentUser);
    const token = userData.data?.access_token;

    const data = await api.put('/users/' + idUser, values, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },
  
};