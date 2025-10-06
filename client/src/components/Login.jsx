import React, { useContext } from 'react'
import { GeneralContext } from '../context/GeneralContext';
import { useNavigate } from "react-router-dom";

const Login = ({setIsLogin}) => {

  const navigate = useNavigate();
  const {setEmail, setPassword, login} = useContext(GeneralContext);

  const handleLogin = async (e) =>{
    e.preventDefault();
    try {
      const userData = await login();

      const pendingFlightId = localStorage.getItem("pendingFlightId");

      if (pendingFlightId) {
        // Navigate to the booking page and clear the stored ID
        navigate(`/book-flight/${pendingFlightId}`);
        localStorage.removeItem("pendingFlightId");
      } else {
        // Navigate based on user type
        if (userData.usertype === 'customer') {
          navigate('/');
        } else if (userData.usertype === 'admin') {
          navigate('/admin');
        } else if (userData.usertype === 'flight-operator') {
          navigate('/flight-admin');
        }
      }
    } catch (error) {
      // Error is already handled in login function
    }
  }
  return (
    <form className="authForm">
        <h2>Login</h2>
        <div className="form-floating mb-3 authFormInputs">
            <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"
                                                                  onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="floatingInput">Email address</label>
        </div>
            <div className="form-floating mb-3 authFormInputs">
            <input type="password" className="form-control" id="floatingPassword" placeholder="Password"
                                                                  onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="floatingPassword">Password</label>
        </div>
        <button type="submit" className="btn btn-primary" onClick={handleLogin}>Sign in</button>

        <p>Not registered? <span onClick={()=> setIsLogin(false)}>Register</span></p>
    </form>
  )
}
export default Login