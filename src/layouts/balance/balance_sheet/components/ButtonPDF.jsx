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
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [classData, setClassData] = useState([]);

  const { data: reportData = {}, postData } = usePost();
  const { selectedClientId } = useClient();
  const isGrouped = filters.yearsMonth === 2;

  useEffect(() => {
    if (!selectedLanguage || !selectedClientId) return;

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
      } catch (err) {
        console.error("Error fetching client logo:", err);
      }
    };
    fetchData();
  }, [selectedLanguage, selectedClientId]);

  const sendPDFByEmail = async (pdfBase64, filename) => {
    try {
      const response = await fetch(ENDPOINTS.SEND_MAIL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": selectedClientId,
        },
        body: JSON.stringify([
          {
            Contenido: pdfBase64,
            Nombre: filename,
          },
        ]),
      });

      const result = await response.json();
      console.log("PDF enviado correctamente:", result);
    } catch (error) {
      console.error("Error enviando el PDF:", error);
    }
  };

  useEffect(() => {
    const fetchBalanceSheetData = async () => {
      try {
        setLoading(true);

        const requestHeaders = {
          "Content-Type": "application/json",
          "x-client-id": selectedClientId,
        };

        let requestBody;
        let endpoint;

        if (isGrouped) {
          // For grouped (year comparison) view
          endpoint = ENDPOINTS.BALANCE_SHEET_GROUPED_HEADER;
          requestBody = {
            Year1: filters.yearOne,
            Year2: filters.yearTwo,
            Language: selectedLanguage,
          };
        } else {
          // For regular view
          endpoint = ENDPOINTS.BALANCE_SHEET;
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

        const response = await fetch(endpoint, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Balance sheet data fetch error: ${response.status}`);
        }

        const data = await response.json();
        setBalanceSheetData(data);
        setLabelData(data.etiquetas || []);

        // For groups: Fetch subcategories, details and third-party data
        if (data.data && data.data.length > 0) {
          const subCategories = {};
          const details = {};
          const terceros = {};

          // Get main categories (1: Assets, 2: Liabilities, 3: Equity)
          const mainCategories = isGrouped
            ? data.data
                .map((item) => item.codigo)
                .filter((code) => !code.toLowerCase().includes("total"))
            : data.data
                .map((item) => item.etiqueta)
                .filter((code) => !code.toLowerCase().includes("total"));
          setClassData(mainCategories);

          // For each main category, fetch subcategories
          for (const category of mainCategories) {
            try {
              // Fetch subcategories
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
                : ENDPOINTS.BALANCE_SHEET_CHILD;

              const subCategoryResponse = await fetch(subCategoryEndpoint, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(subCategoryBody),
              });

              if (subCategoryResponse.ok) {
                const subCategoryData = await subCategoryResponse.json();
                subCategories[category] = subCategoryData.data;

                // Get unique groups to fetch details
                const uniqueGroups = isGrouped
                  ? [...new Set(subCategoryData.data.map((item) => item.codigo))]
                  : [...new Set(subCategoryData.data.map((item) => item.etiqueta))];

                // For each group, fetch details
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
                      : ENDPOINTS.BALANCE_SHEET_DETAIL;

                    const detailResponse = await fetch(detailEndpoint, {
                      method: "POST",
                      headers: requestHeaders,
                      body: JSON.stringify(detailBody),
                    });

                    if (detailResponse.ok) {
                      const detailData = await detailResponse.json();
                      details[group] = detailData.data;

                      // For each detail item, fetch terceros
                      const detailItems = detailData.data;
                      if (detailItems && detailItems.length > 0) {
                        for (const detail of detailItems) {
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
                              : ENDPOINTS.BALANCE_SHEET_THIRD;

                            const terceroResponse = await fetch(terceroEndpoint, {
                              method: "POST",
                              headers: requestHeaders,
                              body: JSON.stringify(terceroBody),
                            });

                            if (terceroResponse.ok) {
                              const terceroData = await terceroResponse.json();
                              terceros[codigoPosPre] = terceroData.data;
                            }
                          } catch (error) {
                            console.error(`Error fetching terceros for ${codigoPosPre}:`, error);
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.error(`Error fetching details for group ${group}:`, error);
                  }
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
      } finally {
        setLoading(false);
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
    doc.text(selectedLanguage === "es" ? "Balance General" : "Balance Sheet", 20, 25);

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
        ? "Estado de Situación Financiera"
        : "Statement of Financial Position",
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

        // Add subcategories if available
        const subCats = subCategoriesData[mainItem.etiqueta];
        if (subCats && subCats.length > 0) {
          subCats.forEach((subItem) => {
            const subRow = [`   ${subItem.texto}`];

            if (subItem.data && subItem.data.length > 0) {
              subItem.data.forEach((dataItem) => {
                subRow.push(formatCurrency(dataItem.total));
              });
            }

            tableData.push(subRow);

            // Add details if available
            const groupCode = subItem.etiqueta;
            const details = detailsData[groupCode];
            if (details && details.length > 0) {
              details.forEach((detailItem) => {
                const detailRow = [`      ${detailItem.texto}`];

                if (detailItem.data && detailItem.data.length > 0) {
                  detailItem.data.forEach((dataItem) => {
                    detailRow.push(formatCurrency(dataItem.total));
                  });
                }

                tableData.push(detailRow);

                const terceros = tercerosData[detailItem.etiqueta];
                if (terceros && terceros.length > 0) {
                  terceros.forEach((terceroItem) => {
                    const terceroRow = [`         ${terceroItem.texto}`];
                    terceroRow.push(formatCurrency(terceroItem.total));
                    terceroItem.data.forEach((dataTerceroItem) => {
                      terceroRow.push(formatCurrency(dataTerceroItem.total));
                    });
                    tableData.push(terceroRow);
                  });
                }
              });
            }
          });
        }
      });
    }

    // Add utility data
    if (balanceSheetData.utilidadMes) {
      const utilidadMesRow = [balanceSheetData.utilidadMes.texto];

      if (balanceSheetData.utilidadMes.data && balanceSheetData.utilidadMes.data.length > 0) {
        balanceSheetData.utilidadMes.data.forEach((dataItem) => {
          utilidadMesRow.push(formatCurrency(dataItem.total));
        });
      }

      tableData.push(utilidadMesRow);
    }

    if (balanceSheetData.utilidadAcumulada) {
      const utilidadAcumuladaRow = [balanceSheetData.utilidadAcumulada.texto];

      if (
        balanceSheetData.utilidadAcumulada.data &&
        balanceSheetData.utilidadAcumulada.data.length > 0
      ) {
        balanceSheetData.utilidadAcumulada.data.forEach((dataItem) => {
          utilidadAcumuladaRow.push(formatCurrency(dataItem.total));
        });
      }

      tableData.push(utilidadAcumuladaRow);
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

        // Format main categories
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

        // Format indented rows
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

    // Add signatures if requested
    if (filters.signature) {
      // Get the final Y position after the table
      const finalY = doc.lastAutoTable.finalY + 20;

      if (finalY > pageHeight - 60) {
        doc.addPage();
      } else {
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(0.2);
        doc.line(20, finalY, pageWidth - 20, finalY);
      }

      const signatureY = finalY > pageHeight - 60 ? 100 : finalY + 30;

      doc.setFontSize(11);
      doc.setTextColor(...darkGray);

      // Manager signature
      doc.text("Catalina Rodríguez Ramírez", 20, signatureY);
      doc.text("CC 1.152.440.535", 20, signatureY + 7);
      doc.text(
        selectedLanguage === "es" ? "Representante Legal" : "Legal Representative",
        20,
        signatureY + 14
      );
      if (signatureManagerUrl) {
        doc.addImage(signatureManagerUrl, "JPEG", 20, signatureY + 20, 40, 20);
      }

      // Accountant signature
      doc.text("MARÍA PATRICIA FERNÁNDEZ GALEANO", pageWidth - 20, signatureY, { align: "right" });
      doc.text("TP-178399-1", pageWidth - 20, signatureY + 7, { align: "right" });
      doc.text(
        selectedLanguage === "es" ? "Contadora" : "Accountant",
        pageWidth - 20,
        signatureY + 14,
        { align: "right" }
      );
      if (signatureAccountantUrl) {
        const firmaWidth = 40;
        const firmaXPosition = pageWidth - 20 - firmaWidth;
        doc.addImage(
          signatureAccountantUrl,
          "JPEG",
          firmaXPosition,
          signatureY + 20,
          firmaWidth,
          20
        );
      }

      // Fiscal auditor signature
      doc.text("ANDERSON YEPES BEDOYA", pageWidth / 2, signatureY + 60, { align: "center" });
      doc.text("TP-178399-1", pageWidth / 2, signatureY + 67, { align: "center" });
      doc.text(
        selectedLanguage === "es" ? "Revisor Fiscal" : "Fiscal Auditor",
        pageWidth / 2,
        signatureY + 74,
        { align: "center" }
      );
      if (signatureReviewerUrl) {
        doc.addImage(signatureReviewerUrl, "JPEG", pageWidth / 2 - 20, signatureY + 80, 40, 20);
      }
    }

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

    const filename = `balance_general_${filters.year || new Date().getFullYear()}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename);

    if (filters.sendPDF) {
      const pdfBase64WithPrefix = doc.output("datauristring");
      const pdfBase64 = pdfBase64WithPrefix.split(",")[1];

      sendPDFByEmail(pdfBase64, filename);
    }
  };

  // Generate PDF for grouped/comparative view (two years)
  const generateGroupedPDF = () => {
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
    const accentGreen = [46, 125, 50];

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
    doc.text(
      selectedLanguage === "es" ? "Balance General Comparativo" : "Comparative Balance Sheet",
      20,
      25
    );

    if (logoDataURL) {
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(pageWidth - 55, 14, 35, 18, 2, 2, "F");
      doc.addImage(logoDataURL, "JPEG", pageWidth - 52, 15, 30, 15);
    }

    doc.setFillColor(...secondaryBlue);
    doc.roundedRect(20, 28, 70, 14, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`${filters.yearOne} - ${filters.yearTwo}`, 35, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...darkGray);
    doc.text(
      selectedLanguage === "es"
        ? "Comparativo de estados financieros"
        : "Comparative financial statements",
      100,
      38
    );

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
        ? "Estado de Situación Financiera Comparativo"
        : "Comparative Statement of Financial Position",
      20,
      82
    );

    // Set up table data for grouped view
    const tableHeaders = labelData;
    let tableData = [];

    // Add main categories
    if (balanceSheetData.data && balanceSheetData.data.length > 0) {
      balanceSheetData.data.forEach((mainItem) => {
        const mainRow = [mainItem.texto];

        // Add year columns and variation columns
        mainRow.push(mainItem.notas);
        mainRow.push(formatCurrency(mainItem.valorPrevio));
        mainRow.push(formatCurrency(mainItem.valorActual));
        mainRow.push(formatCurrency(mainItem.valorVariacion));
        mainRow.push(formatPercentage(mainItem.valorPorcentaje));

        tableData.push(mainRow);

        // Add subcategories if available
        const subCats = subCategoriesData[mainItem.codigo];
        if (subCats && subCats.length > 0) {
          subCats.forEach((subItem) => {
            const subRow = [`   ${subItem.texto}`];
            subRow.push(subItem.notas);
            subRow.push(formatCurrency(subItem.valorPrevio));
            subRow.push(formatCurrency(subItem.valorActual));
            subRow.push(formatCurrency(subItem.valorVariacion));
            subRow.push(formatPercentage(subItem.valorPorcentaje));

            tableData.push(subRow);

            // Add details if available
            const details = detailsData[subItem.codigo];
            if (details && details.length > 0) {
              details.forEach((detailItem) => {
                const detailRow = [`      ${detailItem.texto}`];
                detailRow.push(detailItem.notas);
                detailRow.push(formatCurrency(detailItem.valorPrevio));
                detailRow.push(formatCurrency(detailItem.valorActual));
                detailRow.push(formatCurrency(detailItem.valorVariacion));
                detailRow.push(formatPercentage(detailItem.valorPorcentaje));

                tableData.push(detailRow);

                const terceros = tercerosData[detailItem.codigo];
                if (terceros && terceros.length > 0) {
                  terceros.forEach((terceroItem) => {
                    const terceroRow = [`         ${terceroItem.texto}`];
                    terceroRow.push("");
                    terceroRow.push(formatCurrency(terceroItem.valorPrevio));
                    terceroRow.push(formatCurrency(terceroItem.valorActual));
                    terceroRow.push(formatCurrency(terceroItem.valorVariacion));
                    terceroRow.push(formatPercentage(terceroItem.valorPorcentaje));

                    tableData.push(terceroRow);
                  });
                }
              });
            }
          });
        }
      });
    }

    // Create the table
    autoTable(doc, {
      startY: 87,
      head: [tableHeaders],
      body: tableData,
      styles: {
        font: "helvetica",
        fontSize: 10,
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
        0: { halign: "left" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        const rowData = data.row.raw?.[0] || "";
        const colIndex = data.column.index;

        // Format main categories
        if (classData.includes(rowData)) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 242, 245];
          data.cell.styles.textColor = [50, 50, 50];
        }

        // Format variation columns (positive in green, negative in red)
        if (colIndex === 4 || colIndex === 5) {
          const value = data.row.raw[colIndex];
          if (value && value.includes("-")) {
            data.cell.styles.textColor = [220, 53, 69]; // Red for negative
          } else if (value && !value.includes("-") && value !== "0%") {
            data.cell.styles.textColor = [46, 125, 50]; // Green for positive
          }
        }

        // Format indented rows
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

    // Add signatures if requested
    if (filters.signature) {
      // Get the final Y position after the table
      const finalY = doc.lastAutoTable.finalY + 20;

      if (finalY > pageHeight - 60) {
        doc.addPage();
      } else {
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(0.2);
        doc.line(20, finalY, pageWidth - 20, finalY);
      }

      const signatureY = finalY > pageHeight - 60 ? 100 : finalY + 30;

      doc.setFontSize(10);
      doc.setTextColor(...darkGray);

      // Manager signature
      doc.text("Catalina Rodríguez Ramírez", 20, signatureY);
      doc.text("CC 1.152.440.535", 20, signatureY + 7);
      doc.text(
        selectedLanguage === "es" ? "Representante Legal" : "Legal Representative",
        20,
        signatureY + 14
      );
      if (signatureManagerUrl) {
        doc.addImage(signatureManagerUrl, "JPEG", 20, signatureY + 20, 40, 20);
      }

      // Accountant signature
      doc.text("MARÍA PATRICIA FERNÁNDEZ GALEANO", pageWidth - 20, signatureY, { align: "right" });
      doc.text("TP-178399-1", pageWidth - 20, signatureY + 7, { align: "right" });
      doc.text(
        selectedLanguage === "es" ? "Contadora" : "Accountant",
        pageWidth - 20,
        signatureY + 14,
        { align: "right" }
      );
      if (signatureAccountantUrl) {
        const firmaWidth = 40;
        const firmaXPosition = pageWidth - 20 - firmaWidth;
        doc.addImage(
          signatureAccountantUrl,
          "JPEG",
          firmaXPosition,
          signatureY + 20,
          firmaWidth,
          20
        );
      }

      // Fiscal auditor signature
      doc.text("ANDERSON YEPES BEDOYA", pageWidth / 2, signatureY + 60, { align: "center" });
      doc.text("TP-178399-1", pageWidth / 2, signatureY + 67, { align: "center" });
      doc.text(
        selectedLanguage === "es" ? "Revisor Fiscal" : "Fiscal Auditor",
        pageWidth / 2,
        signatureY + 74,
        { align: "center" }
      );
      if (signatureReviewerUrl) {
        doc.addImage(signatureReviewerUrl, "JPEG", pageWidth / 2 - 20, signatureY + 80, 40, 20);
      }
    }

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

    // Save the PDF
    const filename = `balance_general_comparativo_${filters.yearOne}_${filters.yearTwo}_${
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
        disabled={loading || !balanceSheetData}
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
