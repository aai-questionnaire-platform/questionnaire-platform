import { useHashParams } from '../utils';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

 const Login = () => {
   const accessToken = useHashParams().get('access_token')
   const navigate = useNavigate()
  useEffect(() => {
    localStorage.setItem('accessToken', accessToken as string);
    navigate('/')
  }, [accessToken, navigate])
  

  return (
    <div>Login</div>
  )
}

export default Login