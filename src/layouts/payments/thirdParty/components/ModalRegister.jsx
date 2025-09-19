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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ENDPOINTS from "services/endpoints";
import usePut from "hooks/usePut";
import { useEffect } from "react";
import usePost from "hooks/usePost";
import { ExpandMore } from "@mui/icons-material";
import useGetWithParams from "hooks/useGetWithParams";
import { useClient } from "context/ClientContext";

const identifications = [
  { id: 1, name: "Cedula" },
  { id: 3, name: "Nit" },
];

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

  console.log(initialValues);

  const {
    data: editedData,
    error: errorEditData,
    putData,
  } = usePut(`${ENDPOINTS.THRID_PARTY}${formData?.id}`, {
    "Content-Type": "application/json",
    "x-client-id": selectedClientId,
  });

  const { data: addData = {}, error: addError, postData } = usePost();
  const { data: accountTypeData, fetchData: fetchAccountType } = useGetWithParams();
  const { data: bankData, fetchData: fetchBankData } = useGetWithParams();

  const tipoCuenta = accountTypeData.find((item) => item.nombre === formData?.tipoCuentaBancaria);

  const tipoDocumento = identifications.find((item) => item.name === formData?.tipoDocumento);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": selectedClientId,
          },
        };

        await fetchAccountType(`${ENDPOINTS.ACCOUNT_TYPE}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchAccountType]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": selectedClientId,
          },
        };

        await fetchBankData(`${ENDPOINTS.BANK_PARAMETERS_ID}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchAccountType]);

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

  const getAccoutName = (id) => {
    const account = accountTypeData.find((item) => item.id === Number(id));
    return account ? account.nombre : "Desconocido";
  };

  const getDocumentName = (id) => {
    const doc = identifications.find((item) => item.id === Number(id));
    return doc ? doc.name : "Desconocido";
  };

  const formik = useFormik({
    initialValues: {
      identificacion: formData?.identificacion || "",
      nombre: formData?.nombre || "",
      bancoPagador: formData?.banco || "",
      tipoProveedorEs: formData?.tipoProveedorEs || "",
      tipoProveedorEn: formData?.tipoProveedorEn || "",
      tipoCuentaBancaria: tipoCuenta?.id?.toString() || "",
      cuentaBancaria: formData?.cuentaBancaria || "",
      tipoDocumento: tipoDocumento?.id?.toString() || "",
      correoElectronico: formData?.correoElectronico || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      identificacion: Yup.string().required("Requerido"),
      nombre: Yup.string().required("Requerido"),
      bancoPagador: Yup.string().required("Requerido"),
      tipoProveedorEs: Yup.string().required("Requerido"),
      tipoProveedorEn: Yup.string().required("Requerido"),
      tipoCuentaBancaria: Yup.string().required("Requerido"),
      cuentaBancaria: Yup.string().required("Requerido"),
      tipoDocumento: Yup.string().required("Requerido"),
      correoElectronico: Yup.string().required("Requerido"),
    }),

    onSubmit: async (values, { resetForm }) => {
      console.log("Valores enviados:", values);
      if (isEditing) {
        try {
          const payload = {
            identificacion: values.identificacion,
            nombre: values.nombre,
            codigoACH: values.bancoPagador,
            tipoProveedorEs: values.tipoProveedorEs,
            tipoProveedorEn: values.tipoProveedorEn,
            tipoCuentaBancaria: values.tipoCuentaBancaria,
            cuentaBancaria: values.cuentaBancaria,
            tipoDocumento: values.tipoDocumento,
            correoElectronico: values.correoElectronico,
          };

          await putData(payload);

          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.data.id === formData.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      ...values,
                      tipoCuentaBancaria: getAccoutName(values.tipoCuentaBancaria),
                      tipoDocumento: getDocumentName(values.tipoDocumento),
                    },
                  }
                : node
            )
          );

          resetForm();
          onClose();
        } catch (error) {
          console.error("Error al actualizar:", error);
        }
      } else if (isAdding) {
        try {
          const payload = {
            identificacion: values.identificacion,
            nombre: values.nombre,
            codigoACH: values.bancoPagador,
            tipoProveedorEs: values.tipoProveedorEs,
            tipoProveedorEn: values.tipoProveedorEn,
            tipoCuentaBancaria: values.tipoCuentaBancaria,
            cuentaBancaria: values.cuentaBancaria,
            tipoDocumento: values.tipoDocumento,
            correoElectronico: values.correoElectronico,
          };

          const response = await postData(ENDPOINTS.THRID_PARTY, payload, {
            "Content-Type": "application/json",
            "x-client-id": selectedClientId,
          });

          if (response) {
            const newNode = {
              key: response.id.toString(),
              data: {
                ...response,
                id: response.id,
                identificacion: response.identificacion,
                nombre: response.nombre,
                bancoPagador: response.bancoPagador,
                tipoProveedorEs: response.tipoProveedorEs,
                tipoProveedorEn: response.tipoProveedorEn,
                tipoCuentaBancaria: getAccoutName(response.tipoCuentaBancaria),
                cuentaBancaria: response.cuentaBancaria,
                tipoDocumento: getDocumentName(response.tipoDocumento),
                correoElectronico: response.correoElectronico,
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
            });

            resetForm();
            onClose();
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    },
  });

  return (
    <StyledDialog
      open={opened}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: "620px",
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
                <Grid item xs={12} sm={6} md={6}>
                  <MDTypography variant="p">Identificación:</MDTypography>
                  <TextField
                    fullWidth
                    name="identificacion"
                    value={formik.values.identificacion}
                    onChange={formik.handleChange}
                    error={formik.touched.identificacion && Boolean(formik.errors.identificacion)}
                    helperText={formik.touched.identificacion && formik.errors.identificacion}
                    placeholder="Identificacion"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
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
              </Grid>

              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={6} md={6}>
                  <MDTypography variant="p">Tipo Proveedor Es:</MDTypography>
                  <TextField
                    fullWidth
                    name="tipoProveedorEs"
                    value={formik.values.tipoProveedorEs}
                    onChange={formik.handleChange}
                    error={formik.touched.tipoProveedorEs && Boolean(formik.errors.tipoProveedorEs)}
                    helperText={formik.touched.tipoProveedorEs && formik.errors.tipoProveedorEs}
                    placeholder="Tipo Proveedor Es"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <MDTypography variant="p">Tipo Proveedor En:</MDTypography>
                  <TextField
                    fullWidth
                    name="tipoProveedorEn"
                    value={formik.values.tipoProveedorEn}
                    onChange={formik.handleChange}
                    error={formik.touched.tipoProveedorEn && Boolean(formik.errors.tipoProveedorEn)}
                    helperText={formik.touched.tipoProveedorEn && formik.errors.tipoProveedorEn}
                    placeholder="Tipo Proveedor En"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} mt={1} sx={{ mb: "10px" }}>
                <Grid item xs={12} sm={6} md={6}>
                  <MDTypography variant="p">Número de Cuenta:</MDTypography>
                  <TextField
                    fullWidth
                    name="cuentaBancaria"
                    value={formik.values.cuentaBancaria}
                    onChange={formik.handleChange}
                    error={formik.touched.cuentaBancaria && Boolean(formik.errors.cuentaBancaria)}
                    helperText={formik.touched.cuentaBancaria && formik.errors.cuentaBancaria}
                    placeholder="Número de Cuenta"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <MDTypography variant="p">Correo Electrónico:</MDTypography>
                  <TextField
                    fullWidth
                    name="correoElectronico"
                    value={formik.values.correoElectronico}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.correoElectronico && Boolean(formik.errors.correoElectronico)
                    }
                    helperText={formik.touched.correoElectronico && formik.errors.correoElectronico}
                    placeholder="Correo Electrónico"
                  />
                </Grid>
              </Grid>

              <MDTypography sx={{ ml: "5px" }} variant="p">
                Banco Pagador:
              </MDTypography>
              <Grid item xs={12} sx={{ mb: "10px" }}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="bancoPagador">Banco Pagador</InputLabel>
                  <Select
                    label="Banco Pagador"
                    labelId="bancoPagador"
                    IconComponent={ExpandMore}
                    name="bancoPagador"
                    value={formik.values.bancoPagador}
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
                    <MenuItem disabled>Seleccione Código ACH</MenuItem>
                    {bankData.map((item) => (
                      <MenuItem key={item.id} value={item.codigoACH}>
                        {item.nombre}_{item.codigoACH}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <MDTypography sx={{ ml: "5px" }} variant="p">
                Tipo Cuenta:
              </MDTypography>
              <Grid item xs={12} sx={{ mb: "10px" }}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="CodigoACH">Tipo Cuenta</InputLabel>
                  <Select
                    label="Tipo Cuenta"
                    labelId="tipoCuentaBancaria"
                    IconComponent={ExpandMore}
                    name="tipoCuentaBancaria"
                    value={formik.values.tipoCuentaBancaria}
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
                    <MenuItem disabled>Seleccione Tipo de Cuenta</MenuItem>
                    {accountTypeData.map((item) => (
                      <MenuItem key={item.id} value={item.id.toString()}>
                        {item.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <MDTypography sx={{ ml: "5px" }} variant="p">
                Tipo Documento:
              </MDTypography>
              <Grid item xs={12}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="CodigoACH">Tipo Documento</InputLabel>
                  <Select
                    label="Tipo Documento"
                    labelId="tipoDocumento"
                    IconComponent={ExpandMore}
                    name="tipoDocumento"
                    value={formik.values.tipoDocumento}
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
                    <MenuItem disabled>Seleccione Tipo de Documento</MenuItem>
                    {identifications.map((item) => (
                      <MenuItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
