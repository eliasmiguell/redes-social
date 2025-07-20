import axios from 'axios';

export const makeRequest = axios.create({
  baseURL:`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials:true,
  timeout: 10000 // 10 segundos de timeout
})

// Interceptor para retry automático
makeRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    if (!config) {
      return Promise.reject(error);
    }
    
    // Adiciona propriedades de retry ao config
    config.__retryCount = config.__retryCount || 0;
    const maxRetries = 3;
    const retryDelay = 1000;
    
    if (config.__retryCount >= maxRetries) {
      return Promise.reject(error);
    }
    
    config.__retryCount += 1;
    
    const delayRetryRequest = new Promise((resolve) => {
      setTimeout(resolve, retryDelay);
    });
    
    await delayRetryRequest;
    
    return makeRequest(config);
  }
);

