import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetUserQuery } from 'state/api';

export const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.global.user);
  const { status, data } = useGetUserQuery(user?._id);
  const location = useLocation();

  // console.log('api user: ', data);

  if (!user || (status === 'fulfilled' && !data)) {
    // user is not authenticated
    return <Navigate to={`/auth/login?from=${location.pathname}`} />;
  }

  return children;
};
