import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { StyledDialog, StyledDialogContent, StyledDialogActions } from "./StyledDialog";
import MDButton from "components/MDButton";
import {
  Grid,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ENDPOINTS from "services/endpoints";
import usePut from "hooks/usePut";
import { useEffect } from "react";
import usePost from "hooks/usePost";
import { useClient } from "context/ClientContext";

const ModalRegister = ({
  opened,
  onClose,
  textModal,
  initialValues,
  deleteClass,
  mode,
  confirmDelete,
  setNodes,
  setSnackbarSeverity,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const isEditing = mode === "edit";
  const isAdding = mode === "add";
  const isAddingChild = mode === "addChild";
  const isDeleting = deleteClass;

  const formData = initialValues?.data || initialValues;
  const { selectedClientId } = useClient();

  const {
    data: editedData,
    error: errorEditData,
    putData,
  } = usePut(`${ENDPOINTS.BALANCE_PARAMETERS_ID}${formData?.id}`, {
    "Content-Type": "application/json",
    "x-client-id": selectedClientId,
  });

  const { data: addData = {}, error: addError, postData } = usePost();

  useEffect(() => {
    if (editedData) {
      setSnackbarSeverity("info");
      setSnackbarMessage("Registro actulizado exitosamente");
      setSnackbarOpen(true);
    } else if (errorEditData) {
      setSnackbarSeverity("error");
      setSnackbarMessage(responseData.Mensaje || "Operación completada exitosamente");
      setSnackbarOpen(true);
    } else if (addData) {
      setSnackbarSeverity("success");
      setSnackbarMessage("Registro creado exitosamente");
      setSnackbarOpen(true);
    } else if (addError) {
      setSnackbarSeverity("error");
      setSnackbarMessage(addError.message || "Error al crear registro");
      setSnackbarOpen(true);
    }
  }, [editedData, errorEditData, addData, addError]);

  const updateNodeInTree = (nodes, targetId, newNodeData, parentId = null) => {
    return nodes.map((node) => {
      if (node.data.id === targetId) {
        return {
          ...node,
          data: newNodeData,
        };
      }

      if (node.children) {
        const updatedChildren = updateNodeInTree(node.children, targetId, newNodeData, parentId);

        if (parentId && node.data.id === parentId) {
          const childExists = updatedChildren.some((child) => child.data.id === targetId);
          if (!childExists) {
            updatedChildren.push({
              key: `${parentId}-${targetId}`,
              data: newNodeData,
              leaf: true,
            });
          }
        }

        return {
          ...node,
          children: updatedChildren,
          leaf: updatedChildren.length === 0,
        };
      }

      return node;
    });
  };

  const formik = useFormik({
    initialValues: {
      codigo: formData?.codigo || "",
      nombreEs: formData?.nombreEs || "",
      nombreEn: formData?.nombreEn || "",
      posPreEs: formData?.posPreEs || "",
      posPreEn: formData?.posPreEn || "",
      amortizacionIntereses:
        formData?.depreciacion === "SI" ? true : formData?.depreciacion === "No" ? false : "",
      idPadre: formData?.idPadre || null,
      idCliente: formData?.idCliente || 27,
    },
    validationSchema: Yup.object({
      codigo: Yup.number().required("Requerido"),
      nombreEs: Yup.string().required("Requerido"),
      nombreEn: Yup.string().required("Requerido"),
      posPreEs: Yup.string().required("Requerido"),
      posPreEn: Yup.string().required("Requerido"),
    }),

    onSubmit: async (values) => {
      if (isEditing) {
        try {
          const payload = {
            codigo: values.codigo,
            nombreEs: values.nombreEs,
            nombreEn: values.nombreEn,
            posPreEs: values.posPreEs,
            posPreEn: values.posPreEn,
            depreciacion: values.amortizacionIntereses ? "SI" : "NO",
            idPadre: values.idPadre,
            idCliente: values.idCliente,
          };

          await putData(payload);

          const updatedNodeData = {
            id: formData.id,
            codigo: values.codigo,
            nombreEs: values.nombreEs,
            nombreEn: values.nombreEn,
            posPreEs: values.posPreEs,
            posPreEn: values.posPreEn,
            idPadre: values.idPadre,
            amortizacionIntereses: values.amortizacionIntereses,
          };

          setNodes((prevNodes) => {
            const updatedNodes = updateNodeInTree(
              prevNodes,
              formData.id,
              updatedNodeData,
              values.idPadre
            );

            return updatedNodes;
          });
          onClose();
        } catch (error) {
          console.error("Error al actualizar:", error);
        }
      } else if (isAdding || isAddingChild) {
        try {
          const payload = {
            codigo: values.codigo,
            nombreEs: values.nombreEs,
            nombreEn: values.nombreEn,
            posPreEs: values.posPreEs,
            posPreEn: values.posPreEn,
            depreciacion: values.amortizacionIntereses ? "SI" : "NO",
            idPadre: isAddingChild ? formData.idPadre : null,
            idCliente: values.idCliente,
          };

          const response = await postData(ENDPOINTS.BALANCE_PARAMETERS_ID, payload, {
            "x-client-id": selectedClientId,
          });

          if (response) {
            const newNode = {
              key: isAddingChild ? `${values.idPadre}-${response.id}` : response.id.toString(),
              data: {
                ...response,
                id: response.id,
                codigo: response.codigo,
                nombreEs: response.nombreEs,
                nombreEn: response.nombreEn,
                posPreEs: response.posPreEs,
                posPreEn: response.posPreEn,
                amortizacionIntereses: values.amortizacionIntereses,
                idPadre: isAddingChild ? values.idPadre : null,
                depreciacion: values.amortizacionIntereses ? "Sí" : "No",
              },
              leaf: true,
              style: {
                fontSize: "14px",
                backgroundColor: "#f9f9f9",
              },
            };

            setNodes((prevNodes) => {
              if (!isAddingChild) {
                return [...prevNodes, newNode];
              }

              const addChildToParent = (nodes) => {
                return nodes.map((node) => {
                  if (node.data.id === formData.idPadre) {
                    return {
                      ...node,
                      children: [...(node.children || []), newNode],
                      leaf: false,
                    };
                  }

                  if (node.children) {
                    return {
                      ...node,
                      children: addChildToParent(node.children),
                    };
                  }

                  return node;
                });
              };

              return addChildToParent(prevNodes);
            });

            onClose();
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    },
    enableReinitialize: true,
  });

  return (
    <StyledDialog
      open={opened}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: "520px",
        },
      }}
    >
      {!isDeleting && (
        <Grid container spacing={1} justifyContent={"space-between"}>
          <Grid
            item
            xs={12}
            md="auto"
            sx={{
              order: { xs: 2, md: 2 },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <MDTypography sx={{ mb: 2, mt: 2, ml: 2 }} variant="h5" fontWeight="medium">
              {textModal.newClassChild}
            </MDTypography>
          </Grid>
          <Grid
            item
            xs={12}
            mt={1}
            mr={2}
            md="auto"
            sx={{
              order: { xs: 2, md: 2 },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: "#fff",
                color: "#999999",
                width: 40,
                height: 40,
                borderRadius: "50%",
                "&:hover": { backgroundColor: "#e8e8e8" },
              }}
            >
              <HighlightOffOutlinedIcon fontSize="medium" />
            </IconButton>
          </Grid>
        </Grid>
      )}
      <form onSubmit={formik.handleSubmit}>
        <StyledDialogContent sx={{ mt: "-13px" }}>
          {isDeleting ? (
            <MDBox sx={{ p: 3 }}>
              <MDBox display={"flex"} justifyContent={"center"}>
                <IconButton
                  sx={{
                    backgroundColor: "#ffdbdb",
                    color: "#ff0000",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    cursor: "none",
                  }}
                >
                  <WarningAmberOutlinedIcon fontSize="large" />
                </IconButton>
              </MDBox>
              <DialogTitle>
                <MDTypography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                >
                  ¿Está seguro?
                </MDTypography>
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ fontSize: "1rem" }}>
                  Esta acción no se puede deshacer. El registro será eliminado permanentemente de
                  nuestros servidores.
                </DialogContentText>
              </DialogContent>
            </MDBox>
          ) : (
            <MDBox p={1}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDTypography variant="p">Código:</MDTypography>
                  <TextField
                    fullWidth
                    name="codigo"
                    value={formik.values.codigo}
                    onChange={formik.handleChange}
                    placeholder="Código"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="p">Nombre Español:</MDTypography>
                  <TextField
                    fullWidth
                    name="nombreEs"
                    value={formik.values.nombreEs}
                    onChange={formik.handleChange}
                    error={formik.touched.nombreEs && Boolean(formik.errors.nombreEs)}
                    helperText={formik.touched.nombreEs && formik.errors.nombreEs}
                    placeholder="Nombre Español"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="p">Nombre Inglés:</MDTypography>
                  <TextField
                    fullWidth
                    name="nombreEn"
                    value={formik.values.nombreEn}
                    onChange={formik.handleChange}
                    error={formik.touched.nombreEn && Boolean(formik.errors.nombreEn)}
                    helperText={formik.touched.nombreEn && formik.errors.nombreEn}
                    placeholder="Nombre ingles"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="p">Pospre Español:</MDTypography>
                  <TextField
                    fullWidth
                    name="posPreEs"
                    value={formik.values.posPreEs}
                    onChange={formik.handleChange}
                    error={formik.touched.posPreEs && Boolean(formik.errors.posPreEs)}
                    helperText={formik.touched.posPreEs && formik.errors.posPreEs}
                    placeholder="Pospre Español"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="p">Pospre Inglés:</MDTypography>
                  <TextField
                    fullWidth
                    name="posPreEn"
                    value={formik.values.posPreEn}
                    onChange={formik.handleChange}
                    error={formik.touched.posPreEn && Boolean(formik.errors.posPreEn)}
                    helperText={formik.touched.posPreEn && formik.errors.posPreEn}
                    placeholder="Pospre Inglés"
                  />
                </Grid>

                <MDTypography sx={{ ml: "16px", mt: "10px" }} variant="p">
                  Depreciación:
                </MDTypography>
                <Grid item xs={12}>
                  <FormControl fullWidth size="medium">
                    <InputLabel id="amortizacionIntereses">Depreciación</InputLabel>
                    <Select
                      label="Depreciación"
                      labelId="amortizacionIntereses"
                      IconComponent={ExpandMore}
                      name="amortizacionIntereses"
                      value={formik.values.amortizacionIntereses}
                      onChange={formik.handleChange}
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
                      <MenuItem disabled>Seleccione si tiene depresiación</MenuItem>
                      <MenuItem value={true}>SI</MenuItem>
                      <MenuItem value={false}>NO</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </MDBox>
          )}
        </StyledDialogContent>

        <StyledDialogActions>
          <MDButton onClick={onClose}>Cerrar</MDButton>
          {isDeleting ? (
            <MDButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                confirmDelete();
              }}
              variant="contained"
              color="error"
              type="button"
              sx={{
                minWidth: "180px",
                backgroundColor: "f00000",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              Sí, eliminar registro
            </MDButton>
          ) : (
            <MDButton color="info" type="submit">
              {isEditing ? "Actualizar" : "Guardar"}
            </MDButton>
          )}
        </StyledDialogActions>
      </form>
    </StyledDialog>
  );
};

ModalRegister.defaultProps = {
  opened: false,
  textModal: "",
  onClose: () => {},
  initialValues: {},
  deleteClass: false,
  mode: "add",
  confirmDelete: null,
};

ModalRegister.propTypes = {
  opened: PropTypes.bool,
  textModal: PropTypes.object,
  initialValues: PropTypes.object,
  onClose: PropTypes.func,
  deleteClass: PropTypes.bool,
  mode: PropTypes.oneOf(["add", "addChild", "edit", "delete", null, undefined]),
  confirmDelete: (props, propName, componentName) => {
    if (props.deleteClass && typeof props[propName] !== "function") {
      return new Error(
        `La prop '${propName}' es requerida cuando 'deleteClass' es true en ${componentName}`
      );
    }
  },
  setNodes: PropTypes.func.isRequired,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

export default ModalRegister;
