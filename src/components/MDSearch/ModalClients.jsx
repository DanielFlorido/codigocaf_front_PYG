import MDTypography from "components/MDTypography";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import PropTypes from "prop-types";
import { StyledDialog, StyledDialogActions } from "./StyledDialog";
import MDButton from "components/MDButton";
import { Grid, IconButton, List, ListItemButton, ListItemText, Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 660,
    backgroundColor: theme?.palette?.background?.paper || "#ffffff",
  },
}));

const ModalClients = ({ opened, onClose, clickModelClient, userData, language }) => {
  const classes = useStyles();

  userData.map((item) => {
    item.razonSocial = item.razonSocial.toUpperCase();
    item.numeroDocumento = item.numeroDocumento.toString();
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
      <Grid container spacing={2} justifyContent="space-between" alignItems="center">
        <Grid item xs={12} md="auto">
          <MDTypography sx={{ mb: 2, mt: 2, ml: 2 }} variant="h5" fontWeight="medium">
            {language === "es" ? "Seleccione un cliente" : "Select a client"}
          </MDTypography>
        </Grid>
        <Grid item xs={12} md="auto" sx={{ display: "flex", justifyContent: "flex-end" }}>
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
        <List
          component="nav"
          className={classes.root}
          sx={{
            pl: 5,
            pr: 5,
            pt: 2,
            pb: 2,
            overflow: "auto",
            maxHeight: 400,
          }}
        >
          {userData.map((item, index) => (
            <>
              <ListItemButton key={index} onClick={() => clickModelClient(item)}>
                <ListItemText
                  primary={item.razonSocial}
                  secondary={`${language === "es" ? "Documento" : "Document"}: ${
                    item.numeroDocumento
                  }`}
                />
              </ListItemButton>
              {index < userData.length - 1 && (
                <Divider sx={{ my: 1, borderColor: "#e0e0e0", borderWidth: 1 }} />
              )}
            </>
          ))}
        </List>
      </Grid>
      <StyledDialogActions>
        <MDButton onClick={onClose}>{language === "es" ? "Cerrar" : "Close"}</MDButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

ModalClients.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clickModelClient: PropTypes.func.isRequired,
  userData: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
};

export default ModalClients;
