import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import ENDPOINTS from "services/endpoints";
import usePost from "hooks/usePost";
import { useClient } from "context/ClientContext";

const ButtonPDF = ({
  selectedLanguage,
  filters,
  validateYear = () => true,
  setSnackbarSeverity,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [subCategoriesData, setSubCategoriesData] = useState({});
  const [detailsData, setDetailsData] = useState({});
  const [tercerosData, setTercerosData] = useState({});
  const [labelData, setLabelData] = useState([]);
  const [classData, setClassData] = useState([]);

  const { data: reportData, postData } = usePost();
  const { selectedClientId } = useClient();
  const isGrouped = filters.yearsMonth === 2;

  // Fetch client logo
  useEffect(() => {
    if (!selectedLanguage) return;

    const fetchData = async () => {
      try {
        const requestBodyClient = {
          IdCliente: selectedClientId,
          IdUsuario: 4,
        };

        const requestHeaders = {
          "x-client-id": selectedClientId,
        };

        await postData(ENDPOINTS.CLIENT_LOGO, requestBodyClient, requestHeaders);
      } catch (error) {
        console.error("Error fetching client logo:", error);
      }
    };

    fetchData();
  }, [selectedLanguage, selectedClientId]);

  // Send PDF by email
  const sendPDFByEmail = async (pdfBase64, filename) => {
    try {
      const payload = [
        {
          Contenido: pdfBase64,
          Nombre: filename,
        },
      ];

      await postData(ENDPOINTS.SEND_MAIL, payload, {
        "x-client-id": selectedClientId,
      });

      console.log("PDF enviado correctamente");
    } catch (error) {
      console.error("Error enviando el PDF:", error);
    }
  };

  useEffect(() => {
    const fetchBalanceSheetData = async () => {
      try {
        let requestBody;
        let endpoint;

        if (isGrouped) {
          endpoint = ENDPOINTS.BALANCE_SHEET_GROUPED_HEADER;
          requestBody = {
            Year1: filters.yearOne,
            Year2: filters.yearTwo,
            Language: selectedLanguage,
          };
        } else {
          endpoint = ENDPOINTS.PYG_GRUPOS;
          requestBody = {
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
        }

        const data = await postData(endpoint, requestBody, {
          "x-client-id": selectedClientId,
        });

        setBalanceSheetData(data);
        setLabelData(data.etiquetas || []);

        if (data.data && data.data.length > 0) {
          const subCategories = {};
          const details = {};
          const terceros = {};

          const mainCategories = isGrouped
            ? data.data
                .map((item) => item.codigo)
                .filter((code) => !code.toLowerCase().includes("total"))
            : data.data
                .map((item) => item.etiqueta)
                .filter((code) => !code.toLowerCase().includes("total"));
          setClassData(mainCategories);

          for (const category of mainCategories) {
            try {
              const subCategoryBody = isGrouped
                ? {
                    Year1: filters.yearOne,
                    Year2: filters.yearTwo,
                    Language: selectedLanguage,
                    Type: category,
                  }
                : {
                    Language: selectedLanguage,
                    Type: category,
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
                    etiquetas: data.etiquetas,
                  };

              const subCategoryEndpoint = isGrouped
                ? ENDPOINTS.BALANCE_SHEET_GROUPED_CHILD
                : ENDPOINTS.PYG_CUENTAS;

              const subCategoryData = await postData(subCategoryEndpoint, subCategoryBody, {
                "x-client-id": selectedClientId,
              });

              subCategories[category] = subCategoryData.data;

              const uniqueGroups = isGrouped
                ? [...new Set(subCategoryData.data.map((item) => item.codigo))]
                : [...new Set(subCategoryData.data.map((item) => item.etiqueta))];

              for (const group of uniqueGroups) {
                try {
                  const detailBody = isGrouped
                    ? {
                        Year1: filters.yearOne,
                        Year2: filters.yearTwo,
                        Language: selectedLanguage,
                        Group: group,
                      }
                    : {
                        Language: selectedLanguage,
                        grupo: group,
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
                        etiquetas: data.etiquetas,
                      };

                  const detailEndpoint = isGrouped
                    ? ENDPOINTS.BALANCE_SHEET_GROUPED_DETAIL
                    : ENDPOINTS.PYG_SUBCUENTAS;

                  const detailData = await postData(detailEndpoint, detailBody, {
                    "x-client-id": selectedClientId,
                  });

                  details[group] = detailData.data;

                  if (detailData.data && detailData.data.length > 0) {
                    for (const detail of detailData.data) {
                      const codigoPosPre = isGrouped ? detail.codigo : detail.etiqueta;

                      try {
                        const terceroBody = isGrouped
                          ? {
                              Year1: filters.yearOne,
                              Year2: filters.yearTwo,
                              Language: selectedLanguage,
                              CodigoPosPre: codigoPosPre,
                            }
                          : {
                              Language: selectedLanguage,
                              CodigoPosPre: codigoPosPre,
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
                              etiquetas: data.etiquetas,
                            };

                        const terceroEndpoint = isGrouped
                          ? ENDPOINTS.BALANCE_SHEET_GROUPED_THIRD
                          : ENDPOINTS.PYG_AUXILIAR;

                        const terceroData = await postData(terceroEndpoint, terceroBody, {
                          "x-client-id": selectedClientId,
                        });

                        terceros[codigoPosPre] = terceroData.data;
                      } catch (error) {
                        console.error(`Error fetching terceros for ${codigoPosPre}:`, error);
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching details for group ${group}:`, error);
                }
              }
            } catch (error) {
              console.error(`Error fetching subcategories for ${category}:`, error);
            }
          }

          setSubCategoriesData(subCategories);
          setDetailsData(details);
          setTercerosData(terceros);
        }
      } catch (error) {
        console.error("Error fetching balance sheet data:", error);
      }
    };

    if (
      selectedLanguage &&
      selectedClientId &&
      (filters.year || filters.yearOne || filters.dateFrom)
    ) {
      fetchBalanceSheetData();
    }
  }, [filters, selectedLanguage, selectedClientId, isGrouped]);

  // Process the logo and signatures from the response
  const logoBase64 = reportData?.logoAuxiliar;
  const logoDataURL = logoBase64 ? `data:image/jpeg;base64,${logoBase64}` : null;

  const signatureManager = reportData?.firmaGerente;
  const signatureManagerUrl = signatureManager
    ? `data:image/jpeg;base64,${signatureManager}`
    : null;

  const signatureReviewer = reportData?.firmaRevisor;
  const signatureReviewerUrl = signatureReviewer
    ? `data:image/jpeg;base64,${signatureReviewer}`
    : null;

  const signatureAccountant = reportData?.firmaContador;
  const signatureAccountantUrl = signatureAccountant
    ? `data:image/jpeg;base64,${signatureAccountant}`
    : null;

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "-";
    return `${value}%`;
  };

  const buildRowsRecursive = (item, level = 0) => {
    let row = [`${"   ".repeat(level)}${item.texto}`];
    if (item.data && item.data.length > 0) {
      item.data.forEach((dataItem) => {
        row.push(formatCurrency(dataItem.total));
      });
    }

    let rows = [row];

    // Hijos
    const groupCode = item.etiqueta || item.codigo;
    const childDetails = detailsData[groupCode] || tercerosData[groupCode];
    if (childDetails && childDetails.length > 0) {
      childDetails.forEach((child) => {
        rows = rows.concat(buildRowsRecursive(child, level + 1));
      });
    }

    return rows;
  };

  const handleGeneratePDF = async () => {
    if (typeof validateYear === "function" ? !validateYear() : !(filters.year || filters.yearOne)) {
      if (setSnackbarSeverity && setSnackbarMessage && setSnackbarOpen) {
        setSnackbarSeverity("error");
        setSnackbarMessage(
          selectedLanguage === "es" ? "Por favor seleccione un año" : "Please select a year"
        );
        setSnackbarOpen(true);
      }
      return;
    }

    try {
      if (isGrouped) {
        generateGroupedPDF();
      } else {
        generateStandardPDF();
      }

      if (setSnackbarSeverity && setSnackbarMessage && setSnackbarOpen) {
        setSnackbarSeverity("success");
        setSnackbarMessage(
          selectedLanguage === "es"
            ? "Has descargado el PDF correctamente"
            : "You have successfully downloaded the PDF file"
        );
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (setSnackbarSeverity && setSnackbarMessage && setSnackbarOpen) {
        setSnackbarSeverity("error");
        setSnackbarMessage(
          selectedLanguage === "es" ? "Error al descargar el PDF" : "Error downloading PDF file"
        );
        setSnackbarOpen(true);
      }
    }
  };

  // Generate PDF for standard view (single period)
  const generateStandardPDF = () => {
    if (!balanceSheetData) {
      console.error("No balance sheet data available to generate PDF.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryBlue = [0, 83, 156];
    const secondaryBlue = [41, 128, 185];
    const lightGray = [245, 245, 245];
    const darkGray = [80, 80, 80];

    // Header
    doc.setFillColor(...lightGray);
    doc.rect(0, 0, pageWidth, 65, "F");

    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, 8, 65, "F");

    doc.setFillColor(...secondaryBlue);
    doc.roundedRect(pageWidth - 60, 0, 60, 12, 0, 0, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...primaryBlue);
    doc.text(selectedLanguage === "es" ? "Estado de Resultados (PYG)" : "Income Statement", 20, 25);

    if (logoDataURL) {
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(pageWidth - 55, 14, 35, 18, 2, 2, "F");
      doc.addImage(logoDataURL, "JPEG", pageWidth - 52, 15, 30, 15);
    }

    doc.setFillColor(...secondaryBlue);
    doc.roundedRect(20, 28, 38, 14, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(
      filters.year
        ? filters.year.toString()
        : filters.dateFrom
        ? filters.dateFrom.substring(0, 4)
        : "",
      32,
      38
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...darkGray);
    doc.text(
      selectedLanguage === "es"
        ? "Estado financiero al cierre del período"
        : "Financial statement at the end of the period",
      65,
      38
    );

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, 45, pageWidth - 40, 15, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryBlue);

    let leftPosition = 25;

    if (filters.month && filters.month !== 0) {
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const monthName = filters.month > 0 && filters.month <= 12 ? months[filters.month - 1] : "";

      if (monthName) {
        doc.setFont("helvetica", "bold");
        doc.text(`${selectedLanguage === "es" ? "Mes:" : "Month:"}`, leftPosition, 54);
        leftPosition += 20;
        doc.setFont("helvetica", "normal");
        doc.text(monthName, leftPosition, 54);
        leftPosition += 40;
      }
    }

    if (filters.dateFrom && filters.dateTo) {
      doc.setFont("helvetica", "bold");
      doc.text(`${selectedLanguage === "es" ? "Desde:" : "From:"}`, leftPosition, 54);
      leftPosition += 25;
      doc.setFont("helvetica", "normal");
      doc.text(filters.dateFrom, leftPosition, 54);
      leftPosition += 40;

      doc.setFont("helvetica", "bold");
      doc.text(`${selectedLanguage === "es" ? "Hasta:" : "To:"}`, leftPosition, 54);
      leftPosition += 25;
      doc.setFont("helvetica", "normal");
      doc.text(filters.dateTo, leftPosition, 54);
    }

    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.text("NIT:", pageWidth - 90, 54);
    doc.setFont("helvetica", "normal");
    doc.text("811.025.405-1", pageWidth - 75, 54);

    doc.setDrawColor(...primaryBlue);
    doc.setLineWidth(0.5);
    doc.line(20, 68, pageWidth - 20, 68);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryBlue);
    doc.text(
      selectedLanguage === "es"
        ? "Estado de Resultados Integral"
        : "Comprehensive Income Statement",
      20,
      82
    );

    // Set up table data
    const tableHeaders = labelData;
    let tableData = [];

    // Add main categories
    if (balanceSheetData.data && balanceSheetData.data.length > 0) {
      balanceSheetData.data.forEach((mainItem) => {
        const mainRow = [mainItem.texto];

        if (mainItem.data && mainItem.data.length > 0) {
          mainItem.data.forEach((dataItem) => {
            mainRow.push(formatCurrency(dataItem.total));
          });
        }

        tableData.push(mainRow);

        const subCats = subCategoriesData[mainItem.etiqueta];
        if (subCats && subCats.length > 0) {
          subCats.forEach((subItem) => {
            tableData = tableData.concat(buildRowsRecursive(subItem, 1));
          });
        }
      });
    }

    // === Agregar las utilidades en el orden correspondiente ===
    if (balanceSheetData.utilidadBruta) {
      const row = [balanceSheetData.utilidadBruta.texto];
      balanceSheetData.utilidadBruta.data?.forEach((d) => row.push(formatCurrency(d.total)));
      tableData.push(row);
    }

    if (balanceSheetData.utilidadOperacional) {
      const row = [balanceSheetData.utilidadOperacional.texto];
      balanceSheetData.utilidadOperacional.data?.forEach((d) => row.push(formatCurrency(d.total)));
      tableData.push(row);
    }

    if (balanceSheetData.utilidadAntesImpuestos) {
      const row = [balanceSheetData.utilidadAntesImpuestos.texto];
      balanceSheetData.utilidadAntesImpuestos.data?.forEach((d) =>
        row.push(formatCurrency(d.total))
      );
      tableData.push(row);
    }

    if (balanceSheetData.utilidadNeta) {
      const row = [balanceSheetData.utilidadNeta.texto];
      balanceSheetData.utilidadNeta.data?.forEach((d) => row.push(formatCurrency(d.total)));
      tableData.push(row);
    }

    // Create the table
    autoTable(doc, {
      startY: 87,
      head: [tableHeaders],
      body: tableData,
      styles: {
        font: "helvetica",
        fontSize: 11,
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [70, 70, 70],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: {
          fontStyle: "normal",
          halign: "left",
        },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: function (data) {
        const rowData = data.row.raw?.[0] || "";

        if (classData.includes(rowData)) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 242, 245];
          data.cell.styles.textColor = [50, 50, 50];
        } else if (rowData.includes("Utilidad")) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 230, 240];
          data.cell.styles.textColor = primaryBlue;
          data.cell.styles.fontSize = 12;
        } else if (rowData.toLowerCase().includes("total")) {
          data.cell.styles.fillColor = [220, 230, 240];
          data.cell.styles.textColor = primaryBlue;
          data.cell.styles.fontSize = 12;
        }

        if (rowData.startsWith("   ")) {
          data.cell.styles.fontStyle = "normal";
        }

        if (rowData.startsWith("      ")) {
          data.cell.styles.fontStyle = "italic";
          data.cell.styles.fontSize = 10;
        }
      },
      margin: { left: 20, right: 20 },
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120);
    const currentDate = new Date().toLocaleDateString();
    doc.text(
      `${
        selectedLanguage === "es"
          ? "Documento generado automáticamente"
          : "Document automatically generated"
      } - ${currentDate}`,
      20,
      pageHeight - 10
    );
    doc.text(
      `${selectedLanguage === "es" ? "Página" : "Page"} 1 / 1`,
      pageWidth - 20,
      pageHeight - 10,
      {
        align: "right",
      }
    );

    const filename = `estado_resultados_${filters.year || new Date().getFullYear()}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename);

    if (filters.sendPDF) {
      const pdfBase64WithPrefix = doc.output("datauristring");
      const pdfBase64 = pdfBase64WithPrefix.split(",")[1];

      sendPDFByEmail(pdfBase64, filename);
    }
  };

  return (
    <>
      <MDButton
        variant="outlined"
        color="info"
        onClick={handleGeneratePDF}
        disabled={!balanceSheetData}
      >
        <Icon>picture_as_pdf</Icon>
        &nbsp;{selectedLanguage === "es" ? "Descargar PDF" : "Download PDF"}
      </MDButton>
    </>
  );
};

ButtonPDF.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    yearsMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
    yearOne: PropTypes.string,
    yearTwo: PropTypes.string,
    signature: PropTypes.bool,
    sendPDF: PropTypes.bool,
  }).isRequired,
  validateYear: PropTypes.func,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

export default ButtonPDF;
