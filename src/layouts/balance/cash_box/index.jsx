// @mui material components
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";

import MDBox from "components/MDBox";
import {
  InputLabel,
  Card,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
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
import ButtonPDF from "./components/ButtonPDF";
import ButtonXLS from "./components/ButtonXLS";

import ImageCAF from "../../../assets/images/logo_caf.png";
import brandWhite from "../../../assets/images/logo_caf_white.png";

import { useMaterialUIController } from "context";
import { useClient } from "context/ClientContext";
import ButtonSendXLS from "./components/ButtonSendXLS";

const CashBox = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [years, setYears] = useState([]);
  const [languageButtons, setlanguageButtons] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [filters, setFilters] = useState({
    year: "",
    month: null,
    third: null,
    signature: false,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isYearDisabled, setIsYearDisabled] = useState(false);

  const { selectedClientId } = useClient();

  const { data: yearData, fetchData: fetchYear } = useGetWithParams();
  const { data: monthData, fetchData: fetchMonth } = useGetWithParams();
  const { data: listThirdData, fetchData: fetchListThirdData } = useGetWithParams();

  useEffect(() => {
    const loadMonthData = async () => {
      try {
        const options = {
          headers: {
            "x-client-id": selectedClientId,
          },
        };

        await fetchMonth(`${ENDPOINTS.BALANCE_LANGUAGE_MONTH}${selectedLanguage}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadMonthData();
  }, [fetchMonth, selectedLanguage]);

  useEffect(() => {
    const loadInitialData = async () => {
      // if (!selectedClientId) return;
      try {
        const options = {
          headers: {
            "x-client-id": 27,
          },
        };

        await fetchListThirdData(`${ENDPOINTS.CASH_BOX_LISTTHIRD}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchListThirdData]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!selectedClientId) return;
      try {
        const options = {
          headers: {
            "x-client-id": 27,
          },
        };

        await fetchYear(`${ENDPOINTS.BALANCE_SHEET_YEAR}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [selectedClientId, fetchYear]);

  useEffect(() => {
    if (yearData) {
      setYears(yearData);
    }
  }, [yearData]);

  const validateYear = (isSend) => {
    const hasSelectedYear = filters.year || filters.yearOne || filters.yearTwo;

    if (!hasSelectedYear) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        `Debes seleccionar un año para poder ${isSend ? "enviar" : "descargar"} el excel`
      );
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleCheckboxChange = (event) => {
    setFilters((prev) => ({ ...prev, signature: event.target.checked }));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const languageYesSignature =
    selectedLanguage === "es" ? "Sí, tendrá una firma." : "Yes, it will have a signature";

  const languageNotSignature =
    selectedLanguage === "es" ? "No se necesita firma" : "No signature needed";

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
              <MDSearch selectedLanguage={selectedLanguage} selectedValue={setIsYearDisabled} />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox m={3} display="flex" gap={2} alignItems="center">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel id="year">{selectedLanguage === "es" ? "Año" : "Year"}</InputLabel>
                <Select
                  label="año"
                  labelId="year"
                  IconComponent={ExpandMore}
                  value={filters.year}
                  disabled={!isYearDisabled}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, year: e.target.value }));
                  }}
                  inputProps={{
                    startAdornment: <CalendarToday fontSize="small" />,
                  }}
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
                    {selectedLanguage === "es" ? "Seleccione un Año" : " Select a year"}
                  </MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year.year} value={year.year.toString()}>
                      {year.year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel id="month">{selectedLanguage === "es" ? "Mes" : "Month"}</InputLabel>
                <Select
                  label={selectedLanguage === "es" ? "Mes" : "Month"}
                  labelId="month"
                  IconComponent={ExpandMore}
                  value={filters.month}
                  disabled={!isYearDisabled || !filters.year}
                  onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
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
                    {selectedLanguage === "es" ? "Seleccione un Mes" : " Select a Month"}
                  </MenuItem>
                  {monthData?.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  disabled={!isYearDisabled || !filters.year}
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
                    {selectedLanguage === "es" ? "Seleccione Tercero" : "Select third"}
                  </MenuItem>
                  <MenuItem
                    value={""}
                    sx={{
                      border: "1px solid #e0e0e0",
                      marginTop: 1,
                      paddingTop: 1,
                      color: "text.secondary",
                    }}
                  >
                    {selectedLanguage === "es" ? "Quitar tercero" : "Remove third"}
                  </MenuItem>
                  {listThirdData.map((item) => (
                    <MenuItem key={item.identificacionTercero} value={item.identificacionTercero}>
                      {item.nombreTercero}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </MDBox>
        <Grid container spacing={2} display={"flex"} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={6}>
            <FormGroup>
              <MDTypography
                ml={4}
                mt={1}
                variant="caption"
                fontWeight="regular"
                sx={{ fontSize: "16px" }}
              >
                {selectedLanguage === "es"
                  ? "¿Será necesaria una firma?"
                  : " Will it require a signature?"}
              </MDTypography>
              <FormControlLabel
                sx={{
                  ml: "23px",
                  mb: "30px",
                }}
                control={
                  <Checkbox
                    checked={filters.signature}
                    onChange={handleCheckboxChange}
                    ml={3}
                    color="primary"
                  />
                }
                label={filters.signature ? languageYesSignature : languageNotSignature}
              />
            </FormGroup>
          </Grid>
        </Grid>
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
                  <ButtonSendXLS
                    selectedLanguage={selectedLanguage}
                    filters={filters}
                    validateYear={validateYear}
                    setSnackbarSeverity={setSnackbarSeverity}
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarOpen={setSnackbarOpen}
                  />
                  <ButtonXLS
                    selectedLanguage={selectedLanguage}
                    filters={filters}
                    validateYear={validateYear}
                    setSnackbarSeverity={setSnackbarSeverity}
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarOpen={setSnackbarOpen}
                  />
                  <ButtonPDF
                    filters={filters}
                    selectedLanguage={selectedLanguage}
                    validateYear={validateYear}
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

export default CashBox;
