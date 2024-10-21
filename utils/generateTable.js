const generateTableHtml = (tableData) => {
    let tableHtml = "<table border='1' style='width:100%; border-collapse:collapse;'>";
    
    // Create the table headers
    tableHtml += "<thead><tr>";
    tableData.columns.forEach(col => {
      tableHtml += `<th>${col.headerName}</th>`;
    });
    tableHtml += "</tr></thead>";
    
    // Create the table rows
    tableHtml += "<tbody>";
    tableData.rows.forEach(row => {
      tableHtml += "<tr>";
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