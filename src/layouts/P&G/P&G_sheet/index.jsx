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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import { CalendarToday, FilterList } from "@mui/icons-material";
import MDTypography from "components/MDTypography";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Tooltip from "@mui/material/Tooltip";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { ExpandMore } from "@mui/icons-material";
import { useEffect, useState } from "react";
import MDButton from "components/MDButton";
import MDSearch from "components/MDSearch";
import ThreeTableData from "./components/ThreeTableData";
import DefaultStatisticsCard from "examples/Cards/StatisticsCards/DefaultStatisticsCard";
import useGetWithParams from "hooks/useGetWithParams";
import ENDPOINTS from "services/endpoints";
import ButtonPDF from "./components/ButtonPDF";
import ButtonXLS from "./components/ButtonXLS";
import usePost from "hooks/usePost";

import ImageCAF from "../../../assets/images/logo_caf.png";
import brandWhite from "../../../assets/images/logo_caf_white.png";

import { useMaterialUIController } from "context";
import ModalNotes from "./components/ModalNotes";
import { useClient } from "context/ClientContext";
import { motion } from "framer-motion";
import ButtonSendXLS from "./components/ButtonSendXLS";

const monthsYears = [
  { id: 1, nameEs: "Mes", nameEn: "Month", value: "month" },
  { id: 2, nameEs: "Año", nameEn: "Year", value: "year" },
];

const PYGSHEET = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [visible, setVisible] = useState(false);
  const [toggleActive, setToggleActive] = useState(false);

  const [years, setYears] = useState([]);
  const [languageButtons, setlanguageButtons] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [filters, setFilters] = useState({
    year: "",
    month: 0,
    yearsMonth: "",
    dateFrom: "",
    dateTo: "",
    yearOne: "",
    yearTwo: "",
    signature: false,
    sendPDF: false,
  });

  const [cardData, setCardData] = useState({
    balanceSheet: { title: "", value: "" },
    accumulatedProfit: { title: "", value: "" },
    monthlyProfit: { title: "", value: "" },
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showModalRegister, setShowModalRegister] = useState(false);
  const [isYearDisabled, setIsYearDisabled] = useState(false);

  const { selectedClientId } = useClient();

  const { data: reportData = {}, postData } = usePost();
  const { data: yearData, fetchData: fetchYear } = useGetWithParams();
  const { data: monthData, fetchData: fetchMonth } = useGetWithParams();

  useEffect(() => {
    if (!selectedClientId || (!filters?.year && !filters.dateTo)) {
      return;
    }

    const fetchData = async () => {
      try {
        const requestBody = {
          Language: selectedLanguage,
          ...(filters.dateFrom || filters.dateTo
            ? {
                Year: null,
                Month: null,
                DateFrom: filters.dateFrom,
                DateTo: filters.dateTo,
              }
            : {
                Year: filters.year ? parseInt(filters.year) : null,
                Month: filters.month ? parseInt(filters.month) : null,
                DateFrom: null,
                DateTo: null,
              }),
        };
        const requestHeaders = {
          "x-client-id": selectedClientId,
        };
        await postData(ENDPOINTS.BALANCE_SHEET, requestBody, requestHeaders);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedClientId, selectedLanguage, filters.year, filters.month, filters.dateTo]);

  const formatCurrency = (value) => {
    const numericValue = typeof value === "number" ? value : 0;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  useEffect(() => {
    if (!selectedLanguage || !reportData) return;

    const {
      data: [, , , { texto, data: [, { total } = {}] = [] } = {}] = [],
      utilidadAcumulada: {
        texto: utilidadTexto,
        data: [, { total: utilidadTotal } = {}] = [],
      } = {},
      utilidadMes: {
        texto: utilidadMesTexto,
        data: [, { total: utilidadMesTotal } = {}] = [],
      } = {},
    } = reportData || {};

    setCardData({
      balanceSheet: {
        title: texto || "Total general ayuda",
        value: formatCurrency(total),
      },
      accumulatedProfit: {
        title: utilidadTexto || "Utilidad Acumulada",
        value: formatCurrency(utilidadTotal),
      },
      monthlyProfit: {
        title: utilidadMesTexto || "Utilidad Mes",
        value: formatCurrency(utilidadMesTotal),
      },
    });
  }, [reportData, selectedLanguage]);

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
      if (!selectedClientId) return;
      try {
        const options = {
          headers: {
            "x-client-id": selectedClientId,
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
    const hasSelectedYear =
      filters.year || filters.yearOne || filters.yearTwo || filters.dateFrom || filters.dateTo;

    if (!hasSelectedYear) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        `Debes seleccionar un año o una fecha para poder ${
          isSend ? "enviar" : "descargar"
        } el excel`
      );
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleSetVisible = () => setVisible(!visible);

  const handleCheckboxChange = (event) => {
    setFilters((prev) => ({ ...prev, signature: event.target.checked }));
  };

  const handleCheckboxChangeSend = (event) => {
    setFilters((prev) => ({ ...prev, sendPDF: event.target.checked }));
  };

  const handleToggle = () => {
    setToggleActive(!toggleActive);
    setFilters({
      year: "",
      month: 0,
      yearsMonth: "",
      dateFrom: "",
      dateTo: "",
      yearOne: "",
      yearTwo: "",
      signature: false,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const checkoutSend = selectedLanguage === "es" ? "Enviar PDF" : "Send PDF";

  const checkoutSendConfirmation =
    selectedLanguage === "es"
      ? "El PDF se enviara a su correo"
      : "The PDF will be sent to your email.";

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
                  setSelectedLanguage?.("es");
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
                  setSelectedLanguage?.("en");
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
            md="auto"
            ml={{ xs: 0, md: 3 }}
            sx={{
              order: 1,
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <MDBox display="flex" alignItems="center">
              <Switch
                checked={visible}
                onChange={handleSetVisible}
                onClick={handleToggle}
                sx={{ transform: "scale(1.2)" }}
              />
              <FilterList sx={{ color: "#2863FF", ml: "5px" }} />
              <MDTypography
                variant="caption"
                fontWeight="regular"
                sx={{ fontSize: "16px", ml: "5px" }}
              >
                {`${selectedLanguage === "es" ? "Búsqueda avanzada" : "Advanced search"} ${
                  visible
                    ? `${selectedLanguage === "es" ? "activa" : "active"}`
                    : `${selectedLanguage === "es" ? "inactiva" : "inactive"}`
                }`}
              </MDTypography>
            </MDBox>
          </Grid>
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

        {toggleActive === false ? (
          <MDBox m={3} display="flex" gap={2} alignItems="center">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="year">{selectedLanguage === "es" ? "Año" : "Year"}</InputLabel>
                  <Select
                    label="año"
                    labelId="year"
                    IconComponent={ExpandMore}
                    disabled={!isYearDisabled}
                    value={filters.year}
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
              <Grid item xs={12} sm={6} md={6}>
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
                    {monthData.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MDBox>
        ) : (
          <MDBox m={3} display="flex" gap={2} alignItems="center">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="month-year">
                    {selectedLanguage === "es" ? "Mes/Año" : "Month/Year"}
                  </InputLabel>
                  <Select
                    label={selectedLanguage === "es" ? "Mes/Año" : "Month/Year"}
                    labelId="month-year"
                    IconComponent={ExpandMore}
                    value={filters.yearsMonth}
                    disabled={!isYearDisabled}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, yearsMonth: Number(e.target.value) }))
                    }
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
                      {selectedLanguage === "es" ? "Seleccione Mes/Año" : "Select Month/Year"}
                    </MenuItem>
                    {monthsYears.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {selectedLanguage === "es" ? item.nameEs : item.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {filters.yearsMonth === 2 ? (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="medium">
                      <InputLabel id="yearsOne">
                        {selectedLanguage === "es" ? "Año 1" : "Year 1"}
                      </InputLabel>
                      <Select
                        label="Año 1"
                        labelId="yearsOne"
                        IconComponent={ExpandMore}
                        value={filters.yearOne}
                        disabled={!isYearDisabled || !filters.yearsMonth}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, yearOne: e.target.value }))
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
                          {selectedLanguage === "es" ? "Seleccione un año" : "Select a year"}
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
                      <InputLabel id="yearsTwo">
                        {selectedLanguage === "es" ? "Año 2" : "Year 2"}
                      </InputLabel>
                      <Select
                        label="Año 2"
                        labelId="yearsTwo"
                        IconComponent={ExpandMore}
                        value={filters.yearTwo}
                        disabled={!isYearDisabled || !filters.yearsMonth}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, yearTwo: e.target.value }))
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
                          {selectedLanguage === "es" ? "Seleccione un año" : "Select a year"}
                        </MenuItem>
                        {years.map((year) => (
                          <MenuItem key={year.year} value={year.year.toString()}>
                            {year.year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label={selectedLanguage === "es" ? "Desde" : "from"}
                      type="date"
                      value={filters.dateFrom}
                      disabled={!isYearDisabled || !filters.yearsMonth}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                      }
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
                    <TextField
                      fullWidth
                      label={selectedLanguage === "es" ? "Hasta" : "to"}
                      type="date"
                      value={filters.dateTo}
                      disabled={!isYearDisabled || !filters.yearsMonth}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
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
                </>
              )}
            </Grid>
          </MDBox>
        )}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={5}>
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
                  ? "¿Deseas enviar el PDF al correo?"
                  : " Do you want to send the PDF to the email?"}
              </MDTypography>
              <FormControlLabel
                sx={{
                  ml: "23px",
                  mb: "30px",
                }}
                control={
                  <Checkbox
                    checked={filters.sendPDF}
                    onChange={handleCheckboxChangeSend}
                    ml={3}
                    color="primary"
                  />
                }
                label={filters.sendPDF ? checkoutSendConfirmation : checkoutSend}
              />
            </FormGroup>
          </Grid>
          {filters.month !== 0 && (
            <Grid
              item
              xs={12}
              mr={{ xs: 0, md: 5 }}
              md
              sx={{
                order: 2,
                display: "flex",
                cursor: "pointer",
                justifyContent: { xs: "center", md: "flex-end" },
                mb: "30px",
              }}
            >
              <Tooltip title="Agregar notas" arrow placement="top">
                <MDBox
                  onClick={() => setShowModalRegister(true)}
                  sx={{
                    display: "flex",
                    mt: "15px",
                    cursor: "pointer",
                    justifyContent: { xs: "center", md: "flex-end" },
                    backgroundColor: "#E3F2FD",
                    borderRadius: "8px",
                    padding: "5px",
                    width: "45px",
                    height: "45px",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      backgroundColor: "#add8e6",
                    },
                  }}
                >
                  <EditNoteIcon sx={{ color: "#1976D2" }} fontSize="large" />
                </MDBox>
              </Tooltip>
            </Grid>
          )}
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
                  <ButtonPDF filters={filters} selectedLanguage={selectedLanguage} />
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
      <ModalNotes
        opened={showModalRegister}
        onClose={() => {
          setShowModalRegister(false);
        }}
        filters={filters}
        monthData={monthData}
        setSnackbarSeverity={setSnackbarSeverity}
        setSnackbarMessage={setSnackbarMessage}
        setSnackbarOpen={setSnackbarOpen}
      />
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

export default PYGSHEET;
