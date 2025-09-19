// @mui material components
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";

import MDBox from "components/MDBox";
import {
  TextField,
  InputLabel,
  Card,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { ExpandMore } from "@mui/icons-material";
import { useEffect, useState } from "react";
import MDButton from "components/MDButton";
import MDSearch from "components/MDSearch";
import ThreeTableData from "./components/ThreeTableData";
import useGetWithParams from "hooks/useGetWithParams";
import ENDPOINTS from "services/endpoints";
import ButtonXLS from "./components/ButtonXLS";

import ImageCAF from "../../../assets/images/logo_caf.png";
import brandWhite from "../../../assets/images/logo_caf_white.png";

import { useMaterialUIController } from "context";
import { useClient } from "context/ClientContext";

const ProgrammerPayment = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [languageButtons, setlanguageButtons] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [filters, setFilters] = useState({
    date: null,
    costCenter: null,
    third: null,
    supplierType: null,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isClientDisabled, setIsClientDisabled] = useState(false);

  const { selectedClientId } = useClient();

  const { data: listThirdData, fetchData: fetchListThirdData } = useGetWithParams();
  const { data: listSupplierTypeData, fetchData: fetchListSupplierTypeData } = useGetWithParams();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "x-client-id": selectedClientId,
          },
        };

        await fetchListThirdData(`${ENDPOINTS.THRID_PARTY}`, options);
        await fetchListSupplierTypeData(`${ENDPOINTS.THRID_PARTY}${selectedLanguage}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [selectedClientId, fetchListThirdData, fetchListSupplierTypeData, selectedLanguage]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card>
        <Grid container spacing={2} mt={2} justifyContent={"space-between"}>
          <Grid
            item
            xs={12}
            ml={{ xs: 0, md: 3 }}
            md="auto"
            sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-end" } }}
          >
            <img
              src={darkMode ? brandWhite : ImageCAF}
              alt="CodigoCaf"
              width="130"
              style={{ maxWidth: "100%" }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            mr={{ xs: 0, md: 3 }}
            md="auto"
            sx={{
              order: { xs: 2, md: 2 },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <MDBox
              sx={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <MDButton
                variant={languageButtons ? "outlined" : "gradient"}
                color={languageButtons ? "dark" : "info"}
                value="es"
                onClick={() => {
                  setlanguageButtons(!languageButtons);
                  setSelectedLanguage("es");
                }}
              >
                Español ES
              </MDButton>
              <MDButton
                variant={languageButtons ? "gradient" : "outlined"}
                color={languageButtons ? "info" : "dark"}
                value="en"
                onClick={() => {
                  setlanguageButtons(!languageButtons);
                  setSelectedLanguage("en");
                }}
              >
                ENGLISH GB
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={4}>
          <Grid
            item
            xs={12}
            mr={{ xs: 0, md: 3 }}
            md
            sx={{
              order: 2,
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <MDBox
              sx={{
                display: "flex",
                justifyContent: { xs: "center" },
                width: { xs: "100%", sm: "80%", md: "60%" },
                maxWidth: "320px",
              }}
            >
              <MDSearch selectedLanguage={selectedLanguage} selectedValue={setIsClientDisabled} />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox m={3} display="flex" gap={2} alignItems="center">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel id="month">
                  {selectedLanguage === "es" ? "Tipo Proveedor" : "Supplier Type"}
                </InputLabel>
                <Select
                  label={selectedLanguage === "es" ? "Tipo Proveedor" : "Supplier Type"}
                  labelId="third"
                  IconComponent={ExpandMore}
                  value={filters.supplierType}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, supplierType: e.target.value }))
                  }
                  MenuProps={{
                    style: {
                      maxHeight: 400,
                      width: 250,
                    },
                  }}
                  sx={{
                    padding: "0.9rem",
                    "& .MuiSelect-icon": {
                      display: "block !important",
                      color: "text.secondary",
                      right: "15px",
                      fontSize: "1.5rem",
                      width: "1.5em",
                      height: "1.5em",
                    },
                    "& .MuiSelect-select": {
                      paddingRight: "24px !important",
                    },
                  }}
                >
                  <MenuItem disabled>
                    {selectedLanguage === "es"
                      ? "Seleccione Tipo Proveedor"
                      : "Select Supplier Type"}
                  </MenuItem>
                  <MenuItem
                    value=""
                    sx={{
                      border: "1px solid #e0e0e0",
                      marginTop: 1,
                      paddingTop: 1,
                      color: "text.secondary",
                    }}
                  >
                    {selectedLanguage === "es" ? "Limpiar" : "Clear"}
                  </MenuItem>
                  {listSupplierTypeData.map((item) => (
                    <MenuItem key={item.nombre} value={item.nombre}>
                      {item.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={selectedLanguage === "es" ? "Fecha" : "Date"}
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    cursor: "pointer",
                    "& fieldset": {
                      borderColor: "primary.secondary",
                    },
                  },
                  "& input": {
                    cursor: "pointer",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel id="month">
                  {selectedLanguage === "es" ? "Tercero" : "Third"}
                </InputLabel>
                <Select
                  label={selectedLanguage === "es" ? "Tercero" : "Third"}
                  labelId="third"
                  IconComponent={ExpandMore}
                  value={filters.third}
                  onChange={(e) => setFilters((prev) => ({ ...prev, third: e.target.value }))}
                  MenuProps={{
                    style: {
                      maxHeight: 400,
                      width: 250,
                    },
                  }}
                  sx={{
                    padding: "0.9rem",
                    "& .MuiSelect-icon": {
                      display: "block !important",
                      color: "text.secondary",
                      right: "15px",
                      fontSize: "1.5rem",
                      width: "1.5em",
                      height: "1.5em",
                    },
                    "& .MuiSelect-select": {
                      paddingRight: "24px !important",
                    },
                  }}
                >
                  <MenuItem disabled>
                    {selectedLanguage === "es" ? "Seleccione Tercero" : " Select third"}
                  </MenuItem>
                  <MenuItem
                    value=""
                    sx={{
                      border: "1px solid #e0e0e0",
                      marginTop: 1,
                      paddingTop: 1,
                      color: "text.secondary",
                    }}
                  >
                    {selectedLanguage === "es" ? "Limpiar" : "Clear"}
                  </MenuItem>
                  {listThirdData.map((item) => (
                    <MenuItem key={item.identificacion} value={item.identificacion}>
                      {item.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </MDBox>
      </Card>
      <MDBox pt={4} pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container spacing={2} display={"flex"} justifyContent="space-between">
              <Grid item xs={12} sm={6} md={4}>
                <MDTypography variant="h5" fontWeight="medium">
                  {selectedLanguage === "es" ? "Busqueda de datos" : "Data search"}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  {selectedLanguage === "es"
                    ? "Aquí puedes buscar los registros que desees"
                    : "Here you can search for the records you want"}
                </MDTypography>
              </Grid>
              <Grid item xs={12} mr={{ xs: 0, md: 0 }} md="auto">
                <MDBox display="flex" gap={1}>
                  <ButtonXLS
                    selectedLanguage={selectedLanguage}
                    filters={filters}
                    setSnackbarSeverity={setSnackbarSeverity}
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarOpen={setSnackbarOpen}
                  />
                </MDBox>
              </Grid>
            </Grid>
            <MDBox marginTop={4} paddingBottom={4}>
              <ThreeTableData selectedLanguage={selectedLanguage} filters={filters} />
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
      <Footer selectedLanguage={selectedLanguage} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default ProgrammerPayment;
