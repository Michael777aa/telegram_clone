import { useState } from "react";
import { useDispatch } from "react-redux";
import { notificationActions } from "../store/notificationSlice";

// Add this at the top
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

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
          }
        : {};

    try {
      setRequestState("loading");
      
      // FIX THIS LINE - Add base URL
      const fullUrl = `${API_BASE_URL}/api${url}`;
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        credentials: 'include', // ADD THIS for cookies
      });
      
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