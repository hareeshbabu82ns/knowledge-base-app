import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetUserQuery } from 'state/api';
import { LoadingProgress } from './LoadingProgress';

export const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.global.user);
  const { status, data, isLoading, isFetching } = useGetUserQuery(user?._id);
  const location = useLocation();

  if (isLoading || isFetching) return <LoadingProgress />;

  if (!user || (status === 'fulfilled' && !data) || status === 'rejected') {
    // user is not authenticated
    return <Navigate to={`/auth/login?from=${location.pathname}`} />;
  }

  return children;
};
