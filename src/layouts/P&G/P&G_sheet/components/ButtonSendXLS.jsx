import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
import { useClient } from "context/ClientContext";
import PropTypes from "prop-types";
import usePost from "hooks/usePost";
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
  const { postData } = usePost();

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
      const data = await postData(ENDPOINTS.PYG_SHEET_SEND_EXCEL, requestBodyXLS, requestHeaders);

      setSnackbarSeverity("success");
      setSnackbarMessage(data.mensaje || "Archivo enviado correctamente");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error enviando Excel:", error);
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
