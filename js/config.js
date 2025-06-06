// CREATE PDF GENERATOR OBJECT
if (typeof PDF === "undefined") {
  var PDF = {};
}

const styles = {
  font: "centurygothic",
  fontStyle: "normal",
  textColor: "#39383a",
  headerFont: "centurygothic_bold",
  headerFontStyle: "bold",
  headerTextColor: "#fff",
  fontItalic: "centurygothic_italic",
  fontItalicStyle: "italic",
  h1: {
    font: "centurygothic_bold",
    fontSize: 22,
    fontStyle: "bold",
  },
  h2: {
    font: "centurygothic_bold",
    fontSize: 18,
    fontStyle: "bold",
  },
  h3: {
    font: "centurygothic_bold",
    fontSize: 16,
    fontStyle: "bold",
  },
  h4: {
    font: "centurygothic",
    fontSize: 14,
    fontStyle: "normal",
  },
  h5: {
    font: "centurygothic_bold",
    fontSize: 12,
    fontStyle: "bold",
  },
  h6: {
    font: "centurygothic_bold",
    fontSize: 10,
    fontStyle: "bold",
  },
  p: {
    font: "centurygothic",
    fontSize: 12,
    fontStyle: "normal",
  },
  box: {
    backgroundColor: "#dff0ef",
    headerBackgroundColor: "#4d838c",
    font: "centurygothic",
    headerTextColor: "#FFF",
    fontSize: 12,
    fontStyle: "normal",
    headerFontSize: 16,
  },
  goalSubbox: {
    backgroundColor: "#358584",
    font: "centurygothic",
    textColor: "#fff",
    fontSize: 10,
    fontStyle: "normal",
  },
  sectionBox: {
    backgroundColor: "#fff",
    headerBackgroundColor: "#e7e7e7",
    font: "centurygothic",
    textColor: "#000",
    fontSize: 12,
    fontStyle: "normal",
  },
  prioritiesSection: {
    headerColor: "#94d3d1", // dark blue
    headerTextColor: "#fff", // white
    bodyTextColor: "#333", // dark gray
    headerFontSize: 14,
    fontSizeBody: 10,
  },
  riskKey: {
    low: "#2dc26b",
    medium: "#f1c40f",
    high: "#e03e2d",
    unknown: "#b96ad9",
  },
  summaryTable: {
    headerFontSize: 16,
    headerBackgroundColor: "#d6dada",
    font: "centurygothic",
    fontStyle: "normal",
    oddBackgroundColor: "#f2f3f3",
    evenBackgroundColor: "#f9f9f9",
  },
};

PDF.post = function (action, pdfData, record_id, name) {
  console.log("Posting PDF data to server...");

  // Use AJAX instead of form submission to prevent reloading of survey page
  $.ajax({
    type: "POST",
    url: window.location.href,
    data: {
      action: action,
      pdfData: pdfData,
      record_id: record_id,
      name: name,
    },
    success: function () {
      console.log("PDF successfully saved to server");
    },
    error: function (error) {
      console.error("Error saving PDF:", error);
    },
  });
};

PDF.addEventHandlers = function (imageUrls) {
  console.log("Image Urls:", imageUrls);
  PDF.imageUrls = imageUrls || [];
  // Handle the ADD button
  $(".generate-pdf").on("click", function () {
    var record_id = $(this).attr("data-record-id");
    var name = $(this).attr("data-name");

    PDF.generatePDF(record_id, name);
  });

  // Auto-generate PDF when document is ready
  $(document).ready(function () {
    if (
      typeof PDF_RECORD_ID !== "undefined" &&
      typeof PDF_NAME !== "undefined"
    ) {
      console.log("Auto-generating PDF on page load");
      PDF.generatePDF(PDF_RECORD_ID, PDF_NAME);
    }
  });
};

PDF.generatePDF = async function (record_id, name) {
  // Default export is a4 paper, portrait, using millimeters for units
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const startingX = 5; // Starting X coordinate
  const startingY = 10; // Starting Y coordinate
  let coordinates = [startingX, startingY];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add header image
  coordinates = createHeaderImage(doc, coordinates, pageWidth);

  coordinates = createHeader(
    doc,
    "Thank you for completing your WellU Health Risk Assessment.",
    coordinates,
    "h3",
    10,
    "bold"
  );
  coordinates = createHeader(
    doc,
    "You’ve taken an important step in minimizing health risks. Below, you’ll find a personalized WellU action plan to help you achieve your health goals.",
    coordinates,
    "h4",
    10
  );

  coordinates[1] += 3; // Add some space after the header

  coordinates = createHeader(
    doc,
    "Click on any of the icons to get started!",
    coordinates,
    "h4",
    10,
    "bold"
  );

  coordinates[1] -= 5; // Add some space after the header

  coordinates = [startingX, coordinates[1]];
  const boxX = coordinates[0];
  const boxY = coordinates[1];
  const boxWidth = 45; // Width of the box
  const boxHeight = 40; // Height of the box

  coordinates = createGoalBox(
    doc,
    "??",
    "A1c",
    coordinates,
    boxWidth,
    boxHeight
  );

  coordinates = createGoalBox(
    doc,
    "??",
    "Depression",
    [coordinates[0] + boxWidth + 5, boxY],
    boxWidth,
    boxHeight
  );

  coordinates = createGoalBox(
    doc,
    "7-9 hours per night",
    "Allergies",
    [coordinates[0] + boxWidth + 5, boxY],
    boxWidth,
    boxHeight
  );

  coordinates = createGoalBox(
    doc,
    "150-300+ minutes per week",
    "Cancer",
    [coordinates[0] + boxWidth + 5, boxY],
    boxWidth,
    boxHeight
  );

  coordinates[0] = startingX; // Reset X coordinate for next section
  coordinates[1] -= 12;
  const subboxHeight = 16;

  coordinates = createGoalSubbox(
    doc,
    "Find a Diabetes Prevention Program cohort.",
    coordinates,
    boxWidth,
    subboxHeight,
    "https://en.wikipedia.org/wiki/Main_Page"
  );

  coordinates = createGoalSubbox(
    doc,
    "Engage with the Employee Assistance Program.",
    coordinates,
    boxWidth,
    subboxHeight,
    "https://en.wikipedia.org/wiki/Main_Page"
  );

  coordinates = createGoalSubbox(
    doc,
    "Enroll in a CBT program for insomnia.",
    coordinates,
    boxWidth,
    subboxHeight,
    "https://en.wikipedia.org/wiki/Main_Page"
  );

  coordinates = createGoalSubbox(
    doc,
    "Schedule your Personal Training Appointment​.",
    coordinates,
    boxWidth,
    subboxHeight,
    "https://en.wikipedia.org/wiki/Main_Page"
  );

  coordinates[0] = startingX; // Reset X coordinate for next section
  coordinates[1] += 22; // Move down for the next section
  doc.setTextColor(styles.textColor);

  coordinates = createTailoredCareSection(doc, coordinates, pageWidth);

  coordinates[0] = startingX; // Reset X coordinate for next section
  coordinates[1] -= 4; // Move down for the next section
  coordinates = createHeader(
    doc,
    "Results at a Glance",
    coordinates,
    "h3",
    10,
    "bold"
  );

  const summaryTableYCoordinates = coordinates[1];

  // coordinates[1] -= 5; // Move down for the next section
  coordinates = createMetricBox(doc, 29, "BMI", coordinates);
  coordinates = createMetricBox(doc, "<5.7", "A1C", coordinates);
  coordinates = createMetricBox(doc, "2", "GAD-7", coordinates);
  coordinates = createMetricBox(doc, "3", "PHQ-9", coordinates);
  coordinates = createMetricBox(doc, "0", "Audit-C", coordinates);

  const labels = [
    "Primary Care Provider",
    "Diabetes",
    "Fast Food / Snacks",
    "Fruit & Vegetable Intake",
    "Sugar Sweetened Beverages",
    "Physical Activity",
    "Stress",
    "Sleepiness",
    "Tabacco / Nicotine Use",
    "Drug Use",
    "General Health",
  ];
  const recommendations = [
    "Yes",
    "No History",
    "Less than 1",
    "1.5-2 cups fruit\n2-3 cups vegetable",
    "Limit intake",
    "Minimum: 150 minutes/week\nOptimal Health: 300+ minutes/week",
    "Less than 5",
    "Never/Rarely Sleepy",
    "No",
    "Never",
    "Good to Excellent",
  ];
  const individualData = [
    "No",
    "No History",
    "3",
    "2",
    "1",
    "1",
    "100",
    "5=moderate",
    "Sometimes",
    "No",
    "Never",
    "Very Good",
  ];
  const riskKeys = [
    "low",
    "medium",
    "high",
    "unknown",
    "low",
    "medium",
    "high",
    "unknown",
    "low",
    "medium",
    "high",
    "unknown",
  ];

  coordinates[0] += 30;
  coordinates[1] = summaryTableYCoordinates - 5;

  coordinates = summaryTable(
    doc,
    "Summary Table",
    labels,
    recommendations,
    individualData,
    riskKeys,
    coordinates,
    pageWidth - 40
  );

  doc.addPage();
  coordinates = [startingX, startingY];

  // Add header image
  coordinates = createHeaderImage(doc, coordinates, pageWidth);

  coordinates = createHeader(
    doc,
    "To learn more about your priority health areas, what the guidelines are, and",
    coordinates,
    "h4",
    10
  );
  coordinates[1] -= 5; // Adjust for spacing
  coordinates = createHeader(
    doc,
    "how making small changes can improve your health, read the information",
    coordinates,
    "h4",
    10
  );
  coordinates[1] -= 5; // Adjust for spacing
  coordinates = createHeader(doc, "below.", coordinates, "h4", 10);

  coordinates = createPrioritiesSectionBox(
    doc,
    "Your Priorities",
    coordinates,
    pageWidth - 10,
    100
  );

  try {
    // Generate PDF data first - this will work even if browser preview fails
    const pdfData = doc.output("datauristring");

    // Save the PDF to the server first (this is reliable)
    PDF.post("generate_pdf", pdfData, record_id, name);

    // Then try to open in a new window - if this fails, we've already saved the PDF
    // Use a setTimeout to allow the save operation to complete first
    setTimeout(() => {
      try {
        const pdfBlob = doc.output("blob");
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, "_blank");
      } catch (e) {
        console.error("Error opening PDF preview: ", e);
        alert(
          "PDF has been generated and saved. You can access it from your records."
        );
      }
    }, 100);
  } catch (e) {
    console.error("Error in PDF generation: ", e);
  }
};

const createHeaderImage = function (doc, coordinates, width) {
  const headerImage = PDF.imageUrls[1]; // Assuming the first image is the header
  if (headerImage) {
    doc.addImage(headerImage, "PNG", 0, 0, width, 40);
    coordinates[1] += 38; // Move down after header
  }
  return coordinates;
};

const createHeader = function (
  doc,
  title,
  coordinates,
  headerType = "h1",
  coordinateHeight = 10,
  headerFontStyle = "normal"
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth;

  title = doc.splitTextToSize(title, maxWidth);
  const headerStyles = styles[headerType];
  doc.setTextColor(styles.textColor);
  doc.setFontSize(headerStyles.fontSize);
  const font = headerFontStyle == "bold" ? styles.headerFont : styles.font;
  doc.setFont(font, headerFontStyle);
  doc.text(title, pageWidth / 2, coordinates[1], { align: "center" });
  coordinates[1] += coordinateHeight;
  return coordinates;
};

const createText = function (doc, text, coordinates, coordinateHeight = 6) {
  text = doc.splitTextToSize(text, 200);
  doc.setTextColor(styles.textColor);
  doc.setFontSize(styles.p.fontSize);
  doc.setFont(styles.font, styles.p.fontStyle);
  doc.text(text, coordinates[0], coordinates[1]);
  coordinates[1] += coordinateHeight * text.length;
  return coordinates;
};

const createBullet = function (doc, text, coordinates, coordinateHeight = 6) {
  text = doc.splitTextToSize("\u2022 " + text, 180);
  doc.setTextColor(styles.textColor);
  doc.setFontSize(styles.p.fontSize);
  doc.setFont(styles.font, styles.p.fontStyle);
  doc.text(text, coordinates[0] + 5, coordinates[1]);
  coordinates[1] += coordinateHeight * text.length;
  return coordinates;
};

const createGoalBox = function (doc, text, header, coordinates, width, height) {
  const headerHeight = 12; // Height for the header
  doc.setFillColor(styles.box.headerBackgroundColor);
  doc.rect(coordinates[0], coordinates[1], width, headerHeight, "F");
  doc.setFillColor(styles.box.backgroundColor);
  doc.rect(
    coordinates[0],
    coordinates[1] + headerHeight,
    width,
    height - headerHeight,
    "F"
  );

  // Add header to the box
  const textX = coordinates[0];
  const headerText = doc.splitTextToSize(header, width - 8);
  doc.setTextColor(styles.box.headerTextColor);
  doc.setFontSize(styles.box.headerFontSize);
  doc.setFont(styles.box.font, styles.box.fontStyle);
  doc.text(headerText, textX + width / 2, coordinates[1] + 8, {
    align: "center",
  });
  coordinates[1] += headerHeight; // Move down for the text

  const img = PDF.imageUrls[0];
  const imgX = coordinates[0] + width / 2 - 10; // Center image
  const imgY = coordinates[1] + 3;
  doc.addImage(img, "PNG", imgX, imgY, 20, 20);

  coordinates[1] += height;
  return coordinates;
};

const createGoalSubbox = function (doc, text, coordinates, width, height, url) {
  // Set the outline color to match the background color that was previously used
  doc.setDrawColor(styles.goalSubbox.backgroundColor);
  doc.setLineWidth(1); // Set border thickness

  // Draw a rectangle with an outline but no fill ('S' instead of 'F')
  doc.rect(coordinates[0] + 0.5, coordinates[1], width - 1, height, "S");

  // Split text for wrapping
  let splitText = doc.splitTextToSize(text, width - 1);
  if (splitText.length > 3) splitText = doc.splitTextToSize(text, width);
  // Add link if URL is provided
  // Add text to the subbox
  doc.setTextColor(styles.textColor);
  doc.setFontSize(styles.goalSubbox.fontSize);
  doc.setFont(styles.goalSubbox.font, styles.goalSubbox.fontStyle);
  doc.textWithLink(
    splitText,
    coordinates[0] + width / 2,
    coordinates[1] + 5.33,
    {
      align: "center",
      url: url,
    }
  );
  coordinates[0] += width + 5; // Move right for the next box

  return coordinates;
};

const createMetricBox = function (doc, metric, label, coordinates, width = 25) {
  // Box settings
  const boxHeight = 15;
  const boxRadius = 3;
  const backgroundColor = "#B5CFD1"; // Light blue background color
  const metricColor = "#FFFFFF"; // White text color for metric
  const labelColor = "#333333"; // Dark gray text color for label

  // Save the original x coordinate to return to later
  const originalX = coordinates[0];

  // Draw rounded rectangle with light blue background
  doc.setFillColor(backgroundColor);
  doc.roundedRect(
    coordinates[0],
    coordinates[1],
    width,
    boxHeight,
    boxRadius,
    boxRadius,
    "F"
  );

  // Add the metric number
  doc.setFont(styles.font, styles.fontStyle);
  doc.setFontSize(26);
  doc.setTextColor(metricColor);
  doc.text(
    metric.toString(),
    coordinates[0] + width / 2,
    coordinates[1] + boxHeight / 2,
    {
      align: "center",
      baseline: "middle",
    }
  );

  // Add the label below the box
  doc.setFont(styles.font, styles.fontStyle);
  doc.setFontSize(14);
  doc.setTextColor(labelColor);
  doc.text(label, coordinates[0] + width / 2, coordinates[1] + boxHeight + 7, {
    align: "center",
  });

  // Move coordinates down past the label for next element
  coordinates[1] += boxHeight + 10;
  coordinates[0] = originalX;

  return coordinates;
};

const createGridSectionBox = function (
  doc,
  text,
  header,
  coordinates,
  width,
  height
) {
  const headerHeight = 8; // Height for the header
  doc.setFillColor(styles.sectionBox.headerBackgroundColor);
  doc.rect(coordinates[0], coordinates[1], width, headerHeight, "F");

  // Add header to the box
  const textX = coordinates[0] + 4;
  const headerText = doc.splitTextToSize(header, width - 8);
  doc.setTextColor(styles.textColor);
  doc.setFontSize(styles.sectionBox.fontSize);
  doc.setFont(styles.sectionBox.font, styles.sectionBox.fontStyle);
  doc.text(headerText, textX, coordinates[1] + 5.33);
  coordinates[1] += headerHeight; // Move down for the text

  const gridX = coordinates[0];
  const gridY = coordinates[1]; // 10pt gap
  const cols = 4;
  const rows = 2;
  const gridW = width;
  const gridH = height; // total height for two rows
  const cellW = gridW / cols;
  const cellH = gridH / rows;

  // draw outer box
  doc.setDrawColor(styles.sectionBox.headerBackgroundColor);
  doc.rect(gridX, gridY, gridW, gridH);

  // draw vertical lines
  for (let c = 1; c < cols; c++) {
    const x = gridX + cellW * c;
    doc.line(x, gridY, x, gridY + gridH);
  }

  // draw horizontal line
  const yMid = gridY + cellH;
  doc.line(gridX, yMid, gridX + gridW, yMid);

  // --- 3) Fill in each cell with a label and a value ---
  // doc.setFontColor(styles.sectionBox.textColor);
  const labels = [
    ["Height", "Weight", "BMI", "Waist"],
    ["Cholesterol", "HDL", "LDL", "Triglycerides"],
  ];
  const values = [
    ["5'11\"", "160", "23", null],
    ["160", "55", "150", "130"],
  ];
  const units = [
    ["", "lbs", "kg/m²", "inches"],
    ["mg/dL", "mg/dL", "mg/dL", "mg/dL"],
  ];

  const valueColor = "#6195CF";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xCenter = gridX + c * cellW + cellW / 2;
      const yTop = gridY + r * cellH + 20;

      // label
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(styles.textColor);
      doc.text(labels[r][c], xCenter, yTop, { align: "center" });

      // value
      doc.setTextColor(valueColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      let valueText = values[r][c]
        ? `${values[r][c]} ${units[r][c] || ""}`.trim()
        : "?";
      doc.text(valueText, xCenter, yTop + 18, { align: "center" });
    }
  }

  coordinates[1] += height;
  return coordinates;
};

const createPrioritiesSectionBox = function (
  doc,
  header,
  coordinates,
  width,
  height
) {
  coordinates[1] = createSubsection(
    doc,
    "Hemoglobin A1c",
    [
      {
        type: "paragraph",
        text: "Tangible information about guidelines and diabetes prevention.",
      },
      {
        type: "bullet",
        text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        type: "bullet",
        text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      },
    ],
    [coordinates[0], coordinates[1] + 10],
    width,
    height
  );

  coordinates[1] = createSubsection(
    doc,
    "Depression",
    [
      {
        type: "paragraph",
        text: "Tangible information about guidelines and diabetes prevention.",
      },
      {
        type: "bullet",
        text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        type: "bullet",
        text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      },
    ],
    [coordinates[0], coordinates[1]],
    width,
    height
  );
  coordinates[1] = createSubsection(
    doc,
    "Allergies",
    [
      {
        type: "paragraph",
        text: "Tangible information about guidelines and diabetes prevention.",
      },
      {
        type: "bullet",
        text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        type: "bullet",
        text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      },
    ],
    [coordinates[0], coordinates[1]],
    width,
    height
  );

  return coordinates;
};

const createSubsection = function (
  doc,
  header,
  content,
  coordinates,
  width,
  height
) {
  const headerH = 10;
  const badgeW = 10;
  const headerColor = styles.prioritiesSection.headerColor; // dark blue
  const headerTextColor = styles.prioritiesSection.headerTextColor; // white
  const bodyTextColor = styles.prioritiesSection.bodyTextColor; // dark gray
  const fontSizeBody = styles.prioritiesSection.fontSizeBody;
  const lineHeight = fontSizeBody * 1.2;
  let x = coordinates[0];
  let y = coordinates[1];
  const w = width;

  // ——— Header bar ———
  doc.setFillColor(headerColor);
  doc.rect(x, y, w, headerH, "F");
  doc.setFont(styles.headerFont, styles.headerFontStyle);
  doc.setTextColor(headerTextColor);
  doc.setFontSize(styles.prioritiesSection.headerFontSize);
  doc.text(header, x + 2, y + headerH / 2 + 2);

  // ——— Content ———
  let cursorY = y + headerH + 6;
  doc.setFont(styles.font, styles.fontStyle);
  doc.setFontSize(12);
  doc.setTextColor(bodyTextColor);

  content.forEach((item) => {
    if (item.type === "paragraph") {
      // wrap text within width
      const lines = doc.splitTextToSize(item.text, w);
      doc.text(lines, x, cursorY);
      cursorY += lines.length * lineHeight;
    } else if (item.type === "bullet") {
      let ignoredX;
      [ignoredX, cursorY] = createBullet(
        doc,
        item.text,
        [x, cursorY],
        lineHeight
      );
    }
  });

  return cursorY;
};

const drawRiskBox = function (doc, riskKey, x, y, height) {
  const boxWidth = 40;
  const boxHeight = 4;

  const color = styles.riskKey[riskKey]; // Default to unknown if riskKey is not defined
  doc.setFillColor(color);
  doc.rect(x, y + height / 4, boxWidth, boxHeight, "F");
};

const summaryTable = function (
  doc,
  title,
  labels,
  referenceRange,
  individualData,
  riskKeys,
  coordinates,
  width
) {
  let originX = coordinates[0];
  let originY = coordinates[1];
  const minRowHeight = 10; // Minimum row height
  const cellPadding = 1;
  const headerHeight = 12;

  const fillColor = "#adcbd0";

  // Draw table header
  doc.setFillColor(fillColor);
  doc.rect(originX, originY, width, headerHeight, "F");

  // Header text (white)
  doc.setFont(styles.font, styles.fontStyle);
  doc.setFontSize(12);
  doc.setTextColor("#FFFFFF");

  // Draw headers
  doc.text("Category", originX + width / 8, originY + headerHeight / 2 + 1, {
    align: "center",
  });
  doc.text(
    "Recommendation",
    originX + (3 * width) / 8,
    originY + headerHeight / 2 + 1,
    { align: "center" }
  );
  doc.text(
    "Your Score",
    originX + (5 * width) / 8,
    originY + headerHeight / 2 + 1,
    { align: "center" }
  );
  doc.text(
    "Health Risk",
    originX + (7 * width) / 8,
    originY + headerHeight / 2 + 1,
    { align: "center" }
  );

  // Store current Y position after header
  let currentY = originY + headerHeight;

  // Calculate row heights in advance
  const rowHeights = [];
  for (let i = 0; i < labels.length; i++) {
    // Split text to calculate height needed
    const labelLines = doc.splitTextToSize(
      labels[i],
      width / 4 - cellPadding * 2
    );
    const refLines = doc.splitTextToSize(
      referenceRange[i],
      width / 4 - cellPadding * 2
    );
    const dataLines = doc.splitTextToSize(
      individualData[i],
      width / 4 - cellPadding * 2
    );

    // Find maximum number of lines in any column
    const maxLines = Math.max(
      labelLines.length,
      refLines.length,
      dataLines.length
    );

    // Calculate needed height (minimum 10)
    const rowHeight = Math.max(minRowHeight, maxLines * 4.5);
    rowHeights.push(rowHeight);
  }

  // Draw data rows
  for (let i = 0; i < labels.length; i++) {
    const rowHeight = rowHeights[i];
    doc.setLineWidth(0.1);

    // Add horizontal line at the bottom of each row
    doc.line(
      originX,
      currentY + rowHeight,
      originX + width,
      currentY + rowHeight
    );

    // Reset text color
    doc.setTextColor("#333333");
    doc.setFontSize(10);

    // Split text into lines to handle wrapping
    const labelLines = doc.splitTextToSize(
      labels[i],
      width / 4 - cellPadding * 2
    );
    const refLines = doc.splitTextToSize(
      referenceRange[i],
      width / 4 - cellPadding * 2
    );
    const dataLines = doc.splitTextToSize(
      individualData[i],
      width / 4 - cellPadding * 2
    );

    // Center text vertically in the row
    let labelY = currentY + rowHeight / 2;
    let refY = currentY + rowHeight / 2;
    let dataY = currentY + rowHeight / 2;
    labelY += labelLines.length === 1 ? 2 : -2 * labelLines.length + 3;
    refY += refLines.length === 1 ? 2 : -2 * refLines.length + 3;
    dataY += dataLines.length === 1 ? 2 : -2 * dataLines.length + 3;

    // Draw text content for this row
    doc.text(labelLines, originX + width / 8, labelY, { align: "center" });
    doc.text(refLines, originX + (3 * width) / 8, refY, {
      align: "center",
    });
    doc.text(dataLines, originX + (5 * width) / 8, dataY, {
      align: "center",
    });

    // Draw risk box
    const riskKey = riskKeys[i].toLowerCase();
    const riskBoxY = currentY + 1;
    const riskBoxX = originX + (3 * width) / 4 + cellPadding;
    drawRiskBox(doc, riskKey, riskBoxX, riskBoxY, rowHeight);

    // Move to next row
    currentY += rowHeight;
  }

  // Add outer border to the whole table
  doc.setDrawColor(fillColor);
  doc.setLineWidth(0.3);
  doc.rect(originX, originY, width, currentY - originY, "S");

  // Update coordinates for the next element
  // coordinates[1] = currentY + 10;
  return coordinates;
};

const createTailoredCareSection = function (doc, coordinates, width) {
  const sectionHeight = 14;
  const backgroundColor = "#BBBBBB"; // Light gray background
  const sectionX = coordinates[0];
  const sectionY = coordinates[1];

  // Create gray background rectangle
  doc.setFillColor(backgroundColor);
  doc.rect(0, sectionY, width, sectionHeight, "F");

  // Add left side title text
  doc.setFont(styles.headerFont, styles.headerFontStyle);
  doc.setTextColor("#FFFFFF"); // White text
  doc.setFontSize(16);
  doc.text(
    "You qualified for a tailored care pathway:",
    sectionX + 10,
    sectionY + 9
  );
  // Add enrollment button
  doc.setFillColor("#FFFFFF");
  doc.roundedRect(sectionX + width / 2 + 20, sectionY + 2, 60, 10, 3, 3, "F");

  // Add enrollment link
  doc.setTextColor("#990000"); // Dark red text
  doc.setFont(styles.font, styles.fontStyle);
  doc.textWithLink(
    "Click here to enroll!",
    sectionX + width / 2 + 50,
    sectionY + 9,
    {
      align: "center",
      url: "https://example.com/enroll",
    }
  );

  // Update Y coordinate for elements after this section
  coordinates[1] += sectionHeight + 10;

  return coordinates;
};
