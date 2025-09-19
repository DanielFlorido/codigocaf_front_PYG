import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PropTypes from "prop-types";
import { StyledDialog, StyledDialogContent, StyledDialogActions } from "./StyledDialog";
import MDButton from "components/MDButton";
import { Grid, IconButton } from "@mui/material";
import ENDPOINTS from "services/endpoints";
import { useEffect, useState } from "react";
import usePost from "hooks/usePost";

const style = {
  top: "50%",
  left: "50%",
  width: 450,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 8,
  p: 3,
  margin: "0 auto",
};

const ModalImages = ({
  opened,
  onClose,
  selectedLanguage,
  imageName,
  clientLogo,
  imageNumber,
  IdCliente,
  IdUsuario,
  setSnackbarSeverity,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const { data: addData = {}, error: addError, postData } = usePost();
  useEffect(() => {
    setFile(null);
  }, []);

  useEffect(() => {
    if (addData) {
      setSnackbarSeverity("success");
      setSnackbarMessage("Imagen cargada exitosamente");
      setSnackbarOpen(true);
      setFile(null);
    } else if (addError) {
      setSnackbarSeverity("error");
      setSnackbarMessage(addError.message || "Error al cargar imagen");
      setSnackbarOpen(true);
    }
  }, [addData, addError]);

  const onSubmit = async () => {
    const LogoPrincipal = imageNumber === 1 ? file : clientLogo?.logoPrincipal;
    const LogoAuxiliar = imageNumber === 2 ? file : clientLogo?.logoAuxiliar;
    const FirmaGerente = imageNumber === 3 ? file : clientLogo?.firmaGerente;
    const FirmaRevisor = imageNumber === 4 ? file : clientLogo?.firmaRevisor;
    const FirmaContador = imageNumber === 5 ? file : clientLogo?.firmaContador;
    try {
      const payload = {
        IdCliente: IdCliente,
        IdUsuario: IdUsuario,
        LogoPrincipal: LogoPrincipal,
        LogoAuxiliar: LogoAuxiliar,
        FirmaGerente: FirmaGerente,
        FirmaRevisor: FirmaRevisor,
        FirmaContador: FirmaContador,
      };
      await postData(ENDPOINTS.CLIENT_LOGO_SAVE, payload, {
        "x-client-id": clientLogo?.IdCliente,
      });
      onClose(payload);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setFile(base64String);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <StyledDialog
      open={opened}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: "520px",
          height: "auto",
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
            {`${selectedLanguage === "es" ? "Seleccione " : "Select "} ${imageName}`}
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
      <StyledDialogContent>
        <MDBox sx={style}>
          <MDBox
            sx={{
              border: "2px dashed #90caf9",
              borderRadius: 2,
              mt: 3,
              mb: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "0.3s",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: "#90caf9" }} />
            <MDTypography fontWeight="bold">
              {selectedLanguage === "es" ? "Click para subir" : "Click to upload"}
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary">
              {selectedLanguage === "es" ? "o arrastrar y soltar" : "or drag and drop"}
              <br />
              {selectedLanguage === "es" ? "Imagenes soportadas" : "Supported images"}: .jpg, .jpeg,
              .png
            </MDTypography>
            <input
              id="fileInput"
              name="File"
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </MDBox>
        </MDBox>
        {file && (
          <MDBox sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <img src={`data:image/jpeg;base64,${file}`} width="150" />
          </MDBox>
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <MDButton onClick={onClose}>{selectedLanguage === "es" ? "Cerrar" : "Close"}</MDButton>
        <MDButton color="info" type="submit" onClick={onSubmit}>
          {selectedLanguage === "es" ? "Guardar" : "Save"}
        </MDButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

ModalImages.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  clientLogo: PropTypes.object,
  imageName: PropTypes.string.isRequired,
  imageNumber: PropTypes.number.isRequired,
  IdCliente: PropTypes.number.isRequired,
  IdUsuario: PropTypes.number.isRequired,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

export default ModalImages;
