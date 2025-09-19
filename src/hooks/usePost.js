import { useState } from "react";
import api from "../services/api";

const usePost = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postData = async (url, payload, headers = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, postData };
};

export default usePost;
