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

  const {
    data: parameterData,
    loading: parameterLoading,
    error: parameterError,
    fetchData: fetchParents,
  } = useGetWithParams();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const options = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        await fetchParents(`${ENDPOINTS.ACCOUNT_TYPE}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchParents]);

  useEffect(() => {
    if (parameterData && !parameterLoading) {
      const formattedNodes = parameterData.map((item) => ({
        key: item.id.toString(),
        data: {
          id: item.id,
          nombre: item.nombre,
          codigo: item.codigo,
        },
        leaf: false,
        style: {
          fontSize: "14px",
          backgroundColor: "#f9f9f9",
        },
      }));

      setNodes(formattedNodes);
      setLoading(false);
    }
  }, [parameterData, parameterLoading]);

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

  if (parameterError) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="error">
          Error al cargar los parámetros tipo cuenta:{parameterError.message}
        </Alert>
      </MDBox>
    );
  }

  if (!nodes.length && !parameterLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="info">No se encontraron parámetros para tipo cuenta</Alert>
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
          field="id"
          header="ID"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="nombre"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          header="Nombre"
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="codigo"
          header="Código"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
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
