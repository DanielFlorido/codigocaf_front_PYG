import React, { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import MDBox from "components/MDBox";
import { IconButton, CircularProgress, Alert } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import useGetWithParams from "hooks/useGetWithParams";
import PropTypes from "prop-types";
import ENDPOINTS from "services/endpoints";
import { useClient } from "context/ClientContext";
import { useMaterialUIController } from "context";

const identifications = [
  { id: 1, name: "Cedula" },
  { id: 3, name: "Nit" },
];
const ThreeTableData = ({
  setShowModalRegister,
  setTextModal,
  setDeleteClass,
  setSelectedRow,
  setMode,
  handleOpenDeleteModal,
  nodes,
  setNodes,
}) => {
  const [loading, setLoading] = useState(false);

  const { selectedClientId } = useClient();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const {
    data: parameterData,
    loading: parameterLoading,
    fetchData: fetchParents,
  } = useGetWithParams();
  const { data: accountTypeData, fetchData: fetchAccountType } = useGetWithParams();
  const { data: bankData, fetchData: fetchBankData } = useGetWithParams();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": selectedClientId,
          },
        };

        await fetchBankData(`${ENDPOINTS.BANK_PARAMETERS_ID}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchAccountType]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": selectedClientId,
          },
        };

        await fetchAccountType(`${ENDPOINTS.ACCOUNT_TYPE}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchAccountType]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "x-client-id": selectedClientId,
          },
        };

        await fetchParents(`${ENDPOINTS.THRID_PARTY}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchParents, selectedClientId]);

  const getDocumentName = (id) => {
    const doc = identifications.find((item) => item.id === id);
    return doc ? doc.name : id;
  };

  const getAccoutName = (id) => {
    const accout = accountTypeData.find((item) => item.id === Number(id));

    return accout ? accout.nombre : id;
  };

  const getBankName = (codigoACH) => {
    const banco = bankData.find((item) => item.codigoACH === codigoACH);
    return banco ? banco.nombre : codigoACH;
  };

  useEffect(() => {
    if (parameterData && !parameterLoading && accountTypeData.length > 0) {
      const formattedNodes = parameterData.map((item) => ({
        key: item.id.toString(),
        data: {
          id: item.id,
          identificacion: item.identificacion,
          nombre: item.nombre,
          bancoPagador: getBankName(item.bancoPagador),
          banco: item.banco,
          tipoProveedorEs: item.tipoProveedorEs,
          tipoProveedorEn: item.tipoProveedorEn,
          tipoCuentaBancaria: getAccoutName(item.tipoCuentaBancaria),
          cuentaBancaria: item.cuentaBancaria,
          tipoDocumento: getDocumentName(item.tipoDocumento),
          correoElectronico: item.correoElectronico,
        },
        leaf: true,
        style: {
          fontSize: "14px",
          backgroundColor: darkMode ? "#332f2c" : "#f9f9f9",
        },
      }));

      setNodes(formattedNodes);
      setLoading(false);
    }
  }, [parameterData, parameterLoading, accountTypeData]);

  const actionTemplate = (rowData) => {
    return (
      <MDBox display="flex" justifyContent="start" gap={1}>
        <IconButton
          onClick={() => {
            setShowModalRegister(true);
            setTextModal((prevState) => ({
              ...prevState,
              newClassChild: "Editar Clase",
            }));
            setDeleteClass(false);
            setSelectedRow(rowData);
            setMode("edit");
          }}
          sx={{
            backgroundColor: "rgba(0, 123, 255, 0.2)",
            color: "blue",
            borderRadius: "50%",
            "&:hover": { backgroundColor: "rgba(0, 123, 255, 0.4)" },
          }}
        >
          <EditCalendarOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={() => {
            handleOpenDeleteModal(rowData.data.id);
          }}
          sx={{
            backgroundColor: "rgba(220, 53, 69, 0.2)",
            color: "red",
            borderRadius: "50%",
            "&:hover": { backgroundColor: "rgba(220, 53, 69, 0.4)" },
          }}
        >
          <DeleteForeverIcon fontSize="small" />
        </IconButton>
      </MDBox>
    );
  };

  if (parameterLoading && !parameterData) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </MDBox>
    );
  }

  if (!selectedClientId) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="warning" variant="outlined">
          No se encontraron datos por el cliente filtrado.
        </Alert>
      </MDBox>
    );
  }

  if (!nodes.length && !parameterLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="info">No se encontraron datos por el cliente filtrado</Alert>
      </MDBox>
    );
  }

  return (
    <MDBox className="card">
      <TreeTable
        value={nodes}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        scrollable
        scrollHeight="400px"
        paginator
        rows={5}
      >
        <Column
          field="identificacion"
          header="Identificación"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="nombre"
          header="Nombre"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="bancoPagador"
          header="Banco Pagador"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="tipoProveedorEs"
          header="Tipo de Proovedor Es"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="tipoProveedorEn"
          header="Tipo de Proovedor En"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="cuentaBancaria"
          header="Número de cuenta"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="correoElectronico"
          header="Correo electrónico"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="tipoCuentaBancaria"
          header="Tipo de Cuenta"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="tipoDocumento"
          header="Tipo de Documento"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          body={actionTemplate}
          header="Acciones"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontSize: "15px",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
      </TreeTable>
    </MDBox>
  );
};

ThreeTableData.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
  setNodes: PropTypes.func.isRequired,
  setShowModalRegister: PropTypes.func.isRequired,
  setTextModal: PropTypes.func.isRequired,
  setDeleteClass: PropTypes.func.isRequired,
  setSelectedRow: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  handleOpenDeleteModal: PropTypes.func.isRequired,
};

export default ThreeTableData;
