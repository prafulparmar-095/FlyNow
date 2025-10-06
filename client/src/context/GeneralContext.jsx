import React, { createContext, useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const GeneralContext = createContext();

const GeneralContextProvider = ({ children }) => {
  // User authentication states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  // NEW: State for the booking date
  const [bookingDate, setBookingDate] = useState('');

  const navigate = useNavigate();

  // Load user details from localStorage on app start
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (userId && userType && username && email) {
      setUserDetails({
        _id: userId,
        usertype: userType,
        username: username,
        email: email
      });
    }
  }, []);

  const login = async () => {
    try {
      const loginInputs = { email, password };
      const res = await axios.post('http://localhost:6001/login', loginInputs);

      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userType', res.data.usertype);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('email', res.data.email);
      setUserDetails(res.data);

      return res.data; // Return user data for component to handle navigation

    } catch (err) {
      console.error("❌ Login failed:", err?.response?.data || err.message);
      alert("Login failed: " + (err?.response?.data?.message || "Invalid email or password"));
      throw err; // Throw error to be handled by component
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:6001/register', userData);

      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userType', res.data.usertype);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('email', res.data.email);
      setUserDetails(res.data);

      if (res.data.usertype === 'customer') {
        navigate('/');
      } else if (res.data.usertype === 'admin') {
        navigate('/admin');
      } else if (res.data.usertype === 'flight-operator') {
        navigate('/flight-admin');
      }

    } catch (err) {
      console.error("❌ Registration failed:", err?.response?.data || err.message);
      alert("Registration failed! " + (err?.response?.data?.message || "Please check your input."));
    }
  };

  const logout = async () => {
    localStorage.clear();
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorage.removeItem(key);
      }
    }
    setUserDetails(null);
    navigate('/');
  };

  return (
    <GeneralContext.Provider value={{ 
      login, 
      register, 
      logout, 
      username, 
      setUsername, 
      email, 
      setEmail, 
      password, 
      setPassword, 
      usertype, 
      setUsertype,
      userDetails,
      setUserDetails,
      bookingDate,         // ADDED
      setBookingDate       // ADDED
    }}>
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;