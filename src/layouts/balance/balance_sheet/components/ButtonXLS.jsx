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
      let response;

      if (filters.yearsMonth === 2) {
        response = await fetch(ENDPOINTS.BALANCE_SHEET_DOWNLOAD_EXCEL_YEAR, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...requestHeaders,
          },
          body: JSON.stringify(requestYearsBodyXLS),
        });
      } else {
        response = await fetch(ENDPOINTS.BALANCE_SHEET_DOWNLOAD_EXCEL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...requestHeaders,
          },
          body: JSON.stringify(requestBodyXLS),
        });
      }

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status}`);
      }

      setSnackbarSeverity("success");
      setSnackbarMessage("Has descargado el excel correctamente");
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
      link.download = "reporte.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
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
