import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
import { useClient } from "context/ClientContext";
import PropTypes from "prop-types";
import ENDPOINTS from "services/endpoints";

const ButtonSendXLS = ({
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
    Language: selectedLanguage,
    UserId: 4,
    IncludeSignature: filters.signature,
  };

  const handleSend = async () => {
    const isSend = true;
    if (!validateYear(isSend)) return;

    try {
      const response = await fetch(ENDPOINTS.SEND_EXCEL_CASH_BOX, {
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

      const data = await response.json();

      setSnackbarSeverity("success");
      setSnackbarMessage(data.mensaje);
      setSnackbarOpen(true);
    } catch (error) {
      console.log(error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Hubo un error al enviar el archivo");
      setSnackbarOpen(true);
    }
  };

  return (
    <MDButton variant="outlined" color="warning" onClick={handleSend}>
      <Icon>send</Icon>
      &nbsp;{selectedLanguage === "es" ? "Enviar Excel" : "Send Excel"}
    </MDButton>
  );
};

ButtonSendXLS.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
  validateYear: PropTypes.func.isRequired,
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
};

export default ButtonSendXLS;
