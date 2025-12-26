
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import api from "./apiintersper";

const URL = "http://localhost:3000";

const Dashboard = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/auth/admin`, {
        withCredentials: true,
      });

      setContent(res.data.message); 
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        content && <div className="flex justify-center items-center mt-48 text-5xl">{content}</div>
      )}
    </>
  );
};

export default Dashboard;
