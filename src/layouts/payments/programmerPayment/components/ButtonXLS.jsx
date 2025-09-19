import MDButton from "components/MDButton";
import { Icon } from "@mui/material";
import ENDPOINTS from "services/endpoints";
import PropTypes from "prop-types";
import { useClient } from "context/ClientContext";

const ButtonXLS = ({
  selectedLanguage,
  filters,
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
    FechaVencimiento: filters?.date || null,
    Language: selectedLanguage,
    CentroCostos: filters?.costCenter || null,
    Identificacion: filters?.third || null,
    TipoProveedor: filters?.supplierType || null,
  };

  const handleGenerateXLS = async () => {
    try {
      const response = await fetch(ENDPOINTS.PAID_PROGRAMMER_CSV, {
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
          ? "Has descargado el csv correctamente"
          : "You have successfully downloaded the csv file"
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
      link.download = selectedLanguage === "es" ? "programador_pago.csv" : "paid_programmer.csv";
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
      &nbsp;{selectedLanguage === "es" ? "Descargar CSV" : "Download CSV"}
    </MDButton>
  );
};

ButtonXLS.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costCenter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    third: PropTypes.string,
    supplierType: PropTypes.string,
  }).isRequired,
  setSnackbarSeverity: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func.isRequired,
  setSnackbarOpen: PropTypes.func.isRequired,
};

export default ButtonXLS;
