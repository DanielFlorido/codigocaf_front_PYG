import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ImageCAF from "../../../../assets/images/logo_caf.png";
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
  const [cashFlowData, setCashFlowData] = useState(null);
  const [subheaderData, setSubheaderData] = useState({});
  const [terceroData, setTerceroData] = useState({});
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);

  const { data: reportData = {}, postData } = usePost();
  const { selectedClientId } = useClient();

  useEffect(() => {
    if (!selectedLanguage) return;

    const fetchData = async () => {
      try {
        const requestBodyClient = {
          IdCliente: selectedClientId,
          IdUsuario: 4,
        };

        const requestHeaders = {
          "Content-Type": "application/json",
          "x-client-id": selectedClientId,
        };

        await postData(ENDPOINTS.CLIENT_LOGO, requestBodyClient, requestHeaders);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLanguage, selectedClientId]);

  useEffect(() => {
    const fetchCashFlowData = async () => {
      try {
        setLoading(true);

        const requestBody = {
          Year: filters.year,
          Month: filters.month === 0 ? null : filters.month,
          Language: selectedLanguage,
          IdentificacionTercero: filters.third || null,
        };

        const requestHeaders = {
          "Content-Type": "application/json",
          "x-client-id": selectedClientId,
        };

        const response = await fetch(ENDPOINTS.CASH_BOX_HEADER, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Cash flow data fetch error: ${response.status}`);
        }

        const data = await response.json();
        setCashFlowData(data);
        setLabelData(data.meses || []);

        if (data.lineaFlujoCajas && data.lineaFlujoCajas.length > 0) {
          const subheaders = {};
          const tercerosMap = {};

          const fetchableCategories = data.lineaFlujoCajas.filter(
            (item) => item.tipo.includes("Entrada") || item.tipo.includes("Salida")
          );

          for (const category of fetchableCategories) {
            const subheaderBody = {
              Year: filters.year,
              Language: selectedLanguage,
              Tipo: category.tipo,
              IdentificacionTercero: filters.third,
              meses: data.meses,
            };

            const subheaderResponse = await fetch(ENDPOINTS.CASH_BOX_SUBHEADER, {
              method: "POST",
              headers: requestHeaders,
              body: JSON.stringify(subheaderBody),
            });

            if (subheaderResponse.ok) {
              const subheaderData = await subheaderResponse.json();
              const subCategories = subheaderData.lineaFlujoCajas || [];
              subheaders[category.tipo] = subCategories;

              for (const subCategory of subCategories) {
                if (subCategory.tipo) {
                  const terceroBody = {
                    Year: filters.year,
                    Language: selectedLanguage,
                    Tipo: category.tipo,
                    CodigoPosPre: subCategory.tipo,
                    IdentificacionTercero: filters.third,
                    meses: data.meses,
                  };

                  try {
                    const terceroResponse = await fetch(ENDPOINTS.CASH_BOX_THIRD, {
                      method: "POST",
                      headers: requestHeaders,
                      body: JSON.stringify(terceroBody),
                    });

                    if (terceroResponse.ok) {
                      const terceroData = await terceroResponse.json();
                      if (terceroData && terceroData.lineaFlujoCajaTerceros) {
                        tercerosMap[`${category.tipo}-${subCategory.tipo}`] =
                          terceroData.lineaFlujoCajaTerceros;
                      }
                    }
                  } catch (error) {
                    console.error(`Error fetching terceros for ${subCategory.tipo}:`, error);
                  }
                }
              }
            }
          }
          setSubheaderData(subheaders);
          setTerceroData(tercerosMap);
        }
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedLanguage && selectedClientId && filters.year) {
      fetchCashFlowData();
    }
  }, [filters, selectedLanguage, selectedClientId]);

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
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleGeneratePDF = async () => {
    if (typeof validateYear === "function" ? !validateYear() : !filters.year) {
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
      generateCashFlowPDF();

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
      console.error("Error al generar el PDF:", error);
      if (setSnackbarSeverity && setSnackbarMessage && setSnackbarOpen) {
        setSnackbarSeverity("error");
        setSnackbarMessage(
          selectedLanguage === "es" ? "Error al descargar el PDF" : "Error downloading PDF file"
        );
        setSnackbarOpen(true);
      }
    }
  };

  const generateCashFlowPDF = () => {
    if (!cashFlowData) {
      console.error("No cash flow data available to generate PDF.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const primaryBlue = [0, 83, 156];
    const secondaryBlue = [41, 128, 185];
    const lightGray = [245, 245, 245];
    const darkGray = [80, 80, 80];

    // Header section
    doc.setFillColor(...lightGray);
    doc.rect(0, 0, pageWidth, 65, "F");

    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, 8, 65, "F");

    doc.setFillColor(...secondaryBlue);
    doc.roundedRect(pageWidth - 60, 0, 60, 12, 0, 0, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...primaryBlue);
    doc.text(selectedLanguage === "es" ? "Flujo de Caja" : "Cash Flow", 20, 25);

    if (logoDataURL) {
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(pageWidth - 55, 14, 35, 18, 2, 2, "F");
      doc.addImage(logoDataURL, "JPEG", pageWidth - 52, 15, 30, 15);
    }

    doc.setFillColor(...secondaryBlue);
    doc.roundedRect(20, 28, 38, 14, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(filters.year.toString(), 32, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...darkGray);
    doc.text(
      selectedLanguage === "es"
        ? "Detalle de ingresos y egresos del período"
        : "Income and expenses detail for the period",
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

    if (filters.third) {
      doc.setFont("helvetica", "bold");
      doc.text(`${selectedLanguage === "es" ? "Tercero:" : "Third Party:"}`, leftPosition, 54);
      leftPosition += 35;
      doc.setFont("helvetica", "normal");
      doc.text(filters.third, leftPosition, 54);
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
    doc.text(selectedLanguage === "es" ? "Flujo de Efectivo" : "Cash Flow", 20, 82);

    const tableHeaders = labelData;
    let tableData = [];

    if (cashFlowData.lineaFlujoCajas && cashFlowData.lineaFlujoCajas.length > 0) {
      cashFlowData.lineaFlujoCajas.forEach((mainItem) => {
        const mainRow = [mainItem.showText];

        if (mainItem.data && mainItem.data.length > 0) {
          mainItem.data.forEach((dataItem) => {
            mainRow.push(formatCurrency(dataItem.value));
          });
        }

        tableData.push(mainRow);

        if (subheaderData[mainItem.tipo] && subheaderData[mainItem.tipo].length > 0) {
          subheaderData[mainItem.tipo].forEach((subItem) => {
            const subRow = [`   ${subItem.showText}`];

            if (subItem.data && subItem.data.length > 0) {
              subItem.data.forEach((dataItem) => {
                subRow.push(formatCurrency(dataItem.value));
              });
            }

            tableData.push(subRow);

            const tercerosKey = `${mainItem.tipo}-${subItem.tipo}`;
            const terceros = terceroData[tercerosKey];

            if (terceros && terceros.length > 0) {
              terceros.forEach((terceroItem) => {
                // Add tercero row with identification and name
                const terceroRow = [
                  `      ${terceroItem.identificacion} - ${terceroItem.nombreTercero}`,
                ];

                // Add values for each month
                if (terceroItem.data && terceroItem.data.length > 0) {
                  terceroItem.data.forEach((dataTercero) => {
                    terceroRow.push(formatCurrency(dataTercero.value));
                  });
                }

                tableData.push(terceroRow);
              });
            }
          });
        }
      });
    }

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

        if (
          rowData.includes("0. Balance Inicial") ||
          rowData === "1. Entradas" ||
          rowData === "2. Salidas" ||
          rowData.includes("3. Saldo Disponible")
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 242, 245];
          data.cell.styles.textColor = [50, 50, 50];
        }

        if (rowData.includes("3. Saldo Disponible")) {
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
      280
    );
    doc.text(`${selectedLanguage === "es" ? "Página" : "Page"} 1 / 2`, pageWidth - 20, 280, {
      align: "right",
    });

    if (filters.signature) {
      doc.addPage();

      doc.setFillColor(...lightGray);
      doc.rect(0, 0, pageWidth, 65, "F");
      doc.setFillColor(...primaryBlue);
      doc.rect(0, 0, 8, 65, "F");
      doc.setFillColor(...secondaryBlue);
      doc.roundedRect(pageWidth - 60, 0, 60, 12, 0, 0, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...primaryBlue);
      doc.text(selectedLanguage === "es" ? "Certificación" : "Certification", 20, 25);

      if (logoDataURL) {
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(pageWidth - 55, 14, 35, 18, 2, 2, "F");
        doc.addImage(logoDataURL, "JPEG", pageWidth - 52, 15, 30, 15);
      }

      doc.setDrawColor(...primaryBlue);
      doc.setLineWidth(0.5);
      doc.line(20, 68, pageWidth - 20, 68);

      doc.setFontSize(12);
      doc.setTextColor(...darkGray);
      doc.text(
        selectedLanguage === "es"
          ? "Los suscriptos, representante legal y contador CÓDIGO CAF S.A.S certifican que de acuerdo con el art 37 de la ley 222 de 1995 se han verificado previamente las afirmaciones contenidas en el presente Flujo de Caja"
          : "The undersigned, legal representative and accountant of CÓDIGO CAF S.A.S, certify that in accordance with article 37 of Law 222 of 1995, the statements contained in this Cash Flow Statement have been previously verified",
        20,
        90,
        { maxWidth: pageWidth - 40 }
      );

      doc.setFontSize(11);
      doc.text("Catalina Rodríguez Ramírez", 20, 130);
      doc.text("CC 1.152.440.535", 20, 137);
      doc.text(selectedLanguage === "es" ? "Representante Legal" : "Legal Representative", 20, 144);
      if (signatureManagerUrl) {
        doc.addImage(signatureManagerUrl, "JPEG", 20, 150, 40, 20);
      }

      doc.text("MARÍA PATRICIA FERNÁNDEZ GALEANO", pageWidth - 20, 130, {
        align: "right",
      });
      doc.text("TP-178399-1", pageWidth - 20, 137, { align: "right" });
      doc.text(selectedLanguage === "es" ? "Contadora" : "Accountant", pageWidth - 20, 144, {
        align: "right",
      });
      if (signatureReviewerUrl) {
        const firmaWidth = 40;
        const firmaXPosition = pageWidth - 20 - firmaWidth;
        doc.addImage(signatureReviewerUrl, "JPEG", firmaXPosition, 150, firmaWidth, 20);
      }

      doc.text("ANDERSON YEPES BEDOYA", pageWidth / 2, 190, { align: "center" });
      doc.text("TP-178399-1", pageWidth / 2, 197, { align: "center" });
      doc.text(
        selectedLanguage === "es" ? "Revisor Fiscal" : "Fiscal Auditor",
        pageWidth / 2,
        204,
        {
          align: "center",
        }
      );
      if (signatureAccountantUrl) {
        doc.addImage(signatureAccountantUrl, "JPEG", pageWidth / 2 - 20, 210, 40, 20);
      }

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `${
          selectedLanguage === "es"
            ? "Documento generado automáticamente"
            : "Document automatically generated"
        } - ${currentDate}`,
        20,
        280
      );
      doc.text(`${selectedLanguage === "es" ? "Página" : "Page"} 2 / 2`, pageWidth - 20, 280, {
        align: "right",
      });
    }

    const filename = `flujo_caja_${filters.year}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <MDButton
      variant="outlined"
      color="info"
      onClick={handleGeneratePDF}
      disabled={loading || !cashFlowData}
    >
      <Icon>picture_as_pdf</Icon>
      &nbsp;{selectedLanguage === "es" ? "Descargar PDF" : "Download PDF"}
    </MDButton>
  );
};

ButtonPDF.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    third: PropTypes.string,
    signature: PropTypes.bool,
  }).isRequired,
  validateYear: PropTypes.func,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

export default ButtonPDF;
