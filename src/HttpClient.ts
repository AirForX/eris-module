import { create } from 'apisauce';
import axios, { AxiosRequestConfig } from 'axios';
import Config from 'react-native-config';

export const api = create({
  baseURL: Config.LOGS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  transformRequest: [
    (data: any, headers: any) => {
      if (headers['Content-Type'] !== 'application/json') {
        return data;
      }
      return JSON.stringify(data);
    },
  ],
});

const naviMonitor = (response: any) => console.log('API response', response);
api.addMonitor(naviMonitor);
