import axios from 'axios'


const axiosInstance =axios.create({
  baseURL:'http://localhost:8080',
  //baseURL:'https://community-board.store/api',
  timeout: 50000,
});

/*
axiosInstance.interceptors.request.use(
  function(config){
    return config;
  },
  function(error){
    return Promise.reject(error);
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    //응답에 대한 로직
    const res = response.data;
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);
*/

export default axiosInstance;
