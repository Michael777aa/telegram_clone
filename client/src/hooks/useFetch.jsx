import { useState } from "react";
import { useDispatch } from "react-redux";
import { notificationActions } from "../store/notificationSlice";

// Use environment variable instead of hardcoding
const API_BASE_URL = "https://telegram-server-1-o8qe.onrender.com";

const useFetch = ({ method, url }, successFn, errorFn) => {
  const [requestState, setRequestState] = useState();
  const dispatch = useDispatch();

  const requestFunction = async (values) => {
    const methodUpper = method.toUpperCase();
    const fetchOptions =
      methodUpper !== "GET"
        ? {
            method: methodUpper,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
            credentials: 'include', // Keep this!
          }
        : {
            credentials: 'include', // Add this for GET too
          };

    try {
      setRequestState("loading");
      
      // Use API_BASE_URL
      const fullUrl = `${API_BASE_URL}/api${url}`;
      console.log("🌐 API Call:", fullUrl); // For debugging
      
      const response = await fetch(fullUrl, fetchOptions);
      
      let data;
      if (methodUpper !== "DELETE") {
        data = await response.json();
      }
      
      if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`);
      
      setRequestState("success");
      successFn && successFn(data);
      return data;
    } catch (error) {
      setRequestState("error");
      console.error("API Error:", error.message, "URL:", url);
      
      dispatch(
        notificationActions.addNotification({
          message: error.message,
          type: "error",
        })
      );

      errorFn && errorFn(error);
    }
  };

  return {
    reqState: requestState,
    reqFn: requestFunction,
  };
};

export default useFetch;