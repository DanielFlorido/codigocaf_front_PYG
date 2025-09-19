import { useState } from "react";
import api from "../services/api";

const useDelete = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteData = async (url, headers = {}) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await api.delete(url, { headers });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, deleteData };
};

export default useDelete;
