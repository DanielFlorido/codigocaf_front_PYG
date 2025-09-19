// @mui material components
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { Card, Snackbar, Alert, Icon } from "@mui/material";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useEffect, useState } from "react";
import MDButton from "components/MDButton";
import MDSearch from "components/MDSearch";
import ThreeTableData from "./components/ThreeTableData";
import ModalRegister from "./components/ModalRegister";
import ENDPOINTS from "services/endpoints";

const BancosParameters = () => {
  const [showModalRegister, setShowModalRegister] = useState(false);
  const [textModal, setTextModal] = useState({
    newClass: "",
    newClassChild: "",
    editClass: "",
    deleteClass: "",
  });
  const [deleteClass, setDeleteClass] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [mode, setMode] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [nodes, setNodes] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  useEffect(() => {
    if (selectedLanguage) {
      setSelectedLanguage("es");
    }
  }, []);

  const handleOpenDeleteModal = (id) => {
    setSelectedId(id);
    setShowModalRegister(true);
    setTextModal((prev) => ({
      ...prev,
      newClassChild: "Eliminar Clase",
    }));
    setDeleteClass(true);
    setSelectedRow(null);
    setMode("delete");
  };

  const deleteNodeFromTree = (nodes, nodeId) => {
    return nodes
      .filter((node) => node.data.id !== nodeId)
      .map((node) => {
        if (node.children) {
          return {
            ...node,
            children: deleteNodeFromTree(node.children, nodeId),
            leaf: node.children.length === 1 && node.children.some((c) => c.data.id === nodeId),
          };
        }
        return node;
      });
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      const fullUrl = `${ENDPOINTS.BANK_PARAMETERS_ID}${selectedId}`;
      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.Mensaje ||
          responseData.message ||
          `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      setNodes((prevNodes) => {
        const newNodes = deleteNodeFromTree(prevNodes, selectedId);

        return newNodes;
      });
      setSnackbarSeverity("success");
      setSnackbarMessage(responseData.Mensaje || "Registro eliminado exitosamente");
      setSnackbarOpen(true);
      setShowModalRegister(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage(error.Mensaje || "Error al eliminar el registro");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={4} pb={3}>
        <Card>
          <MDTypography variant="h3" fontWeight="medium" textAlign={"center"} mt={3}>
            Configuración de Bancos
          </MDTypography>
          <Grid container spacing={2} mt={4}>
            <Grid
              item
              xs={12}
              ml={{ xs: 0, md: 3 }}
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
                  variant="gradient"
                  color="info"
                  aria-hidden="true"
                  onClick={() => {
                    setShowModalRegister(true);
                    setTextModal((prevState) => ({
                      ...prevState,
                      newClassChild: "Agregar Nuevo Banco",
                    }));
                    setDeleteClass(false);
                    setSelectedRow(null);
                    setMode("add");
                  }}
                >
                  <Icon sx={{ fontSize: 20, marginRight: 1 }}>add</Icon> Nuevo Banco
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
          <MDBox p={3} lineHeight={1}>
            <MDTypography variant="h5" fontWeight="medium">
              Busqueda de datos
            </MDTypography>
            <MDTypography variant="button" color="text">
              Aquí puedes buscar los registros que desees
            </MDTypography>
            <MDBox marginTop={4} paddingBottom={4}>
              <ThreeTableData
                setShowModalRegister={setShowModalRegister}
                setTextModal={setTextModal}
                setDeleteClass={setDeleteClass}
                setSelectedRow={setSelectedRow}
                setMode={setMode}
                handleOpenDeleteModal={handleOpenDeleteModal}
                nodes={nodes}
                setNodes={setNodes}
              />
            </MDBox>
          </MDBox>
        </Card>
        <ModalRegister
          opened={showModalRegister}
          onClose={() => {
            setShowModalRegister(false);
          }}
          textModal={textModal}
          deleteClass={deleteClass}
          initialValues={selectedRow || {}}
          mode={mode}
          confirmDelete={confirmDelete}
          setNodes={setNodes}
          setSnackbarSeverity={setSnackbarSeverity}
          setSnackbarMessage={setSnackbarMessage}
          setSnackbarOpen={setSnackbarOpen}
        />
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

export default BancosParameters;
