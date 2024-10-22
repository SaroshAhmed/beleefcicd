const generateTableHtml = (tableData) => {
    let tableHtml = "<table border='1' style='width:100%; border-collapse:collapse;background-color: #f5f5f5;'>";
    // Create the table headers
    tableHtml += "<thead><tr>";
    tableData.columns.forEach(col => {
      tableHtml += `<th style='padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.75rem; padding-bottom: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: black; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; width: 100%; overflow: hidden;'>${col.headerName}</th>`;
    });
    tableHtml += "</tr></thead>";
    
    // Create the table rows
    tableHtml += "<tbody style='background-color: white; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;'>";
    tableData.rows.forEach(row => {
      tableHtml += "<tr style='padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.75rem; padding-bottom: 0.75rem; white-space: nowrap; border: 1px solid; border-bottom-width: 2px;'>";
      tableData.columns.forEach(col => {
        // convert row.data which is a Map to an object
        const rowObj = Object.fromEntries(row.data);
        const cellData = rowObj[col._id] || ""; // Get the cell data from the row object
        tableHtml += `<td>${cellData}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</tbody></table>";
  
    return tableHtml;
  };
module.exports = generateTableHtml;