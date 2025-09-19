import React, { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import MDBox from "components/MDBox";
import { IconButton, CircularProgress, Alert } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import useGetWithParams from "hooks/useGetWithParams";
import PropTypes from "prop-types";
import ENDPOINTS from "services/endpoints";
import { useClient } from "context/ClientContext";

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
  const [expandedKeys, setExpandedKeys] = useState({});
  const [loading, setLoading] = useState(false);

  const { selectedClientId } = useClient();

  const {
    data: parameterData,
    loading: parameterLoading,
    error: parameterError,
    fetchData: fetchParents,
  } = useGetWithParams();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!selectedClientId) return;
      try {
        const options = {
          headers: {
            "x-client-id": selectedClientId,
          },
        };

        await fetchParents(`${ENDPOINTS.BALANCE_PARAMETERS}`, options);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [selectedClientId, fetchParents]);

  useEffect(() => {
    if (parameterData && !parameterLoading) {
      const formattedNodes = parameterData.map((item) => ({
        key: item.id.toString(),
        data: {
          id: item.id,
          codigo: item.codigo,
          nombreEs: item.nombreEs,
          nombreEn: item.nombreEn,
          posPreEs: item.posPreEs,
          posPreEn: item.posPreEn,
          depreciacion: item.amortizacionIntereses ? "Sí" : "No",
          idPadre: item.idPadre,
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

  const onExpand = async (event) => {
    const nodeKey = event.node.key;

    if (event.node.children) {
      setExpandedKeys((prev) => ({ ...prev, [nodeKey]: true }));
      return;
    }

    setLoading(true);

    try {
      const segments = nodeKey.split("-");
      const nodeId = segments[segments.length - 1];

      const options = {
        headers: {
          "x-client-id": selectedClientId,
        },
      };

      const response = await fetch(`${ENDPOINTS.BALANCE_PARAMETERS}/${nodeId}`, options);

      const childrenData = await response.json();

      const childrenNodes = childrenData.map((child) => ({
        key: `${nodeKey}-${child.id}`,
        data: {
          id: child.id,
          codigo: child.codigo,
          nombreEs: child.nombreEs,
          nombreEn: child.nombreEn,
          posPreEs: child.posPreEs,
          posPreEn: child.posPreEn,
          depreciacion: child.amortizacionIntereses ? "Sí" : "No",
          idPadre: child.idPadre,
        },
        leaf: false,
      }));

      const cloneNodes = (nodes) => {
        return nodes.map((node) => {
          if (node.key === nodeKey) {
            return {
              ...node,
              ...(childrenNodes.length > 0
                ? { children: childrenNodes, leaf: false }
                : { leaf: true }),
            };
          }
          if (node.children) {
            return { ...node, children: cloneNodes(node.children) };
          }
          return node;
        });
      };

      setNodes((prevNodes) => cloneNodes(prevNodes));
      setExpandedKeys((prev) => ({ ...prev, [nodeKey]: true }));
    } catch (error) {
      console.error("Error al cargar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCollapse = (event) => {
    const nodeKey = event.node.key;
    setExpandedKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[nodeKey];
      return newKeys;
    });
  };

  const actionTemplate = (rowData) => {
    return (
      <MDBox display="flex" justifyContent="start" gap={1}>
        <IconButton
          onClick={() => {
            setShowModalRegister(true);
            setTextModal((prevState) => ({
              ...prevState,
              newClassChild: `Agregar hijo a ${rowData.data.nombreEs}`,
            }));
            setDeleteClass(false);
            setSelectedRow({
              idPadre: rowData.data.id,
            });
            setMode("addChild");
          }}
          sx={{
            backgroundColor: "rgba(255, 165, 0, 0.2)",
            color: "orange",
            borderRadius: "50%",
            "&:hover": { backgroundColor: "rgba(255, 165, 0, 0.4)" },
          }}
        >
          <AddBoxIcon fontSize="small" />
        </IconButton>
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
        <Alert severity="error">Error al cargar los parámetros: {parameterError.message}</Alert>
      </MDBox>
    );
  }

  if (!nodes.length && !parameterLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="info">No se encontraron parámetros</Alert>
      </MDBox>
    );
  }

  return (
    <MDBox className="card">
      <TreeTable
        value={nodes}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        onCollapse={onCollapse}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        scrollable
        scrollHeight="400px"
        paginator
        rows={5}
      >
        <Column
          field="codigo"
          header="Código"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          expander
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="nombreEs"
          header="Nombre Español"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="nombreEn"
          header="Nombre Ingles"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="posPreEs"
          header="Pospre Español"
          bodyClassName="p-3"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          headerClassName="p-3"
        />
        <Column
          field="posPreEn"
          header="Pospre Ingles"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="depreciacion"
          header="Depreciación"
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
