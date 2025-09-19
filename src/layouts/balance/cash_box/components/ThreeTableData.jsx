import React, { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import MDBox from "components/MDBox";
import ENDPOINTS from "services/endpoints";
import usePost from "hooks/usePost";
import PropTypes from "prop-types";
import { useClient } from "context/ClientContext";
import { Alert } from "@mui/material";
import MDTypography from "components/MDTypography";

const ThreeTableData = ({ selectedLanguage, filters }) => {
  const [nodes, setNodes] = useState([]);
  const [columns, setColumns] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [searchCompleted, setSearchCompleted] = useState(false);

  const { data: reportData = {}, postData } = usePost();

  const { selectedClientId } = useClient();

  useEffect(() => {
    if (!selectedClientId || !filters?.year) {
      return;
    }

    const fetchData = async () => {
      setSearchCompleted(false);
      const requestBody = {
        Year: filters?.year || null,
        Language: selectedLanguage,
        Month: filters?.month === 0 ? null : filters?.month,
        IdentificacionTercero: filters?.third || null,
      };

      try {
        const requestHeaders = {
          "x-client-id": selectedClientId,
        };
        await postData(ENDPOINTS.CASH_BOX_HEADER, requestBody, requestHeaders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setSearchCompleted(true);
      }
    };

    fetchData();
  }, [selectedLanguage, selectedClientId, filters?.year, filters?.month, filters?.third]);

  useEffect(() => {
    if (reportData) {
      setColumns(createColumns(reportData.meses || []));
      setLabelData(reportData.meses);

      if (reportData.lineaFlujoCajas) {
        const transformedNodes = transformDataToNodes(reportData);
        setNodes(transformedNodes);
      }
    }
  }, [reportData]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const generateColum = (label, index) => {
    return {
      field: index + "null",
      header: label,
      isExpander: index === 0,
    };
  };

  const createColumns = (cash) => {
    const safeEtiquetas = Array.isArray(cash) ? cash : [];
    return safeEtiquetas.map((cash, index) => {
      return generateColum(cash, index);
    });
  };

  const addProperty = (object, property, value) => {
    object[property] = value;

    return object;
  };

  const transformDataToNodes = (apiData) => {
    const data = apiData.lineaFlujoCajas;
    const lines = [];

    data.forEach((item) => {
      let columnLabel = {
        "0null": item?.showText || "",
      };

      if (Array.isArray(item?.data)) {
        item?.data.forEach((value, index) => {
          columnLabel = addProperty(columnLabel, `${index + 1}null`, formatCurrency(value?.value));
        });
      }

      lines.push({
        key: item.tipo,
        data: columnLabel,
        leaf:
          item.tipo.toLowerCase().includes("0.") ||
          item.tipo.toLowerCase().includes("3.") ||
          item.tipo === "none",
        style: {
          color:
            item?.showText === "2. Salidas"
              ? "#dc3545"
              : "inherit" && item?.showText === "1. Entradas"
              ? "#008f39"
              : "inherit",
          backgroundColor:
            item?.showText === "2. Salidas"
              ? "rgba(220, 53, 69, 0.1)"
              : "#f9f9f9" && item?.showText === "1. Entradas"
              ? "rgba(25, 230, 66, 0.1)"
              : "#f9f9f9",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    });

    return lines;
  };

  const fetchData = async (endpoint, body) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": selectedClientId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  const createColumnLabel = (item, formatFn = formatCurrency) => {
    const label = { "0null": item?.showText || "" };

    if (Array.isArray(item?.data)) {
      item?.data?.forEach((value, index) => {
        label[`${index + 1}null`] = formatFn(value?.value || 0);
      });
    }

    return label;
  };

  const createColumnLabelThird = (item, formatFn = formatCurrency) => {
    const label = { "0null": item?.nombreTercero || "" };

    if (Array.isArray(item?.data)) {
      item?.data?.forEach((value, index) => {
        label[`${index + 1}null`] = formatFn(value?.value || 0);
      });
    }

    return label;
  };

  const onExpand = async (event) => {
    const nodeKey = event.node.key;

    if (event.node.children?.length > 0) {
      setExpandedKeys((prev) => ({ ...prev, [nodeKey]: true }));
      return;
    }

    setLoading(true);

    try {
      let childrenNodes;

      let requestBodyChildCash = {
        Year: filters.year,
        Language: selectedLanguage,
        Tipo: nodeKey,
        IdentificacionTercero: filters?.third,
        meses: labelData,
      };

      const [childrenDataCash] = await Promise.all([
        fetchData(ENDPOINTS.CASH_BOX_SUBHEADER, requestBodyChildCash),
      ]);

      childrenNodes = childrenDataCash.lineaFlujoCajas.map((item) => {
        const newNodekey = `${nodeKey}-${item.tipo}`;
        const detailChildrenData = getThirdChildrenData(newNodekey);
        return {
          key: newNodekey,
          data: createColumnLabel(item),
          leaf: !detailChildrenData || detailChildrenData.length === 0,
          children: detailChildrenData,
          style: {
            backgroundColor:
              item?.tipo === "2. Salidas"
                ? "rgba(220, 53, 69, 0.1)"
                : "#f0f4f8" && item?.showText === "1. Entradas"
                ? "rgba(25, 230, 66, 0.1)"
                : "#f0f4f8",
            fontSize: "14px",
          },
        };
      });

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.key === nodeKey ? { ...node, children: childrenNodes } : node
        )
      );
      setExpandedKeys((prev) => ({ ...prev, [nodeKey]: true }));
    } catch (error) {
      console.error("Error al cargar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getThirdChildrenData = (nodeKey) => {
    const requestBodyThirdCash = {
      Year: filters.year,
      Language: selectedLanguage,
      Tipo: onExpandTipo(nodeKey),
      CodigoPosPre: onExpandPospre(nodeKey),
      IdentificacionTercero: filters?.third,
      meses: labelData,
    };

    let result = [];
    fetchData(ENDPOINTS.CASH_BOX_THIRD, requestBodyThirdCash).then((allDetailsData) => {
      if (
        allDetailsData.lineaFlujoCajaTerceros &&
        allDetailsData.lineaFlujoCajaTerceros.length > 0
      ) {
        allDetailsData.lineaFlujoCajaTerceros.forEach((detailChild) => {
          result.push({
            key: `${nodeKey}-${detailChild.identificacion}`,
            data: createColumnLabelThird(detailChild),
            leaf: true,
            style: {
              fontSize: "14px",
            },
          });
        });
      } else {
        result = undefined;
      }
    });
    return result;
  };

  const onExpandPospre = (nodeKey) => {
    const keyParts = nodeKey.includes("-") ? nodeKey.split("-") : [nodeKey];

    return keyParts.length > 1 ? keyParts[1] : null;
  };

  const onExpandTipo = (nodeKey) => {
    const keyParts = nodeKey.includes("-") ? nodeKey.split("-") : [nodeKey];

    return keyParts.length > 0 ? keyParts[0] : null;
  };

  const onCollapse = (event) => {
    const nodeKey = event.node.key;
    setExpandedKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[nodeKey];
      return newKeys;
    });
  };

  if (!selectedClientId || !filters?.year) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="info" variant="outlined">
          <MDTypography variant="p">
            {selectedLanguage === "es"
              ? "Debes buscar un cliente y seleccionar el año para visualizar los datos"
              : "You must search for a client and select the year to view the data"}
          </MDTypography>
        </Alert>
      </MDBox>
    );
  }

  if (searchCompleted && !nodes.length) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="warning" variant="outlined">
          <MDTypography variant="p">
            {selectedLanguage === "es"
              ? "No se encontraron datos para los filtros aplicados"
              : "No data was found for the applied filters"}
          </MDTypography>
        </Alert>
      </MDBox>
    );
  }

  return (
    <MDBox className="card">
      <TreeTable
        value={nodes || []}
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        onExpand={onExpand}
        onCollapse={onCollapse}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={5}
      >
        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            headerStyle={{
              backgroundColor: "#e8f0fe",
              color: "#333",
              fontWeight: "bold",
            }}
            expander={col.isExpander || false}
            bodyClassName="p-3"
            headerClassName="p-3"
          />
        ))}
      </TreeTable>
    </MDBox>
  );
};

ThreeTableData.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    yearsMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    third: PropTypes.string,
  }).isRequired,
};

export default ThreeTableData;
