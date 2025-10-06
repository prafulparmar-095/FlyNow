import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthProtector = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userType')) {
      navigate('/');
    }
  }, [navigate]);


  return children;
};

export default AuthProtector;