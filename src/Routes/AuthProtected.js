import React from "react";
import { Navigate, Route, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const AuthProtected = (props) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!user && !loading) {
    return (
      // <Navigate to={{ pathname: "/login", state: { from: props.location, prevLocation: window.location.pathname } }} />
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
      />
    );
  }
  return <>{props.children}</>;
};

const AccessRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return (<> <Component {...props} /> </>);
      }}
    />
  );
};

export { AuthProtected, AccessRoute };
