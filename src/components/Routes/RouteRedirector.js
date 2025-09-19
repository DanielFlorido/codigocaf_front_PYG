import React from "react";
import { Redirect, Route } from "react-router-dom";
import routeMappings from "../../utils/routeMappings.js";

// eslint-disable-next-line react/prop-types
const RouteRedirector = ({ path, component: Component, ...rest }) => {
  const redirectTo = Object.keys(routeMappings).find((key) => routeMappings[key] === path);

  return (
    <Route
      {...rest}
      path={path}
      render={(props) => (redirectTo ? <Redirect to={redirectTo} /> : <Component {...props} />)}
    />
  );
};

export default RouteRedirector;
