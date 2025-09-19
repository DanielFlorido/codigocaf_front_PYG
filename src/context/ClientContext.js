import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const [selectedClientId, setSelectedClientId] = useState(null);

  return (
    <ClientContext.Provider value={{ selectedClientId, setSelectedClientId }}>
      {children}
    </ClientContext.Provider>
  );
};

ClientProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useClient = () => useContext(ClientContext);
