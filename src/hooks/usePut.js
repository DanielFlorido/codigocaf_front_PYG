import { useState } from "react";
import api from "../services/api";

const usePut = (url, initialHeaders = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putData = async (payload, customHeaders = {}) => {
    setLoading(true);
    try {
      const headers = { ...initialHeaders, ...customHeaders };
      const response = await api.put(url, payload, { headers });
      setData(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, putData };
};

export default usePut;
