// @mui material components
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { Card, Snackbar, Alert, Tooltip } from "@mui/material";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useEffect, useState } from "react";
import MDButton from "components/MDButton";
import MDSearch from "components/MDSearch";
import usePost from "hooks/usePost";
import ENDPOINTS from "services/endpoints";
import { useClient } from "context/ClientContext";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import ModalImages from "./components/ModalImages";
import ImageCAF from "../../../assets/images/logo_caf.png";
import brandWhite from "../../../assets/images/logo_caf_white.png";

import { useMaterialUIController } from "context";

const ClientLogo = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [showModalRegister, setShowModalRegister] = useState(false);
  const [imageName, setImageName] = useState("");
  const [imageNumber, setImageNumber] = useState(1);
  const [languageButtons, setlanguageButtons] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const { selectedClientId } = useClient();
  const { data: clientLogoData, postData } = usePost();

  useEffect(() => {
    logoRecovery();
  }, [selectedClientId]);

  const logoRecovery = async () => {
    try {
      const requestBodyClient = {
        IdCliente: selectedClientId,
        IdUsuario: 4,
      };

      const requestHeaders = {
        "Content-Type": "application/json",
        "x-client-id": selectedClientId,
      };

      await postData(ENDPOINTS.CLIENT_LOGO, requestBodyClient, requestHeaders);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
              <MDSearch selectedLanguage={selectedLanguage} />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox p={3} lineHeight={1}>
          <Grid container spacing={2} display={"flex"} justifyContent="space-between">
            <Grid item xs={12} sm={12} md={12} mb={2}>
              <MDBox>
                <MDTypography variant="h5" fontWeight="medium" textAlign={"center"} color="info">
                  {selectedLanguage === "es" ? "Visualizador Logos" : "Viewer Logos"}
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6} md={6} textAlign={"center"}>
              <MDTypography variant="h10" fontWeight="small">
                {selectedLanguage === "es" ? "Logo Principal" : "Main Logo"}
              </MDTypography>
              <MDBox display={"flex"} alignItems={"center"} justifyContent={"center"}>
                <MDBox mt={2} mr={2}>
                  <img
                    width={100}
                    src={
                      clientLogoData?.logoPrincipal
                        ? `data:image/jpeg;base64,${clientLogoData?.logoPrincipal}`
                        : null
                    }
                  />
                </MDBox>
                <Tooltip
                  title={selectedLanguage === "es" ? "Cambiar" : "Change"}
                  arrow
                  placement="top"
                >
                  <MDBox
                    onClick={() => {
                      setShowModalRegister(true);
                      setImageName(selectedLanguage === "es" ? "Logo Principal" : "Main Logo");
                      setImageNumber(1);
                    }}
                    sx={{
                      display: "flex",
                      mt: "15px",
                      cursor: "pointer",
                      justifyContent: { xs: "center", md: "flex-end" },
                      backgroundColor: "#E3F2FD",
                      borderRadius: "8px",
                      padding: "5px",
                      width: "30px",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        backgroundColor: "#add8e6",
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ color: "#1976D2" }} ml={2} fontSize="medium" />
                  </MDBox>
                </Tooltip>
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6} md={6} textAlign={"center"}>
              <MDTypography variant="h10" fontWeight="small">
                {selectedLanguage === "es" ? "Logo Auxiliar" : "Auxiliary Logo"}
              </MDTypography>
              <MDBox display={"flex"} alignItems={"center"} justifyContent={"center"}>
                <MDBox mt={2} mr={2}>
                  <img
                    width={100}
                    src={
                      clientLogoData?.logoAuxiliar
                        ? `data:image/jpeg;base64,${clientLogoData?.logoAuxiliar}`
                        : null
                    }
                  />
                </MDBox>
                <Tooltip
                  title={selectedLanguage === "es" ? "Cambiar" : "Change"}
                  arrow
                  placement="top"
                >
                  <MDBox
                    onClick={() => {
                      setShowModalRegister(true);
                      setImageName(selectedLanguage === "es" ? "Logo Auxiliar" : "Auxiliary Logo");
                      setImageNumber(2);
                    }}
                    sx={{
                      display: "flex",
                      mt: "15px",
                      cursor: "pointer",
                      justifyContent: { xs: "center", md: "flex-end" },
                      backgroundColor: "#E3F2FD",
                      borderRadius: "8px",
                      padding: "5px",
                      width: "30px",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        backgroundColor: "#add8e6",
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ color: "#1976D2" }} ml={2} fontSize="medium" />
                  </MDBox>
                </Tooltip>
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6} md={4} mt={5} mb={2} textAlign={"center"}>
              <MDTypography variant="h10" fontWeight="small">
                {selectedLanguage === "es" ? "Firma Gerente" : "Manager Signature"}
              </MDTypography>
              <MDBox display={"flex"} alignItems={"center"} justifyContent={"center"}>
                <MDBox mt={2} mr={2}>
                  <img
                    width={150}
                    src={
                      clientLogoData?.firmaGerente
                        ? `data:image/jpeg;base64,${clientLogoData?.firmaGerente}`
                        : null
                    }
                  />
                </MDBox>
                <Tooltip
                  title={selectedLanguage === "es" ? "Cambiar" : "Change"}
                  arrow
                  placement="top"
                >
                  <MDBox
                    onClick={() => {
                      setShowModalRegister(true);
                      setImageName(
                        selectedLanguage === "es" ? "Firma Gerente" : "Manager Signature"
                      );
                      setImageNumber(3);
                    }}
                    sx={{
                      display: "flex",
                      mt: "15px",
                      cursor: "pointer",
                      justifyContent: { xs: "center", md: "flex-end" },
                      backgroundColor: "#E3F2FD",
                      borderRadius: "8px",
                      padding: "5px",
                      width: "30px",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        backgroundColor: "#add8e6",
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ color: "#1976D2" }} ml={2} fontSize="medium" />
                  </MDBox>
                </Tooltip>
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6} md={4} mt={5} mb={2} textAlign={"center"}>
              <MDTypography variant="h10" fontWeight="small">
                {selectedLanguage === "es" ? "Firmar Revisor" : "Reviewer Signature"}
              </MDTypography>
              <MDBox display={"flex"} alignItems={"center"} justifyContent={"center"}>
                <MDBox mt={2} mr={2}>
                  <img
                    width={150}
                    src={
                      clientLogoData?.firmaRevisor
                        ? `data:image/jpeg;base64,${clientLogoData?.firmaRevisor}`
                        : null
                    }
                  />
                </MDBox>
                <Tooltip
                  title={selectedLanguage === "es" ? "Cambiar" : "Change"}
                  arrow
                  placement="top"
                >
                  <MDBox
                    onClick={() => {
                      setShowModalRegister(true);
                      setImageName(
                        selectedLanguage === "es" ? "Firma Revisor" : "Reviewer Signature"
                      );
                      setImageNumber(4);
                    }}
                    sx={{
                      display: "flex",
                      mt: "15px",
                      cursor: "pointer",
                      justifyContent: { xs: "center", md: "flex-end" },
                      backgroundColor: "#E3F2FD",
                      borderRadius: "8px",
                      padding: "5px",
                      width: "30px",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        backgroundColor: "#add8e6",
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ color: "#1976D2" }} fontSize="medium" />
                  </MDBox>
                </Tooltip>
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6} md={4} mt={5} mb={2} textAlign={"center"}>
              <MDTypography variant="h10" fontWeight="small">
                {selectedLanguage === "es" ? "Firma Contador" : "Accountant Signature"}
              </MDTypography>
              <MDBox display={"flex"} alignItems={"center"} justifyContent={"center"}>
                <MDBox mt={2} mr={2}>
                  <img
                    width={150}
                    src={
                      clientLogoData?.firmaContador
                        ? `data:image/jpeg;base64,${clientLogoData?.firmaContador}`
                        : null
                    }
                  />
                </MDBox>
                <Tooltip
                  title={selectedLanguage === "es" ? "Cambiar" : "Change"}
                  arrow
                  placement="top"
                >
                  <MDBox
                    onClick={() => {
                      setShowModalRegister(true);
                      setImageName(
                        selectedLanguage === "es" ? "Firma Contador" : "Accountant Signature"
                      );
                      setImageNumber(5);
                    }}
                    sx={{
                      display: "flex",
                      mt: "15px",
                      cursor: "pointer",
                      justifyContent: { xs: "center", md: "flex-end" },
                      backgroundColor: "#E3F2FD",
                      borderRadius: "8px",
                      padding: "5px",
                      width: "30px",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        backgroundColor: "#add8e6",
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ color: "#1976D2" }} ml={2} fontSize="medium" />
                  </MDBox>
                </Tooltip>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </Card>
      <Footer selectedLanguage={selectedLanguage} />
      <ModalImages
        opened={showModalRegister}
        onClose={(value) => {
          setShowModalRegister(false);
          if (value) {
            logoRecovery();
          }
        }}
        IdCliente={selectedClientId}
        IdUsuario={4}
        selectedLanguage={selectedLanguage}
        clientLogo={clientLogoData}
        imageName={imageName}
        imageNumber={imageNumber}
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

export default ClientLogo;
