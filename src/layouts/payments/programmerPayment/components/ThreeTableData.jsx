import React, { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import MDBox from "components/MDBox";
import ENDPOINTS from "services/endpoints";
import usePost from "hooks/usePost";
import PropTypes from "prop-types";
import { useClient } from "context/ClientContext";
import { Alert } from "@mui/material";

const ThreeTableData = ({ selectedLanguage, filters }) => {
  const [nodes, setNodes] = useState([]);
  const [columns, setColumns] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [accountsPospre, setAccountsPospre] = useState("");

  const { data: reportData = {}, postData } = usePost();

  const { selectedClientId } = useClient();

  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    const fetchData = async () => {
      setSearchCompleted(false);
      const requestBody = {
        FechaVencimiento: filters?.date || null,
        Language: selectedLanguage,
        CentroCostos: filters?.costCenter || null,
        Identificacion: filters?.third || null,
        TipoProveedor: filters?.supplierType || null,
      };

      try {
        const requestHeaders = {
          "x-client-id": selectedClientId,
        };
        await postData(ENDPOINTS.PAID_PROGRAMMER, requestBody, requestHeaders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setSearchCompleted(true);
      }
    };

    fetchData();
  }, [
    selectedLanguage,
    selectedClientId,
    filters?.date,
    filters?.costCenter,
    filters?.third,
    filters?.supplierType,
  ]);

  useEffect(() => {
    if (reportData) {
      const formattedNodes = reportData.map((item) => ({
        key: item.id.toString(),
        data: {
          proveedor: `${item.identificacion} - ${item.nombreProveedor}`,
          tipoProveedor: item.tipoProveedor,
          direccion: item.direccion,
          nroCuota: item.nroCuota,
          deudaPorPagar: formatCurrency(item.deudaPorPagar),
          valorAnticipo: formatCurrency(item.valorAnticipo),
          valorAnticipoUSD: formatCurrency(item.valorAnticipoUSD),
          saldoProveedor: formatCurrency(item.saldoProveedor),
          centroCosto: item.centroCostos,
        },
        leaf: true,
        style: {
          fontSize: "14px",
          backgroundColor: "#f9f9f9",
        },
      }));
      setNodes(formattedNodes);
      setLoading(false);
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

  if (!selectedClientId) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="info" variant="outlined">
          {selectedLanguage === "es"
            ? "Debes buscar un cliente para visualizar los datos"
            : "You must search for a client to view the data"}
        </Alert>
      </MDBox>
    );
  }

  if (searchCompleted && !nodes.length) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="warning" variant="outlined">
          {selectedLanguage === "es"
            ? "No se encontraron datos para los filtros aplicados"
            : "No data was found for the applied filters"}
        </Alert>
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
          field="proveedor"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          header={selectedLanguage === "es" ? "Proveedor" : "Supplier"}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="tipoProveedor"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          header={selectedLanguage === "es" ? "Tipo Proveedor" : "Supplier Type"}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="centroCosto"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          header={selectedLanguage === "es" ? "Centro Costo" : "Cost Center"}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="nroCuota"
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          header={selectedLanguage === "es" ? "Nro Cuota" : "Installment Number"}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="deudaPorPagar"
          header={selectedLanguage === "es" ? "Deuda Por Pagar" : "Debt to Pay"}
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="valorAnticipo"
          header={selectedLanguage === "es" ? "Valor Anticipo" : "Advance Value"}
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="valorAnticipoUSD"
          header={selectedLanguage === "es" ? "Valor Anticipo USD" : "Advance Value USD"}
          headerStyle={{
            backgroundColor: "#e8f0fe",
            color: "#333",
            fontWeight: "bold",
          }}
          bodyClassName="p-3"
          headerClassName="p-3"
        />
        <Column
          field="saldoProveedor"
          header={selectedLanguage === "es" ? "Saldo Proveedor" : "Supplier Balance"}
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
  selectedLanguage: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costCenter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    third: PropTypes.string,
    supplierType: PropTypes.string,
  }).isRequired,
};

export default ThreeTableData;
