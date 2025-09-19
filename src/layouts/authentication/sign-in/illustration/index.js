import { useState } from "react";
import routeMappings from "../../../../utils/routeMappings";
import { Link, useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";

import bgImage from "assets/images/image-login.jpg";
import imageLogo from "assets/images/logo_caf.png";

import api from "services/api";

function Illustration() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/token", {
        usuario: email,
        clave: password,
      });

      localStorage.setItem("token", response.data.token);

      navigate(routeMappings["/balance/balance_sheet"]);
    } catch (err) {
      setError("Credenciales incorrectas o error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IllustrationLayout
      imageLogo={imageLogo}
      title="BIENVENIDOS"
      description="Introduzca su correo electrónico y contraseña para iniciar sesión"
      illustration={bgImage}
    >
      <MDBox component="form" role="form" onSubmit={handleLogin}>
        <MDBox mb={2}>
          <MDInput
            type="email"
            label="Correo Electrónico"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="password"
            label="Contraseña"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </MDBox>
        <MDBox display="flex" alignItems="center" ml={-1}>
          <Switch checked={rememberMe} onChange={handleSetRememberMe} />
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            onClick={handleSetRememberMe}
            sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
          >
            &nbsp;&nbsp;Recordar
          </MDTypography>
        </MDBox>
        {error && (
          <MDTypography variant="button" color="error" mt={2}>
            {error}
          </MDTypography>
        )}
        <MDBox mt={4} mb={1}>
          <MDButton
            type="submit"
            variant="gradient"
            size="large"
            fullWidth
            disabled={loading}
            style={{ backgroundColor: "#14385B", color: "#fff" }}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </MDButton>
        </MDBox>
        <MDBox mt={3} textAlign="center">
          <MDTypography variant="button" color="text">
            ¿Aún no tienes cuenta?{" "}
            <MDTypography
              component={Link}
              to="/authentication/sign-up/cover"
              variant="button"
              fontWeight="medium"
              textGradient
              style={{ color: "#8B0000" }}
            >
              Regístrate
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </IllustrationLayout>
  );
}

export default Illustration;
