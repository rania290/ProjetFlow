import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const storageService = {
  async uploadFile(file: File): Promise<{ key: string, url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/storage/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    // Ensure URL is absolute if it's a relative path from backend
    if (data.url && data.url.startsWith('/')) {
      data.url = `${API_URL.replace('/api', '')}${data.url}`;
    }

    return data;
  },

  async getFileUrl(key: string): Promise<string> {
    const response = await axios.get(`${API_URL}/storage/url/${key}`);
    let url = response.data.url;
    if (url && url.startsWith('/')) {
      url = `${API_URL.replace('/api', '')}${url}`;
    }
    return url;
  }
};
