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
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import ENDPOINTS from "services/endpoints";
import { useEffect } from "react";
import usePost from "hooks/usePost";
import useGetWithParams from "hooks/useGetWithParams";

const ModalNotes = ({
  opened,
  onClose,
  filters,
  monthData,
  setSnackbarSeverity,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const { data: addData = {}, error: addError, postData } = usePost();
  const { data: yearData, fetchData: fetchYear } = useGetWithParams();

  const getMonthName = (monthId) => {
    const month = monthData?.find((item) => item.id === monthId);
    return month ? month?.name : "";
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "x-client-id": 27,
          },
        };

        const response = await fetchYear(`${ENDPOINTS.BALANCE_SHEET_YEAR}`, options);
        console.log("Respuesta de fetchYear:", response);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchYear]);

  useEffect(() => {
    if (addData) {
      setSnackbarSeverity("success");
      setSnackbarMessage("Nota creada exitosamente");
      setSnackbarOpen(true);
    } else if (addError) {
      setSnackbarSeverity("error");
      setSnackbarMessage(addError.message || "Error al crear Nota");
      setSnackbarOpen(true);
    }
  }, [addData, addError]);

  const formik = useFormik({
    initialValues: {
      NoteHead: "",
      Account: "",
      NoteValue: "",
      NoteContent: "",
      Year: "",
      Month: filters.month,
    },
    validationSchema: Yup.object({
      NoteHead: Yup.string().required("Requerido"),
      Account: Yup.number().required("Requerido"),
      NoteValue: Yup.number().required("Requerido"),
      NoteContent: Yup.string().required("Requerido"),
      Year: Yup.string().required("Requerido"),
    }),

    onSubmit: async (values) => {
      try {
        const payload = {
          NoteHead: values.NoteHead,
          Account: values.Account,
          NoteValue: values.NoteValue,
          NoteContent: values.NoteContent,
          Year: values.Year,
          Month: values.Month,
        };

        await postData(ENDPOINTS.BALANCE_SHEET_SAVENOTE, payload, {
          "x-client-id": 27,
        });
        onClose();
      } catch (error) {
        console.error("Error:", error);
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
            Agregar nueva Nota
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
      <form onSubmit={formik.handleSubmit}>
        <StyledDialogContent sx={{ mt: "-13px" }}>
          <MDBox p={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDTypography variant="p">Titulo: </MDTypography>
                <TextField
                  fullWidth
                  name="NoteHead"
                  value={formik.values.NoteHead}
                  onChange={formik.handleChange}
                  error={formik.touched.NoteHead && Boolean(formik.errors.NoteHead)}
                  helperText={formik.touched.NoteHead && formik.errors.NoteHead}
                  placeholder="Titulo"
                />
              </Grid>

              <Grid item xs={12}>
                <MDTypography variant="p">Cuenta:</MDTypography>
                <TextField
                  fullWidth
                  name="Account"
                  value={formik.values.Account}
                  onChange={formik.handleChange}
                  error={formik.touched.Account && Boolean(formik.errors.Account)}
                  helperText={formik.touched.Account && formik.errors.Account}
                  placeholder="Cuenta"
                />
              </Grid>

              <Grid item xs={12}>
                <MDTypography variant="p">Valor de Nota:</MDTypography>
                <TextField
                  fullWidth
                  name="NoteValue"
                  value={formik.values.NoteValue}
                  onChange={formik.handleChange}
                  error={formik.touched.NoteValue && Boolean(formik.errors.NoteValue)}
                  helperText={formik.touched.NoteValue && formik.errors.NoteValue}
                  placeholder="Valor de Nota"
                />
              </Grid>

              <Grid item xs={12}>
                <MDTypography variant="p">Nota de contenido:</MDTypography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="NoteContent"
                  value={formik.values.NoteContent}
                  onChange={formik.handleChange}
                  error={formik.touched.NoteContent && Boolean(formik.errors.NoteContent)}
                  helperText={formik.touched.NoteContent && formik.errors.NoteContent}
                  placeholder="Nota de contenido"
                />
              </Grid>

              <MDTypography sx={{ ml: "16px", mt: "5px", mb: "-10px" }} variant="p">
                Año:
              </MDTypography>
              <Grid item xs={12}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="Year">Año</InputLabel>
                  <Select
                    label="Año"
                    labelId="Year"
                    IconComponent={ExpandMore}
                    name="Year"
                    value={formik.values.Year}
                    onChange={formik.handleChange}
                    error={formik.touched.Year && Boolean(formik.errors.Year)}
                    helperText={formik.touched.Year && formik.errors.Year}
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
                    <MenuItem disabled>Seleccione un año</MenuItem>
                    {yearData.map((year) => (
                      <MenuItem key={year.year} value={year.year.toString()}>
                        {year.year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MDTypography variant="p">Mes:</MDTypography>
                <TextField
                  fullWidth
                  name="Month"
                  value={getMonthName(formik.values.Month)}
                  onChange={formik.handleChange}
                  error={formik.touched.Month && Boolean(formik.errors.Month)}
                  helperText={formik.touched.Month && formik.errors.Month}
                  placeholder="Mes"
                />
              </Grid>
            </Grid>
          </MDBox>
        </StyledDialogContent>

        <StyledDialogActions>
          <MDButton onClick={onClose}>Cerrar</MDButton>
          <MDButton color="info" type="submit">
            {"Guardar"}
          </MDButton>
        </StyledDialogActions>
      </form>
    </StyledDialog>
  );
};

ModalNotes.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    yearsMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
    yearOne: PropTypes.string,
    yearTwo: PropTypes.string,
    signature: PropTypes.bool,
  }).isRequired,
  monthData: PropTypes.array,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

export default ModalNotes;
