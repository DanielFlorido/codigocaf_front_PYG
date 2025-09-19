import React, { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import MDBox from "components/MDBox";
import ENDPOINTS from "services/endpoints";
import usePost from "hooks/usePost";
import PropTypes from "prop-types";
import { Alert } from "@mui/material";
import { useClient } from "context/ClientContext";
import MDTypography from "components/MDTypography";

const ThreeTableData = ({ selectedLanguage, filters }) => {
  const [nodes, setNodes] = useState([]);
  const [columns, setColumns] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [searchCompleted, setSearchCompleted] = useState(false);

  const normalizeKey = (k) => (k === null || k === undefined ? "" : String(k));
  const partsCount = (key) => {
    const normalized = normalizeKey(key);
    const count = normalized.split("-").length;
    console.log("[partsCount]", { key, normalized, count });
    return count;
  };

  const isGrupo = (node) => {
    const res = partsCount(node.key) === 1;
    console.log("[isGrupo]", node.key, res);
    return res;
  };
  const isCuenta = (node) => {
    const res = partsCount(node.key) === 2;
    console.log("[isCuenta]", node.key, res);
    return res;
  };
  const isSubcuenta = (node) => {
    const res = partsCount(node.key) === 3;
    console.log("[isSubcuenta]", node.key, res);
    return res;
  };

  const { data: reportData = {}, postData } = usePost();
  const { selectedClientId } = useClient();

  const requestHeaders = {
    "x-client-id": selectedClientId,
  };

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchDataInitial = async () => {
      setSearchCompleted(false);
      setNodes([]);

      const requestBody = {
        Language: selectedLanguage,
        ...(filters.dateFrom || filters.dateTo
          ? {
              Year: null,
              Month: null,
              DateFrom: filters.dateFrom,
              DateTo: filters.dateTo,
            }
          : {
              Year: filters.year ? parseInt(filters.year) : null,
              Month: filters.month ? parseInt(filters.month) : null,
              DateFrom: null,
              DateTo: null,
            }),
      };

      const requesBodyGroup = {
        Year1: filters.yearOne,
        Year2: filters.yearTwo,
        Language: selectedLanguage,
      };

      try {
        const endpoint =
          filters.yearsMonth === 2 ? ENDPOINTS.BALANCE_SHEET_GROUPED_HEADER : ENDPOINTS.PYG_GRUPOS;
        const body = filters.yearsMonth === 2 ? requesBodyGroup : requestBody;

        await postData(endpoint, body, requestHeaders);
        setSearchCompleted(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSearchCompleted(true);
      }
    };

    fetchDataInitial();
  }, [
    selectedLanguage,
    filters.year,
    filters.month,
    filters.yearTwo,
    filters.dateTo,
    selectedClientId,
  ]);

  useEffect(() => {
    if (reportData) {
      setColumns(createColumns(reportData.etiquetas || []));
      setLabelData(reportData.etiquetas || []);

      if (reportData.data) {
        setNodes((prev) => {
          const alreadyHasGroups = prev.some((n) => !n.key.startsWith("utilidad_"));

          if (!alreadyHasGroups) {
            console.log("[INIT] Transformando nodos raíz con grupos + utilidades");
            return transformDataToNodes(reportData);
          }
          console.log("[SKIP] Ya había grupos cargados, no sobreescribo");
          return prev;
        });
      } else {
        setNodes([]);
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

  const createColumns = (etiquetas) => {
    const safeEtiquetas = Array.isArray(etiquetas) ? etiquetas : [];
    return safeEtiquetas.map((etiqueta, index) => generateColum(etiqueta, index));
  };

  const addProperty = (object, property, value) => {
    object[property] = value;
    return object;
  };

  const transformDataToNodes = (apiData) => {
    const data = apiData.data || [];
    const lines = [];

    const orderMap = {
      41: 1,
      61: 2,
      62: 3,
      utilidad_bruta: 4,
      51: 5,
      52: 6,
      utilidad_operacional: 7,
      53: 8,
      42: 9,
      utilidad_antes_impuestos: 10,
      54: 11,
      utilidad_neta: 12,
    };

    data.forEach((item) => {
      let columnLabel = {
        "0null":
          filters.yearsMonth === 2 && item.codigo ? `${item.texto} ${item.codigo}` : item.texto,
      };

      if (filters.yearsMonth === 2) {
        columnLabel = addProperty(columnLabel, "1null", item.notas);
        columnLabel = addProperty(columnLabel, "2null", formatCurrency(item.valorPrevio));
        columnLabel = addProperty(columnLabel, "3null", formatCurrency(item.valorActual));
        columnLabel = addProperty(columnLabel, "4null", formatCurrency(item.valorVariacion));
        columnLabel = addProperty(columnLabel, "5null", item.valorPorcentaje);
      } else {
        item.data?.forEach((value, index) => {
          columnLabel = addProperty(columnLabel, `${index + 1}null`, formatCurrency(value.total));
        });
      }
      lines.push({
        key: normalizeKey(item.codigo ?? item.etiqueta),
        data: columnLabel,
        leaf: item.texto.toLowerCase().includes("total"),
        children: [],
        style: {
          color: "inherit",
          backgroundColor: item.texto.toLowerCase().includes("total") ? "#f9f9f9" : "#f4f6f8",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    });

    if (apiData.utilidadBruta) {
      const utilidadBruta = { "0null": apiData.utilidadBruta.texto };
      apiData.utilidadBruta.data?.forEach((value, index) => {
        utilidadBruta[index + 1 + "null"] = formatCurrency(value.total);
      });
      lines.push({
        key: normalizeKey("utilidad_bruta"),
        data: utilidadBruta,
        leaf: true,
        children: [],
        style: {
          color: apiData.utilidadBruta.data?.[0]?.total < 0 ? "#dc3545" : "inherit",
          backgroundColor: "#fff5f5",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    }

    if (apiData.utilidadOperacional) {
      const utilidadOperacional = { "0null": apiData.utilidadOperacional.texto };
      apiData.utilidadOperacional.data?.forEach((value, index) => {
        utilidadOperacional[index + 1 + "null"] = formatCurrency(value.total);
      });
      lines.push({
        key: normalizeKey("utilidad_operacional"),
        data: utilidadOperacional,
        leaf: true,
        children: [],
        style: {
          color: apiData.utilidadOperacional.data?.[0]?.total < 0 ? "#dc3545" : "inherit",
          backgroundColor: "#f5fff5",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    }

    if (apiData.utilidadAntesImpuestos) {
      const utilidadAntesImpuestos = { "0null": apiData.utilidadAntesImpuestos.texto };
      apiData.utilidadAntesImpuestos.data?.forEach((value, index) => {
        utilidadAntesImpuestos[index + 1 + "null"] = formatCurrency(value.total);
      });
      lines.push({
        key: normalizeKey("utilidad_antes_impuestos"),
        data: utilidadAntesImpuestos,
        leaf: true,
        children: [],
        style: {
          color: apiData.utilidadAntesImpuestos.data?.[0]?.total < 0 ? "#dc3545" : "inherit",
          backgroundColor: "#f5f5ff",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    }

    if (apiData.utilidadNeta) {
      const utilidadNeta = { "0null": apiData.utilidadNeta.texto };
      apiData.utilidadNeta.data?.forEach((value, index) => {
        utilidadNeta[index + 1 + "null"] = formatCurrency(value.total);
      });
      lines.push({
        key: normalizeKey("utilidad_neta"),
        data: utilidadNeta,
        leaf: true,
        children: [],
        style: {
          color: apiData.utilidadNeta.data?.[0]?.total < 0 ? "#dc3545" : "inherit",
          backgroundColor: "#fffdf5",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    }

    lines.sort((a, b) => {
      const orderA = orderMap[a.key] ?? 999;
      const orderB = orderMap[b.key] ?? 999;
      return orderA - orderB;
    });
    console.log(
      "Nodos raíz generados:",
      lines.map((l) => l.key)
    );
    return lines;
  };

  const fetchData = async (endpoint, body) => {
    try {
      const response = await postData(endpoint, body, requestHeaders);
      return response;
    } catch (error) {
      console.error("Error en fetchData:", error);
      throw error;
    }
  };

  const createColumnLabel = (item, formatFn = formatCurrency) => {
    const label = { "0null": item.texto || "" };
    if (Array.isArray(item.data)) {
      item.data.forEach((value, index) => {
        label[`${index + 1}null`] = formatFn(value?.total || 0);
      });
    }
    return label;
  };

  const getCuentasPorGrupo = async (grupoKey) => {
    const requestBody = {
      Language: selectedLanguage,
      Grupo: grupoKey,
      etiquetas: labelData,
      ...(filters.dateFrom || filters.dateTo
        ? { Year: null, Month: null, DateFrom: filters.dateFrom, DateTo: filters.dateTo }
        : {
            Year: filters.year ? parseInt(filters.year) : null,
            Month: filters.month ? parseInt(filters.month) : null,
          }),
    };

    const response = await fetchData(ENDPOINTS.PYG_CUENTAS, requestBody);
    console.log("Cuentas response:", response);
    console.log(
      "Generando Cuentas:",
      response.data?.map((c) => ({
        original: c.etiqueta,
        key: `${normalizeKey(grupoKey)}-${normalizeKey(c.etiqueta)}`,
      }))
    );

    return (
      response.data?.map((cuenta) => ({
        key: `${normalizeKey(grupoKey)}-${normalizeKey(cuenta.etiqueta)}`,
        data: createColumnLabel(cuenta),
        children: [],
        leaf: false,
        style: { fontSize: "14px", textAlign: "center" },
      })) || []
    );
  };

  const getSubcuentasPorCuenta = async (cuentaKey) => {
    const requestBody = {
      Language: selectedLanguage,
      Grupo: onExpandGroup(cuentaKey),
      CodigoPosPre: onExpandPospre(cuentaKey),
      etiquetas: labelData,
      ...(filters.dateFrom || filters.dateTo
        ? { Year: null, Month: null, DateFrom: filters.dateFrom, DateTo: filters.dateTo }
        : {
            Year: filters.year ? parseInt(filters.year) : null,
            Month: filters.month ? parseInt(filters.month) : null,
          }),
    };

    const response = await fetchData(ENDPOINTS.PYG_SUBCUENTAS, requestBody);
    console.log("Subcuentas response:", response);
    console.log(
      "Generando SubCuentas:",
      response.data?.map((c) => ({
        original: c.etiqueta,
        key: `${normalizeKey(cuentaKey)}-${normalizeKey(c.etiqueta)}`,
      }))
    );
    return (
      response.data?.map((subcuenta) => ({
        key: `${normalizeKey(cuentaKey)}-${normalizeKey(subcuenta.etiqueta)}`,
        data: createColumnLabel(subcuenta),
        children: [],
        leaf: false,
        style: { fontSize: "14px", textAlign: "center" },
      })) || []
    );
  };

  const getAuxiliarPorSubcuenta = async (subcuentaKey) => {
    const requestBody = {
      Language: selectedLanguage,
      CodigoPosPre: onExpandPospre(subcuentaKey),
      etiquetas: labelData,
      ...(filters.dateFrom || filters.dateTo
        ? { Year: null, Month: null, DateFrom: filters.dateFrom, DateTo: filters.dateTo }
        : {
            Year: filters.year ? parseInt(filters.year) : null,
            Month: filters.month ? parseInt(filters.month) : null,
          }),
    };

    const response = await fetchData(PYG_AUXILIAR, requestBody);
    console.log(
      "Generando Auxiliares:",
      response.data?.map((c) => ({
        original: c.etiqueta,
        key: `${normalizeKey(grupoKey)}-${normalizeKey(c.etiqueta)}`,
      }))
    );
    return (
      response.data?.map((tercero) => ({
        key: `${normalizeKey(subcuentaKey)}-${normalizeKey(tercero.etiqueta)}`,
        data: createColumnLabel(tercero),
        leaf: true,
        style: { fontSize: "14px", textAlign: "center" },
      })) || []
    );
  };

  const onExpandType = (nodeKey) => {
    const keyParts = normalizeKey(nodeKey).split("-");
    return keyParts[0] || null; // siempre el grupo
  };

  const onExpandGroup = (nodeKey) => {
    const keyParts = normalizeKey(nodeKey).split("-");
    return keyParts[0] || null; // siempre el grupo
  };

  const onExpandPospre = (nodeKey) => {
    const keyParts = normalizeKey(nodeKey).split("-");
    return keyParts.length > 1 ? keyParts[1] : null; // la cuenta
  };

  const onExpandSubpospre = (nodeKey) => {
    const keyParts = normalizeKey(nodeKey).split("-");
    return keyParts.length > 2 ? keyParts[2] : null; // la subcuenta
  };

  const insertChildren = (currentNodes, parentKey, newChildren) => {
    let found = false;

    const transformed = currentNodes.map((n) => {
      const k = normalizeKey(n.key);

      if (k === normalizeKey(parentKey)) {
        found = true;
        return { ...n, children: newChildren, leaf: newChildren.length === 0 };
      }

      if (Array.isArray(n.children) && n.children.length > 0) {
        const result = insertChildren(n.children, parentKey, newChildren);
        if (result.found) {
          found = true;
          return { ...n, children: result.nodes };
        }
      }

      return n;
    });

    return { nodes: transformed, found };
  };

  const handleExpand = async (event) => {
    const node = event.node;
    const nodeKey = normalizeKey(node.key);

    let newChildren = [];

    try {
      console.log("Expanding node:", nodeKey, node);
      if (isGrupo(node)) {
        console.log("Expanding Grupo:", nodeKey);
        newChildren = await getCuentasPorGrupo(nodeKey);
      } else if (isCuenta(node)) {
        console.log("Expanding Cuenta:", nodeKey);
        newChildren = await getSubcuentasPorCuenta(nodeKey);
      } else if (isSubcuenta(node)) {
        console.log("Expanding Subcuenta:", nodeKey);
        newChildren = await getAuxiliarPorSubcuenta(nodeKey);
      }

      if (!newChildren) newChildren = [];

      if (newChildren.length > 0) {
        setNodes((prev) => {
          const prevCopy = Array.isArray(prev) ? [...prev] : [];
          const { nodes: updated, found } = insertChildren(prevCopy, nodeKey, newChildren);
          if (!found) {
            console.warn("[TreeTable] parent key not found when inserting children:", nodeKey);
            console.warn(
              "Root keys:",
              prevCopy.map((p) => p.key)
            );
            return prev;
          }
          return updated;
        });

        // marcamos expandido (si onToggle no lo hizo ya)
        setExpandedKeys((prev) => ({ ...prev, [nodeKey]: true }));
      } else {
        // si no hay hijos, igual marcamos leaf
        setNodes((prev) =>
          prev.map((p) => (normalizeKey(p.key) === nodeKey ? { ...p, leaf: true } : p))
        );
      }
    } catch (error) {
      console.error("Error en handleExpand:", error);
    }
  };

  const onCollapse = (event) => {
    const nodeKey = normalizeKey(event.node.key);
    setExpandedKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[nodeKey];
      return newKeys;
    });
  };

  // Mensaje si no hay cliente o filtros mínimos
  if (!selectedClientId || (!filters.year && !filters.yearTwo && !filters.dateTo)) {
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

  if (!selectedClientId || (searchCompleted && !nodes.length)) {
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
        onExpand={handleExpand}
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
            expander={col.isExpander || false}
            headerStyle={{
              backgroundColor: "#e8f0fe",
              color: "#333",
              fontWeight: "bold",
            }}
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
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
    yearOne: PropTypes.string,
    yearTwo: PropTypes.string,
  }).isRequired,
};

export default ThreeTableData;
