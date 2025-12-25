import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const URL = "http://localhost:3000";

const Verify = () => {
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { token } = useParams();

  const verifyUser = async () => {
    try {
      const res = await axios.post(
        `${URL}/api/v1/auth/verify/${token}`
      );

      setSuccessMessage(res.data.message);
      toast.success(res.data.message);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong";

      console.error(err);
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyUser();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="w-[300px] m-auto mt-48 text-center">
      {successMessage && (
        <p className="text-green-500 text-2xl font-semibold">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="text-red-500 text-2xl font-semibold">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Verify;
