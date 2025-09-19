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

  const { data: reportData = {}, postData } = usePost();

  const { selectedClientId } = useClient();

  const requestHeaders = {
    "x-client-id": selectedClientId,
  };

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchData = async () => {
      setSearchCompleted(false);

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
          filters.yearsMonth === 2
            ? ENDPOINTS.BALANCE_SHEET_GROUPED_HEADER
            : ENDPOINTS.BALANCE_SHEET;
        const body = filters.yearsMonth === 2 ? requesBodyGroup : requestBody;

        await postData(endpoint, body, requestHeaders);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLanguage, filters.year, filters.month, filters.yearTwo, filters.dateTo]);

  useEffect(() => {
    if (reportData) {
      setColumns(createColumns(reportData.etiquetas || []));
      setLabelData(reportData.etiquetas);

      if (reportData.data) {
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

  const createColumns = (etiquetas) => {
    const safeEtiquetas = Array.isArray(etiquetas) ? etiquetas : [];
    return safeEtiquetas.map((etiqueta, index) => {
      return generateColum(etiqueta, index);
    });
  };

  const addProperty = (object, property, value) => {
    object[property] = value;

    return object;
  };

  const transformDataToNodes = (apiData) => {
    const data = apiData.data;
    const lines = [];

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
        item.data.forEach((value, index) => {
          columnLabel = addProperty(columnLabel, `${index + 1}null`, formatCurrency(value.total));
        });
      }

      lines.push({
        key: filters.yearsMonth === 2 ? item.codigo : item.etiqueta,
        data: columnLabel,
        leaf: item.texto.toLowerCase().includes("total"),
        style: {
          color: "inherit",
          backgroundColor: item.texto.toLowerCase().includes("total") ? "#f9f9f9" : "#f4f6f8",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    });

    if (apiData.utilidadMes) {
      const utilidadMes = {
        "0null": apiData.utilidadMes.texto,
      };

      if (apiData.utilidadMes.data && apiData.utilidadMes.data.length > 0) {
        apiData.utilidadMes.data.forEach((value, index) => {
          utilidadMes[index + 1 + "null"] = formatCurrency(value.total);
        });
      }

      lines.push({
        key: "utilidad_mes",
        data: utilidadMes,
        leaf: true,
        style: {
          color: apiData.utilidadMes.data[0].total < 0 ? "#dc3545" : "inherit",
          backgroundColor: "#fff5f5",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    }

    if (apiData.utilidadAcumulada) {
      const utilidadAcumulada = {
        "0null": apiData.utilidadAcumulada.texto,
      };

      if (apiData.utilidadAcumulada.data && apiData.utilidadAcumulada.data.length > 0) {
        apiData.utilidadAcumulada.data.forEach((value, index) => {
          utilidadAcumulada[index + 1 + "null"] = formatCurrency(value.total);
        });
      }

      lines.push({
        key: "utilidad_acumulada",
        data: utilidadAcumulada,
        leaf: true,
        style: {
          color: apiData.utilidadMes.data[0].total < 0 ? "#dc3545" : "inherit",
          backgroundColor: "#fff5f5",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });
    }

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

  const expandData = (item) => {
    return {
      "0null": `${item.texto} (${item.codigo})`,
      "1null": item.notas?.toString(),
      "2null": formatCurrency(item.valorPrevio),
      "3null": formatCurrency(item.valorActual),
      "4null": formatCurrency(item.valorVariacion),
      "5null": `${item.valorPorcentaje}%`,
    };
  };

  const onExpandType = (nodeKey) => {
    const keyParts = nodeKey.includes("-") ? nodeKey.split("-") : [nodeKey];

    return keyParts[0];
  };

  const onExpandGroup = (nodeKey) => {
    const keyParts = nodeKey.includes("-") ? nodeKey.split("-") : [nodeKey];

    return keyParts.length > 1 ? keyParts[1] : null;
  };

  const onExpandPospre = (nodeKey) => {
    const keyParts = nodeKey.includes("-") ? nodeKey.split("-") : [nodeKey];

    return keyParts.length > 2 ? keyParts[2] : null;
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

      let requestBody =
        filters.yearsMonth === 2
          ? {
              Year1: filters.yearOne,
              Year2: filters.yearTwo,
              Language: selectedLanguage,
              Type: onExpandType(nodeKey),
            }
          : {
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
              Language: selectedLanguage,
              Type: onExpandType(nodeKey),
              etiquetas: labelData,
            };

      const [childrenData] = await Promise.all([
        fetchData(
          filters.yearsMonth === 2
            ? ENDPOINTS.BALANCE_SHEET_GROUPED_CHILD
            : ENDPOINTS.BALANCE_SHEET_CHILD,
          requestBody
        ),
      ]);
      childrenNodes = childrenData.data
        ? await Promise.all(
            childrenData.data.map(async (item) => {
              const newNodekey =
                filters.yearsMonth === 2
                  ? `${nodeKey}-${item.codigo}`
                  : `${nodeKey}-${item.etiqueta}`;

              let object = {
                key: newNodekey,
                data: filters.yearsMonth === 2 ? expandData(item) : createColumnLabel(item),
                style: {
                  fontSize: "14px",
                  textAlign: "center",
                },
              };

              const detailChildrenData = await getDetailChildrenData(newNodekey);
              addProperty(object, "leaf", !detailChildrenData || detailChildrenData.length === 0);
              addProperty(object, "children", detailChildrenData);

              return object;
            })
          )
        : [];

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

  const getDetailChildrenData = async (nodeKey) => {
    const requestBodyDetail =
      filters.yearsMonth === 2
        ? {
            Year1: filters.yearOne,
            Year2: filters.yearTwo,
            Language: selectedLanguage,
            Group: onExpandGroup(nodeKey),
          }
        : {
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
            Language: selectedLanguage,
            grupo: onExpandGroup(nodeKey),
            etiquetas: labelData,
          };
    return fetchData(
      filters.yearsMonth === 2
        ? ENDPOINTS.BALANCE_SHEET_GROUPED_DETAIL
        : ENDPOINTS.BALANCE_SHEET_DETAIL,
      requestBodyDetail
    ).then((allDetailsData) => {
      return allDetailsData.data && allDetailsData.data.length > 0
        ? allDetailsData.data.map((detailChild) => mapDetail(detailChild, nodeKey))
        : [];
    });
  };

  const mapDetail = (detailChildren, nodeKey) => {
    const newNodekey =
      filters.yearsMonth === 2
        ? `${nodeKey}-${detailChildren.codigo}-${detailChildren.codigo}`
        : `${nodeKey}-${detailChildren.etiqueta}-${detailChildren.etiqueta}`;
    const thirdChildrenData = getThirdChildrenData(newNodekey);
    return {
      key: newNodekey,
      data:
        filters.yearsMonth === 2 ? expandData(detailChildren) : createColumnLabel(detailChildren),
      leaf: !thirdChildrenData || thirdChildrenData.length > 0,
      children: thirdChildrenData,
      style: {
        fontSize: "14px",
        textAling: "center",
      },
    };
  };

  const getThirdChildrenData = (nodeKey) => {
    const requestBodyThird =
      filters.yearsMonth === 2
        ? {
            Year1: filters.yearOne,
            Year2: filters.yearTwo,
            Language: selectedLanguage,
            CodigoPosPre: onExpandPospre(nodeKey),
          }
        : {
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
            Language: selectedLanguage,
            CodigoPosPre: onExpandPospre(nodeKey),
            etiquetas: labelData,
          };
    let object = [];
    fetchData(
      filters.yearsMonth === 2
        ? ENDPOINTS.BALANCE_SHEET_GROUPED_THIRD
        : ENDPOINTS.BALANCE_SHEET_THIRD,
      requestBodyThird
    ).then((dataThird) => {
      if (dataThird.data) {
        dataThird.data.forEach((thirdChild) => {
          object.push({
            key: `${nodeKey}-${thirdChild.etiqueta}-${thirdChild.etiqueta}`,
            data: filters.yearsMonth === 2 ? expandData(thirdChild) : createColumnLabel(thirdChild),
            leaf: true,
            style: {
              fontSize: "14px",
              textAling: "center",
            },
          });
        });
      }
    });

    return object;
  };

  const onCollapse = (event) => {
    const nodeKey = event.node.key;
    setExpandedKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[nodeKey];
      return newKeys;
    });
  };

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
        onExpand={onExpand}
        onCollapse={onCollapse}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={6}
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
