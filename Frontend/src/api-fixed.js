import axios from 'axios';

let isSystemOverloaded = false;

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 429) {
        isSystemOverloaded = true;
        setTimeout(() => {
          isSystemOverloaded = false;
        }, 5000);
        
        return Promise.reject(error);
      }
      
      if (status === 409) {
        return Promise.reject(new Error('Seat taken!'));
      }
    }
    
    return Promise.reject(error);
  }
);

export const bookSeat = async (seatId) => {
  try {
    const response = await api.post('/book/' + seatId);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { isSystemOverloaded };
export default api;
