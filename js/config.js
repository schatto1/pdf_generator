// CREATE PDF GENERATOR OBJECT
if (typeof PDF === "undefined") {
  var PDF = {};
}

const choiceToText = {
  sleepy_day: {
    1: "Never",
    2: "Rarely",
    3: "Sometimes",
    4: "Often",
    5: "Always",
  },
  general_health: {
    1: "Excellent",
    2: "Very Good",
    3: "Good",
    4: "Fair",
    5: "Poor",
  },
};

const imageToIndex = {
  "a1c.png": 0,
  "alcohol.png": 1,
  "anxiety.png": 2,
  "depression.png": 4,
  "diabetes.png": 5,
  "drug_use.png": 6,
  "fast_food.png": 7,
  "fruit_and_vegetable.png": 8,
  "general_health.png": 9,
  "header.png": 10,
  "movement.png": 11,
  "physical_activity.png": 12,
  "primary_care_provider.png": 13,
  "sleep.png": 14,
  "stress.png": 15,
  "sugary_beverages.png": 16,
  "tobacco.png": 17,
};

const styles = {
  font: "centurygothic",
  fontStyle: "normal",
  textColor: "#39383a",
  headerFont: "centurygothic_bold",
  headerFontStyle: "bold",
  headerTextColor: "#fff",
  fontItalic: "centurygothic_italic",
  fontItalicStyle: "italic",
  linkTextColor: "#0000EE",
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
    headerColor: "#4d838c", // dark blue
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

PDF.addEventHandlers = function (
  record,
  imageUrls,
  goalsContent,
  processedData,
  tcpLink
) {
  PDF.imageUrls = imageUrls || [];
  PDF.goalsContent = goalsContent || {};
  PDF.record = record || {};
  PDF.logicRecord = record.filter(r => r.redcap_event_name === "fy_202627_arm_1" && r.redcap_repeat_instrument === ""&& r.affirmative === "1")[0] || {};
  PDF.processedData = processedData || {};
  PDF.tcpLink = tcpLink || {};
  // TODO: If SDOH survey responses feed a bottom-of-PDF section, expect them to come
  // through this same goalsContent payload from getPdfContent() rather than as a
  // separate data source.
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
  const record = PDF.logicRecord;

  // Year 2 requirement: hide the tailored care callout for now, but keep the
  // original qualification logic here for easy restoration in year 3.
  
  // const qualifiedTCP =
  //   record.bmi >= 35 ||
  //   (record.bmi >= 30 &&
  //     (record.prev_diags___5 == 1 ||
  //       record.prev_diags___6 == 1 ||
  //       record.prev_diags___7 == 1 ||
  //       record.prev_diags___8 == 1 ||
  //       record.prev_diags___9 == 1)) ||
  //   record.prev_diags___1 == 1 ||
  //   record.prev_diags___2 == 1 ||
  //   record.prev_diags___3 == 1 ||
  //   record.gad_total >= 10 ||
  //   record.phq9_total_score >= 10 ||
  //   record.drug_rx_nonmed == 2 ||
  //   record.drinks_occasion >= 2 ||
  //   (record.prev_diags___4 == 1 &&
  //     record.a1c_12m == 1 &&
  //     record.recent_a1c > 0);
  const qualifiedTCP = false;

  console.log("Qualified for TCP: ", qualifiedTCP);

  const extraPadding = !qualifiedTCP ? 5 : 0;

  const startingX = 5; // Starting X coordinate
  const startingY = 10; // Starting Y coordinate
  let coordinates = [startingX, startingY];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add header image
  coordinates = createHeaderImage(doc, coordinates, pageWidth);

  coordinates = createHeader(
    doc,
    "Your WellU Action Plan",
    coordinates,
    "h3",
    10,
    "bold"
  );
  coordinates[1] += extraPadding;
  coordinates = createHeader(
    doc,
    "Resource recommendations tailored to your HRA responses, wellness goals, and\nOsher Center guidance to help you take the next step toward better health.",
    coordinates,
    "h4",
    10
  );

  coordinates[1] += 3 + extraPadding;

  coordinates = createHeader(
    doc,
    "Click on any of the icons to get started!",
    coordinates,
    "h4",
    10,
    "bold"
  );

  coordinates[1] -= 5 + extraPadding;

  coordinates = [startingX, coordinates[1]];
  const boxX = coordinates[0];
  const boxY = coordinates[1] + extraPadding;
  const boxWidth = 46; // Width of the box
  const boxHeight = 35; // Height of the box
  const subboxHeight = 16;

  // TODO: If the top priority set changes, update this tile loop and layout so the
  // icon row matches the new combined/renamed priorities coming from processPriorities().
  for (let i = 0; i < 4; i++) {
    coordinates = createGoalBox(
      doc,
      PDF.processedData[i],
      [boxX + i * (boxWidth + 5), boxY],
      boxWidth,
      boxHeight
    );
    coordinates = createGoalSubbox(
      doc,
      PDF.processedData[i],
      [boxX + i * (boxWidth + 5), boxY + boxHeight],
      boxWidth,
      subboxHeight
    );
  }

  coordinates[0] = startingX; // Reset X coordinate for next section
  coordinates[1] += 20 + extraPadding; // Move down for the next section
  doc.setTextColor(styles.textColor);

  console.log("Rendering section for tailored care pathway");

  if (qualifiedTCP) {
    coordinates = createTailoredCareSection(doc, coordinates, pageWidth);
  } else {
    coordinates[1] += extraPadding;
  }

  coordinates[0] = startingX; // Reset X coordinate for next section
  coordinates[1] -= 3; // Move down for the next section
  coordinates = createHeader(
    doc,
    "Results at a Glance",
    coordinates,
    "h3",
    10,
    "bold"
  );

  const summaryTableYCoordinates = coordinates[1] + extraPadding;

  const riskLevelsBubbles = calculateRiskKeyBubbles();

  coordinates[1] -= 6; // Move down for the next section
  coordinates = createMetricBox(
    doc,
    calculateA1CValue(),
    "A1C",
    coordinates,
    riskLevelsBubbles[0]
  );
  coordinates = createMetricBox(
    doc,
    PDF.logicRecord.alc_total,
    "Alcohol Screening",
    coordinates,
    riskLevelsBubbles[1]
  );
  coordinates = createMetricBox(
    doc,
    "",
    "Anxiety Screening",
    coordinates,
    riskLevelsBubbles[2]
  );
  coordinates = createMetricBox(
    doc,
    "",
    "Depression Screening",
    coordinates,
    riskLevelsBubbles[3]
  );
  coordinates = createMetricBox(
    doc,
    PDF.logicRecord.bmi,
    "BMI",
    coordinates,
    riskLevelsBubbles[4]
  );

  const labels = [
    "Primary Care Provider",
    "Diabetes",
    "Fast Food / Snacks",
    "Fruit & Vegetable Intake",
    "Sugar Sweetened Beverages",
    "Physical Activity",
    "Stress",
    "Sleepiness",
    "Tobacco / Nicotine Use",
    "Drug Use",
    "General Health",
  ];
  const recommendations = [
    "Yes",
    "--",
    "Less than 1",
    "1.5-2 cups fruit\n2-3 cups vegetable",
    "Limit intake",
    "Min: 150 min/wk\nOptimal: 300+ min/wk",
    "Less than 5",
    "Never/Rarely Sleepy",
    "No",
    "Never",
    "Good to Excellent",
  ];
  const individualData = calculateIndividualData();
  const riskKeysTable = calculateRiskKeysTable();

  coordinates[0] += 30;
  coordinates[1] = summaryTableYCoordinates - 6;

  coordinates = summaryTable(
    doc,
    "Summary Table",
    labels,
    recommendations,
    individualData,
    riskKeysTable,
    coordinates,
    pageWidth - 40
  );

  doc.addPage();
  coordinates = [startingX, startingY];

  // Add header image
  coordinates = createHeaderImage(doc, coordinates, pageWidth);

  coordinates = createHeader(
    doc,
    "Take a moment to explore your full action plan below.",
    coordinates,
    "h4",
    10
  );
  coordinates = createHeader(
    doc,
    "As an employee, you have access to a wide range of health resources - click the\nlinks to learn more or get started.",
    coordinates,
    "h4",
    10
  );

  // TODO: Keep this detailed-section render flow aligned with any combined or renamed
  // priorities so the lower PDF content matches the top icon tiles.
  for (var key in PDF.goalsContent) {
    var heading = PDF.goalsContent[key].label || "Goal";
    var content = PDF.goalsContent[key].full || [];
    let url = PDF.goalsContent[key].link || "";

    const estimatedSectionLength = estimateSectionLength(doc, content);

    if (coordinates[1] + estimatedSectionLength >= pageHeight) {
      doc.addPage();
      coordinates = [startingX, startingY];

      // Add header image
      coordinates = createHeaderImage(doc, coordinates, pageWidth);
    }

    coordinates[1] = createSubsection(
      doc,
      heading,
      content,
      [coordinates[0], coordinates[1]],
      pageWidth - 10,
      url
    );
  }

  // TODO: Render SDOH content here from PDF.goalsContent after getPdfContent() starts
  // including it, so the bottom-of-PDF section is driven by the same data source and
  // rendering flow as the rest of the action-plan sections.

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
  const headerImage = PDF.imageUrls[imageToIndex["header.png"]];
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
  if (text.length > 1) {
    coordinates[1] += text.length * 6;
  } else {
    coordinates[1] += text.length * coordinateHeight;
  }
  return coordinates;
};

const createGoalBox = function (doc, goal, coordinates, width, height) {
  const headerHeight = 14; // Height for the header
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
  const headerText = doc.splitTextToSize(goal.label, width - 2);
  doc.setTextColor(styles.box.headerTextColor);
  doc.setFont(styles.box.font, styles.box.fontStyle);
  const yCoord =
    headerText.length > 1 ? coordinates[1] + 6 : coordinates[1] + 9;
  doc.setFontSize(headerText.length > 1 ? 14 : styles.box.headerFontSize);
  doc.text(headerText, textX + width / 2, yCoord, {
    align: "center",
  });
  coordinates[1] += headerHeight; // Move down for the text

  const img = PDF.imageUrls[imageToIndex[goal.image]];
  const imgX = coordinates[0] + width / 2 - 10; // Center image
  const imgY = coordinates[1] + 1.5;
  const imgW = 18;
  const imgH = 18;
  doc.addImage(img, "PNG", imgX, imgY, imgW, imgH);

  // TODO: Retrieve the URL from the goal object
  const url = PDF.goalsContent[goal.lookup_content]?.link || null;
  if (url) {
    doc.link(imgX, imgY, imgW, imgH, { url: url });
  }

  coordinates[1] += height;
  return coordinates;
};

const createGoalSubbox = function (doc, goal, coordinates, width, height) {
  // Set the outline color to match the background color that was previously used
  doc.setDrawColor(styles.goalSubbox.backgroundColor);
  doc.setLineWidth(1); // Set border thickness

  // Draw a rectangle with an outline but no fill ('S' instead of 'F')
  doc.rect(coordinates[0] + 0.5, coordinates[1], width - 1, height, "S");

  // Set text color and font
  doc.setTextColor("#000000");
  doc.setFontSize(styles.goalSubbox.fontSize);
  doc.setFont(styles.goalSubbox.font, styles.goalSubbox.fontStyle);
  // Split text for wrapping
  const text =
    PDF.goalsContent[goal.lookup_content]?.pdf_box ||
    "You chose no action today. We're here when you're ready.";
  let splitText = doc.splitTextToSize(text, width - 1);
  if (splitText.length > 3) splitText = doc.splitTextToSize(text, width);
  doc.text(splitText, coordinates[0] + width / 2, coordinates[1] + 5.33, {
    align: "center",
  });

  return coordinates;
};

// TODO: explore how to add alt text to these color bars for accessibility, and if that can be included in the PDF output in a way that screen readers can access.
const createMetricBox = function (doc, metric, label, coordinates, riskLevel) {
  // Box settings
  const boxWidth = 25;
  const boxHeight = 15;
  const boxRadius = 3;
  let color = null;
  if (riskLevel) {
    // Use risk level color if provided
    color = styles.riskKey[riskLevel.toLowerCase()];
  }
  const backgroundColor = color || "#B5CFD1"; // Light blue background color
  const metricColor = "#FFFFFF"; // White text color for metric
  const labelColor = "#333333"; // Dark gray text color for label

  // Save the original x coordinate to return to later
  const originalX = coordinates[0];

  // Add the metric number
  // If metric is a blank string, make a circle instead
  if (metric === "" || metric === null || metric === undefined) {
    doc.setFillColor(backgroundColor); // White circle for empty metric
    doc.circle(
      coordinates[0] + boxWidth / 2,
      coordinates[1] + boxHeight / 2,
      boxHeight / 2,
      "F"
    );
    metric = "?"; // Display a question mark for empty metrics
  } else {
    // Draw rounded rectangle with light blue background
    doc.setFillColor(backgroundColor);
    doc.roundedRect(
      coordinates[0],
      coordinates[1],
      boxWidth,
      boxHeight,
      boxRadius,
      boxRadius,
      "F"
    );
    doc.setFont(styles.font, styles.fontStyle);
    doc.setFontSize(20);
    doc.setTextColor(metricColor);
    doc.text(
      metric.toString(),
      coordinates[0] + boxWidth / 2,
      coordinates[1] + boxHeight / 2,
      {
        align: "center",
        baseline: "middle",
      }
    );
  }

  // Add the label below the box
  doc.setFont(styles.font, styles.fontStyle);
  doc.setFontSize(10);
  doc.setTextColor(labelColor);
  const text = doc.splitTextToSize(label, boxWidth);
  doc.text(
    text,
    coordinates[0] + boxWidth / 2,
    coordinates[1] + boxHeight + 4,
    {
      align: "center",
    }
  );

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

const createSubsection = function (
  doc,
  header,
  content,
  coordinates,
  width,
  url
) {
  const headerH = 10;
  const badgeW = 10;
  const headerColor = styles.prioritiesSection.headerColor; // dark blue
  const headerTextColor = styles.prioritiesSection.headerTextColor; // white
  const bodyTextColor = styles.prioritiesSection.bodyTextColor; // dark gray
  const fontSizeBody = styles.prioritiesSection.fontSizeBody;
  const lineHeight = fontSizeBody;
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

  const contentLength = content.length;
  content.forEach((item, index) => {
    if (item.type === "paragraph" || item.type === "link") {
      // wrap text within width
      const lines = doc.splitTextToSize(item.text, w);
      if (index === contentLength - 1) {
        doc.setTextColor(styles.linkTextColor);
        doc.textWithLink(lines, x, cursorY, { url: url });
      } else if (item.type === "link") {
        doc.setTextColor(styles.linkTextColor);
        doc.textWithLink(lines, x, cursorY, { url: item.url });
      } else {
        doc.setTextColor(bodyTextColor);
        doc.text(item.text, x, cursorY, { maxWidth: width });
      }
      if (lines.length > 1) {
        cursorY += lines.length * 6;
      } else {
        cursorY += lines.length * 8;
      }
    } else if (item.type === "bullet") {
      let ignoredX;
      [ignoredX, cursorY] = createBullet(doc, item.text, [x, cursorY], 8);
    }
  });

  return cursorY;
};

const drawRiskBox = function (doc, riskKey, x, y, height) {
  const boxWidth = 10;
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
  const minRowHeight = 9;
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
  doc.text(
    "Category",
    originX + width / 8 + 3,
    originY + headerHeight / 2 + 1,
    {
      align: "center",
    }
  );
  doc.text(
    "Recommendation",
    originX + (5.5 * width) / 12,
    originY + headerHeight / 2 + 1,
    { align: "center" }
  );
  doc.text(
    "Your Score",
    originX + (9 * width) / 12,
    originY + headerHeight / 2 + 1,
    { align: "center" }
  );
  doc.text(
    "Health\nRisk",
    originX + (10.8 * width) / 12 + 6,
    originY + headerHeight / 2 - 1,
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
    const refLines = doc.splitTextToSize(referenceRange[i], width / 4);
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
    doc.text(labelLines, originX + width / 8 + 3, labelY, { align: "center" });
    doc.text(refLines, originX + (5.5 * width) / 12, refY, {
      align: "center",
    });
    doc.text(dataLines, originX + (9 * width) / 12, dataY, {
      align: "center",
    });

    // Draw risk box
    const riskKey = riskKeys[i].toLowerCase();
    const riskBoxY = currentY + 1;
    const riskBoxX = originX + (10 * width) / 12 + cellPadding;
    drawRiskBox(doc, riskKey, riskBoxX + 12, riskBoxY, rowHeight);

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
  const sectionHeight = 30;
  const backgroundColor = "#BBBBBB"; // Light gray background
  const sectionX = coordinates[0];
  const sectionY = coordinates[1];

  // Create gray background rectangle
  doc.setFillColor(backgroundColor);
  doc.rect(0, sectionY, width, sectionHeight, "F");

  // Add left side title text
  doc.setFont(styles.headerFont, styles.headerFontStyle);
  doc.setTextColor("#FFFFFF"); // White text
  doc.setFontSize(14);
  doc.text(
    "You qualified for a tailored care pathway:",
    sectionX + width / 2,
    sectionY + 5,
    { align: "center" }
  );

  doc.setFont(styles.font, styles.fontStyle);
  doc.text(
    "If you enroll, a member of the OCIH team will reach out to help you further",
    sectionX + width / 2,
    sectionY + 12,
    { align: "center" }
  );
  doc.text(
    "tailor this plan and put it into action with individual support.",
    sectionX + width / 2,
    sectionY + 17,
    { align: "center" }
  );
  // Add enrollment button
  doc.setFillColor("#FFFFFF");
  doc.roundedRect(sectionX + width / 2 - 25, sectionY + 20, 50, 8, 3, 3, "F");

  // Add enrollment link
  doc.setTextColor("#990000"); // Dark red text
  doc.setFontSize(12);
  doc.setFont(styles.font, styles.fontStyle);
  doc.textWithLink(
    "Click here to enroll!",
    sectionX + width / 2,
    sectionY + 25,
    {
      align: "center",
      url: PDF.tcpLink,
    }
  );

  // Update Y coordinate for elements after this section
  coordinates[1] += sectionHeight + 10;

  return coordinates;
};

const calculateIndividualData = function () {
  const record = PDF.logicRecord;
  const hasPrimaryCareProvider =
    record.provider == 1 || record.provider == 2 ? "Yes" : "No";
  let hasDiabetesHistory = "";
  if (record && record.dbt_p_score) {
    if (record.dbt_p_score == 2) {
      hasDiabetesHistory = "No History";
    } else {
      hasDiabetesHistory = "Diabetes";
    }
  }
  const fastFoodSnacks =
    record.fast_food_snacks == 7 ? "7 or more" : record.fast_food_snacks;
  const cupsFruitVeg =
    record.cups_fruit_veg == 6 ? "6 or more" : record.cups_fruit_veg;
  const sugarSweetened =
    record.sugar_sweetened == 6 ? "More than 5" : record.sugar_sweetened;
  const physicalActivity = record.phys_minutes_weekly;
  const stress = record.slider;
  const sleepiness = choiceToText.sleepy_day[record.sleepy_day]
    ? choiceToText.sleepy_day[record.sleepy_day]
    : "";
  let tobaccoUse = "";
  if (record && record.tobacco) {
    if (record.tobacco == 1) {
      tobaccoUse = "Yes";
    } else {
      tobaccoUse = "No";
    }
  }
  let drugUse = "";
  if (record && record.drug_rx_nonmed) {
    if (record.drug_rx_nonmed == 0) {
      drugUse = "No";
    } else {
      drugUse = "Yes";
    }
  }
  const generalHealth =
    choiceToText.general_health[record.general_health] || "Unknown";
  return [
    hasPrimaryCareProvider,
    hasDiabetesHistory,
    fastFoodSnacks,
    cupsFruitVeg,
    sugarSweetened,
    physicalActivity,
    stress,
    sleepiness,
    tobaccoUse,
    drugUse,
    generalHealth,
  ];
};

// TODO: If the risk key logic changes based on combined/renamed priorities coming from processPriorities(),
// update this function to match the new logic and ensure the risk levels in the summary table align with the top icon tiles.
function calculateRiskKeyBubbles() {
  const record = PDF.logicRecord;
  let a1cRisk;
  switch (true) {
    case record.recent_a1c == "88" || record.recent_a1c_type12 == "88":
      a1cRisk = "unknown";
      break;
    case (record.a1c_12m == "1" && record.recent_a1c == "2") ||
      (record.recent_a1c == "1" && record.pre_diabetes_care == "0") ||
      (record.recent_a1c == "2" && record.pre_diabetes_care != "") ||
      (record.recent_a1c_type12 == "1" && record.type1_diabetes_care == "0") ||
      (record.recent_a1c_type12 == "2" && record.type1_diabetes_care != "") ||
      (record.recent_a1c_type12 == "1" && record.type2_diabetes_care == "0") ||
      (record.recent_a1c_type12 == "2" && record.type2_diabetes_care != ""):
      a1cRisk = "high";
      break;
    case (record.recent_a1c == "0" && record.pre_diabetes_care == "0") ||
      (record.recent_a1c == "1" && record.pre_diabetes_care == "1") ||
      (record.a1c_12m == "1" && record.recent_a1c == "1") ||
      (record.recent_a1c_type12 == "0" && record.type1_diabetes_care == "0") ||
      (record.recent_a1c_type12 == "1" && record.type1_diabetes_care == "1") ||
      (record.recent_a1c_type12 == "0" && record.type2_diabetes_care == "0") ||
      (record.recent_a1c_type12 == "1" && record.type2_diabetes_care == "1"):
      a1cRisk = "medium";
      break;
    case (record.recent_a1c == "0" && record.pre_diabetes_care == "1") ||
      (record.a1c_12m == "1" && record.recent_a1c == "0") ||
      (record.recent_a1c_type12 == "0" && record.pre_diabetes_care == "1") ||
      (record.recent_a1c_type12 == "0" && record.type1_diabetes_care == "1") ||
      (record.recent_a1c_type12 == "0" && record.type2_diabetes_care == "1"):
      a1cRisk = "low";
      break;
    default:
      a1cRisk = "unknown";
  }
  let alcRisk;
  switch (true) {
    case record.alc_total == "":
      alcRisk = "unknown";
      break;
    case record.alc_total >= 5 && record.birth_gender != 1:
      alcRisk = "high";
      break;
    case record.alc_total >= 6 && record.birth_gender == 1:
      alcRisk = "high";
      break;
    case record.alc_total >= 3 && record.birth_gender != 1:
      alcRisk = "medium";
      break;
    case record.alc_total == 4:
      alcRisk = "medium";
      break;
    case record.alc_total < 4:
      alcRisk = "low";
      break;
    default:
      alcRisk = "unknown";
  }

  let anxRisk;
  switch (true) {
    case record.gad_total == "":
      anxRisk = "unknown";
      break;
    case record.gad_total >= 15:
      anxRisk = "high";
      break;
    case record.gad_total >= 4:
      anxRisk = "medium";
      break;
    case record.gad_total < 4:
      anxRisk = "low";
      break;
    default:
      anxRisk = "unknown";
  }

  let depRisk;
  switch (true) {
    case record.phq9_total_score == "":
      depRisk = "unknown";
      break;
    case record.phq9_total_score >= 15:
      depRisk = "high";
      break;
    case record.phq9_total_score >= 4:
      depRisk = "medium";
      break;
    case record.phq9_total_score < 4:
      depRisk = "low";
      break;
    default:
      depRisk = "unknown";
  }

  let bmiRisk;
  switch (true) {
    case record.bmi == "":
      bmiRisk = "unknown";
      break;
    case record.bmi >= 30:
      bmiRisk = "high";
      break;
    case record.bmi >= 25 || record.bmi < 18.5:
      bmiRisk = "medium";
      break;
    case record.bmi >= 18.5:
      bmiRisk = "low";
      break;
    default:
      bmiRisk = "unknown";
  }

  const riskKeys = [a1cRisk, alcRisk, anxRisk, depRisk, bmiRisk];
  return riskKeys;
}

// TODO: If the risk key logic changes based on combined/renamed priorities coming from processPriorities(),
// update this function to match the new logic and ensure the risk levels in the summary table align with the top icon tiles.
function calculateRiskKeysTable() {
  const record = PDF.logicRecord;
  let providerRisk;
  switch (true) {
    case record.provider == 3:
      providerRisk = "high";
      break;
    case record.provider == 2 || record.provider == 1:
      providerRisk = "low";
      break;
    default:
      providerRisk = "unknown";
  }

  let diabetesRisk;
  switch (true) {
    case record.dbt_p_score == "":
      diabetesRisk = "unknown";
      break;
    case record.dbt_p_score == 2:
      diabetesRisk = "low";
      break;
    case record.dbt_p_score != "":
      diabetesRisk = "medium";
      break;
    default:
      diabetesRisk = "unknown";
  }
  // switch (true) {
  //   case record.prev_diags___1 == "0" &&
  //     record.prev_diags___2 == "0" &&
  //     record.prev_diags___3 == "0" &&
  //     record.prev_diags___4 == "0" &&
  //     record.prev_diags___5 == "0" &&
  //     record.prev_diags___6 == "0" &&
  //     record.prev_diags___7 == "0" &&
  //     record.prev_diags___8 == "0" &&
  //     record.prev_diags___9 == "0" &&
  //     record.prev_diags___10 == "0":
  //     diabetesRisk = "unknown";
  //     break;
  //   case record.prev_diags___1 == 1 ||
  //     record.prev_diags___2 == 1 ||
  //     record.prev_diags___3 == 1 ||
  //     record.prev_diags___10 == 1:
  //     diabetesRisk = "medium";
  //     break;
  //   case record.prev_diags___4 == 1 ||
  //     (record.prev_diags___1 == 0 &&
  //       record.prev_diags___2 == 0 &&
  //       record.prev_diags___3 == 0 &&
  //       record.prev_diags___10 == 0):
  //     diabetesRisk = "low";
  //     break;
  //   default:
  //     diabetesRisk = "unknown";
  // }

  let fastFoodSnacksRisk;
  switch (true) {
    case record.fast_food_snacks == "":
      fastFoodSnacksRisk = "unknown";
      break;
    case record.fast_food_snacks >= 4:
      fastFoodSnacksRisk = "high";
      break;
    case record.fast_food_snacks >= 1:
      fastFoodSnacksRisk = "medium";
      break;
    case record.fast_food_snacks == 0:
      fastFoodSnacksRisk = "low";
      break;
    default:
      fastFoodSnacksRisk = "unknown";
  }

  let fruitVegIntakeRisk;
  switch (true) {
    case record.cups_fruit_veg == "":
      fruitVegIntakeRisk = "unknown";
      break;
    case record.cups_fruit_veg <= 2:
      fruitVegIntakeRisk = "high";
      break;
    case record.cups_fruit_veg <= 4:
      fruitVegIntakeRisk = "medium";
      break;
    case record.cups_fruit_veg >= 5:
      fruitVegIntakeRisk = "low";
      break;
    default:
      fruitVegIntakeRisk = "unknown";
  }

  let sugarSweetenedBeveragesRisk;
  switch (true) {
    case record.sugar_sweetened == "":
      sugarSweetenedBeveragesRisk = "unknown";
      break;
    case record.sugar_sweetened >= 4:
      sugarSweetenedBeveragesRisk = "high";
      break;
    case record.sugar_sweetened > 0:
      sugarSweetenedBeveragesRisk = "medium";
      break;
    case record.sugar_sweetened == 0:
      sugarSweetenedBeveragesRisk = "low";
      break;
    default:
      sugarSweetenedBeveragesRisk = "unknown";
  }

  let physicalActivityRisk;
  switch (true) {
    case record.exercise_7_days == "":
      physicalActivityRisk = "unknown";
      break;
    case record.exercise_7_days == 0 || record.phys_minutes_weekly <= 10:
      physicalActivityRisk = "high";
      break;
    case record.phys_minutes_weekly >= 10 && record.phys_minutes_weekly < 150:
      physicalActivityRisk = "medium";
      break;
    case record.phys_minutes_weekly >= 150:
      physicalActivityRisk = "low";
      break;
    default:
      physicalActivityRisk = "unknown";
  }

  let stressRisk;
  switch (true) {
    case record.slider == "":
      stressRisk = "unknown";
      break;
    case record.slider >= 8:
      stressRisk = "high";
      break;
    case record.slider >= 5:
      stressRisk = "medium";
      break;
    case record.slider < 5:
      stressRisk = "low";
      break;
    default:
      stressRisk = "unknown";
  }

  let sleepinessRisk;
  switch (true) {
    case record.sleepy_day == "":
      sleepinessRisk = "unknown";
      break;
    case record.sleepy_day == 5:
      sleepinessRisk = "high";
      break;
    case record.sleepy_day == 4:
      sleepinessRisk = "medium";
      break;
    case record.sleepy_day <= 3:
      sleepinessRisk = "low";
      break;
    default:
      sleepinessRisk = "unknown";
  }

  let tobaccoUseRisk;
  switch (true) {
    case record.tobacco == "":
      tobaccoUseRisk = "unknown";
      break;
    case record.tobacco == 1:
      tobaccoUseRisk = "high";
      break;
    case record.tobacco == 0:
      tobaccoUseRisk = "low";
      break;
    default:
      tobaccoUseRisk = "unknown";
  }

  let drugUseRisk;
  switch (true) {
    case record.drug_rx_nonmed == "":
      drugUseRisk = "unknown";
      break;
    case record.drug_rx_nonmed == 2:
      drugUseRisk = "high";
      break;
    case record.drug_rx_nonmed == 1:
      drugUseRisk = "medium";
      break;
    case record.drug_rx_nonmed == 0:
      drugUseRisk = "low";
      break;
    default:
      drugUseRisk = "unknown";
  }

  let generalHealthRisk;
  switch (true) {
    case record.general_health == "":
      generalHealthRisk = "unknown";
      break;
    case record.general_health == 5:
      generalHealthRisk = "high";
      break;
    case record.general_health == 4:
      generalHealthRisk = "medium";
      break;
    case record.general_health <= 3:
      generalHealthRisk = "low";
      break;
    default:
      generalHealthRisk = "unknown";
  }

  const riskKeys = [
    providerRisk,
    diabetesRisk,
    fastFoodSnacksRisk,
    fruitVegIntakeRisk,
    sugarSweetenedBeveragesRisk,
    physicalActivityRisk,
    stressRisk,
    sleepinessRisk,
    tobaccoUseRisk,
    drugUseRisk,
    generalHealthRisk,
  ];
  return riskKeys;
}

function calculateA1CValue() {
  const record = PDF.logicRecord;
  let a1cValue = "";
  if (record) {
    if (record.recent_a1c) {
      switch (record.recent_a1c) {
        case "0":
          a1cValue = "<5.7";
          break;
        case "1":
          a1cValue = "5.7-6.4";
          break;
        case "2":
          a1cValue = "≥6.5";
          break;
        default:
          a1cValue = "";
      }
    } else if (record.recent_a1c_type12) {
      switch (record.recent_a1c_type12) {
        case "0":
          a1cValue = "<7.1";
          break;
        case "1":
          a1cValue = "7.1-8.0";
          break;
        case "2":
          a1cValue = "≥8";
          break;
        default:
          a1cValue = "";
      }
    }
  }
  return a1cValue;
}

function estimateSectionLength(doc, content) {
  let sectionLength = 26;
  let width = doc.internal.pageSize.getWidth() - 10;
  let coordinateHeight = 10;
  for (let key in content) {
    let type = content[key].type;
    let text = content[key].text;
    if (type === "bullet") {
      text = "\u2022 " + text;
      width = 180;
      coordinateHeight = 6;
    }
    text = doc.splitTextToSize("\u2022 " + text, width);
    if (text.length > 1) {
      sectionLength += text.length * 6;
    } else {
      sectionLength += text.length * 8;
    }
  }
  return sectionLength;
}
