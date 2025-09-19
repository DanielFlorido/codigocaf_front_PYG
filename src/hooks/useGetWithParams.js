import { useState, useCallback } from "react";
import api from "services/api";

const useGetWithParams = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (endpoint, options = {}) => {
    if (!endpoint) {
      throw new Error("Endpoint is required for fetchData");
    }
    setLoading(true);
    try {
      const response = await api.get(endpoint, options);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};

export default useGetWithParams;
