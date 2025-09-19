import MDButton from "components/MDButton";
import { Icon } from "@mui/material";
import ENDPOINTS from "services/endpoints";
import PropTypes from "prop-types";
import { useClient } from "context/ClientContext";
import usePost from "hooks/usePost";

const ButtonXLS = ({
  selectedLanguage,
  filters,
  validateYear,
  setSnackbarSeverity,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const { selectedClientId } = useClient();
  const { postData } = usePost(); // traemos la función

  const requestHeaders = {
    "x-client-id": selectedClientId,
    "x-user-id": 4,
  };

  const requestBodyXLS = {
    ...(filters.dateFrom || filters.dateTo
      ? {
          Year: null,
          DateFrom: filters.dateFrom,
          DateTo: filters.dateTo,
        }
      : {
          Year: filters.year ? parseInt(filters.year) : null,
          DateFrom: null,
          DateTo: null,
        }),
    Language: selectedLanguage,
    UserId: 4,
    IncludeSignature: filters.signature,
  };

  const requestYearsBodyXLS = {
    ...(filters.dateFrom || filters.dateTo
      ? {
          Year1: null,
          Year2: null,
          DateFrom: filters.dateFrom,
          DateTo: filters.dateTo,
        }
      : {
          Year1: filters.yearOne ? parseInt(filters.yearOne) : null,
          Year2: filters.yearTwo ? parseInt(filters.yearTwo) : null,
          DateFrom: null,
          DateTo: null,
        }),
    Language: selectedLanguage,
    UserId: 4,
    IncludeSignature: filters.signature,
  };

  const handleGenerateXLS = async () => {
    const isSend = false;
    if (!validateYear(isSend)) return;

    try {
      let responseData;

      if (filters.yearsMonth === 2) {
        responseData = await postData(
          ENDPOINTS.BALANCE_SHEET_DOWNLOAD_EXCEL_YEAR,
          requestYearsBodyXLS,
          requestHeaders
        );
      } else {
        responseData = await postData(
          ENDPOINTS.PYG_SHEET_DOWNLOAD_EXCEL,
          requestBodyXLS,
          requestHeaders
        );
      }

      setSnackbarSeverity("success");
      setSnackbarMessage("Has descargado el excel correctamente");
      setSnackbarOpen(true);

      // 👇 convertir base64 a binario y descargar
      const byteCharacters = atob(responseData); // decodifica base64
      const byteNumbers = new Array(byteCharacters.length)
        .fill(null)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "archivo.xlsx"); // 📂 nombre del archivo
      document.body.appendChild(link);
      link.click();

      // limpieza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Error al descargar el archivo");
      setSnackbarOpen(true);
      console.error("Error al generar XLS:", error);
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
    yearsMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
    yearOne: PropTypes.string,
    yearTwo: PropTypes.string,
    signature: PropTypes.bool,
  }).isRequired,
  validateYear: PropTypes.func.isRequired,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

export default ButtonXLS;
