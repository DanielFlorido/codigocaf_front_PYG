import MDButton from "components/MDButton";
import { Icon } from "@mui/material";
import ENDPOINTS from "services/endpoints";
import PropTypes from "prop-types";
import { useClient } from "context/ClientContext";

const ButtonXLS = ({
  selectedLanguage,
  filters,
  validateYear,
  setSnackbarSeverity,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const { selectedClientId } = useClient();

  const requestHeaders = {
    "x-client-id": selectedClientId,
    "x-user-id": 4,
  };

  const requestBodyXLS = {
    Year: filters.year,
    Month: filters.month === 0 ? null : filters.month,
    Language: selectedLanguage,
    IdentificacionTercero: filters.third || null,
    UserId: 4,
    IncludeSignature: filters.signature || false,
  };

  const handleGenerateXLS = async () => {
    const isSend = false;
    if (!validateYear(isSend)) return;

    try {
      const response = await fetch(ENDPOINTS.CASH_BOX_DOWNLOAD_EXCEL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify(requestBodyXLS),
      });

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status}`);
      }

      setSnackbarSeverity("success");
      setSnackbarMessage(
        selectedLanguage === "es"
          ? "Has descargado el excel correctamente"
          : "You have successfully downloaded the Excel file"
      );
      setSnackbarOpen(true);

      const base64Data = await response.text();

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = selectedLanguage === "es" ? "flujo-caja.xlsx" : "cash-flow.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage(
        selectedLanguage === "es" ? "Error al descargar el excel" : "Error downloading Excel file"
      );
      setSnackbarOpen(true);
    }
  };

  return (
    <MDButton variant="outlined" color="success" onClick={handleGenerateXLS}>
      <Icon>description</Icon>
      &nbsp;{selectedLanguage === "es" ? "Descargar Excel" : "Download Excel"}
    </MDButton>
  );
};

ButtonXLS.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    third: PropTypes.string,
    signature: PropTypes.bool,
  }).isRequired,
  validateYear: PropTypes.func.isRequired,
  setSnackbarSeverity: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
};

export default ButtonXLS;
