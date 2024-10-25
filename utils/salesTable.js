function generateSalesTableHTML(salesTable) {
    let html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0;">
      <div>
        <h2>SALES.</h2>
        <div style="border: 1px solid #4a4a4a; border-radius: 8px;">
    `;
  
    salesTable.forEach(row => {
      html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #4a4a4a;">
          <!-- Left Column -->
          <div style="padding: 16px; border-right: 1px solid #4a4a4a;">
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 600; display: block; margin-bottom: 4px;">Property:</span>
              <span style="display: block; border-bottom: 1px solid black; padding-bottom: 4px;">${row.property || ''}</span>
            </div>
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 600; display: block; margin-bottom: 4px;">Specifics:</span>
              <span style="display: block; border-bottom: 1px solid black; padding-bottom: 4px;">${row.specifics || ''}</span>
            </div>
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 600; display: block; margin-bottom: 4px;">Sold Date:</span>
              <span style="display: block; border-bottom: 1px solid black; padding-bottom: 4px;">${row.sold || ''}</span>
            </div>
            <div>
              <span style="font-weight: 600; display: block; margin-bottom: 4px;">Features:</span>
              <span style="display: block; border-bottom: 1px solid black; padding-bottom: 4px;">${row.features || ''}</span>
            </div>
          </div>
          
          <!-- Right Column -->
          <div style="padding: 16px; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <span style="font-weight: 600; display: block; margin-bottom: 4px;">Price:</span>
              <div style="position: relative; min-width: 120px;">
                <span style="position: absolute; left: 0; top: 0;">$</span>
                <span style="display: block; border-bottom: 1px solid black; padding: 0 0 4px 12px;">${row.price || ''}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  
    html += `
        </div>
      </div>
    </body>
    </html>`;
  
    return html;
  }
module.exports= generateSalesTableHTML;