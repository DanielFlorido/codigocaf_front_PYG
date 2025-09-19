import { useEffect, useState } from "react";
import { Search } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import ModalClients from "./ModalClients";
import { Avatar, InputAdornment, List, ListItem, Paper, CircularProgress } from "@mui/material";
import useGet from "hooks/useGet";
import ENDPOINTS from "services/endpoints";
import PropTypes from "prop-types";
import { useClient } from "context/ClientContext";

const MDSearch = ({ selectedLanguage, selectedValue }) => {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openModalClient, setOpenModalClient] = useState(false);

  const { setSelectedClientId } = useClient();

  const userID = 4;

  const { data: userData, loading: userLoading, fetchData } = useGet();

  useEffect(() => {
    if (userData && userData.length > 0 && userData[0]?.idcliente) {
      const allClientIds = Number(userData[0].idcliente);
      setSelectedClientId(allClientIds);
      setSearchValue(userData[0].razonSocial);
    }
  }, [userData]);

  useEffect(() => {
    fetchData(`${ENDPOINTS.USER_MULTICLIENT}${userID}`);
  }, [userID, fetchData]);

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);

    if (value === "") {
      setFilteredData([]);
      return;
    }

    const filtered = userData.filter((item) => {
      return (
        item.razonSocial.toLowerCase().includes(value.toLowerCase()) ||
        item.numeroDocumento.toString().includes(value)
      );
    });

    setFilteredData(filtered);
  };

  const handleSelectClient = (client) => {
    setSearchValue(client.razonSocial);
    setSelectedClientId(Number(client.idcliente));
    setFilteredData([]);
    selectedValue?.(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && filteredData.length > 0) {
      handleSelectClient(filteredData[0]);
    }
  };

  return (
    <MDBox width="20rem" position="relative">
      {userLoading ? (
        <MDBox display="flex" justifyContent="center" p={3}>
          <CircularProgress sx={{ color: "#0033f0" }} size={30} />
        </MDBox>
      ) : (
        <MDInput
          placeholder={selectedLanguage === "es" ? "Buscar..." : "Search..."}
          value={searchValue}
          size="medium"
          fullWidth
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          InputProps={{
            autoComplete: "off",
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  onClick={() => setOpenModalClient(true)}
                  fontSize="medium"
                  sx={{
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      )}
      <Paper
        sx={{
          position: "absolute",
          width: "100%",
          maxHeight: "200px",
          overflow: "auto",
          zIndex: 9999,
          mt: 1,
        }}
      >
        <List padding={3}>
          {filteredData.map((client) => (
            <ListItem
              key={client.idcliente}
              onClick={() => handleSelectClient(client)}
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: "15px",
                padding: "10px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <MDBox sx={{ marginRight: 2 }}>
                <Avatar sx={{ backgroundColor: "#90caf9", color: "#fff" }}>
                  {client.razonSocial.slice(0, 1)}
                </Avatar>
              </MDBox>

              {client.razonSocial}
            </ListItem>
          ))}
        </List>
      </Paper>
      <ModalClients
        opened={openModalClient}
        onClose={() => {
          setOpenModalClient(false);
        }}
        clickModelClient={(client) => {
          handleSelectClient(client);
          setOpenModalClient(false);
        }}
        userData={userData}
        language={selectedLanguage}
      />
    </MDBox>
  );
};

MDSearch.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  selectedValue: PropTypes.func,
  setOpenModalClient: PropTypes.func.isRequired,
};

export default MDSearch;
