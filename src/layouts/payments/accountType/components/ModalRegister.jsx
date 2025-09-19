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
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ENDPOINTS from "services/endpoints";
import usePut from "hooks/usePut";
import { useEffect } from "react";
import usePost from "hooks/usePost";

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

  const {
    data: editedData,
    error: errorEditData,
    putData,
  } = usePut(`${ENDPOINTS.ACCOUNT_TYPE}${formData?.id}`, {
    "Content-Type": "application/json",
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

  const formik = useFormik({
    initialValues: {
      nombre: formData?.nombre || "",
      codigo: formData?.codigo || "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("Requerido"),
      codigo: Yup.string().required("Requerido"),
    }),

    onSubmit: async (values) => {
      if (isEditing) {
        try {
          const payload = {
            nombre: values.nombre,
            codigo: values.codigo,
          };

          await putData(payload);

          const updatedNodeData = {
            id: formData.id,
            nombre: values.nombre,
            codigo: values.codigo,
          };

          setNodes((prevNodes) => {
            const cleanedNodes = prevNodes
              .filter((n) => n.data.id !== formData.id)
              .map((n) => ({
                ...n,
                children: n.children ? n.children.filter((c) => c.data.id !== formData.id) : [],
              }));

            if (!values.idPadre) {
              return [
                ...cleanedNodes,
                {
                  key: formData.id.toString(),
                  data: updatedNodeData,
                  leaf: true,
                },
              ];
            }

            return cleanedNodes.map((node) => {
              if (node.data.id === values.idPadre) {
                return {
                  ...node,
                  children: [
                    ...(node.children || []),
                    {
                      key: `${values.idPadre}-${formData.id}`,
                      data: updatedNodeData,
                      leaf: true,
                    },
                  ],
                  leaf: false,
                };
              }

              if (node.children) {
                return {
                  ...node,
                  children: node.children.map((child) => {
                    if (child.data.id === values.idPadre) {
                      return {
                        ...child,
                        children: [
                          ...(child.children || []),
                          {
                            key: `${values.idPadre}-${formData.id}`,
                            data: updatedNodeData,
                            leaf: true,
                          },
                        ],
                        leaf: false,
                      };
                    }
                    return child;
                  }),
                };
              }

              return node;
            });
          });
          onClose();
        } catch (error) {
          console.error("Error al actualizar:", error);
        }
      } else if (isAdding) {
        try {
          const payload = {
            nombre: values.nombre,
            codigo: values.codigo,
          };

          const response = await postData(ENDPOINTS.ACCOUNT_TYPE, payload, {
            "Content-Type": "application/json",
          });

          if (response) {
            const newNode = {
              key: response.id.toString(),
              data: {
                ...response,
                id: response.id,
                nombre: response.nombre,
                codigo: response.codigo,
              },
              leaf: true,
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
                  <MDTypography variant="p">Nombre:</MDTypography>
                  <TextField
                    fullWidth
                    name="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                    placeholder="Nombre"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="p">Código:</MDTypography>
                  <TextField
                    fullWidth
                    name="codigo"
                    value={formik.values.codigo}
                    onChange={formik.handleChange}
                    error={formik.touched.codigo && Boolean(formik.errors.codigo)}
                    helperText={formik.touched.codigo && formik.errors.codigo}
                    placeholder="Código"
                  />
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
