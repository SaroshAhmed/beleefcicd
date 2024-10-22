const puppeteer = require('puppeteer');
const generateTableHtml = require('./generateTable');
const generateReportSections = (reportDataArray) => {
  return reportDataArray
    .map((data) => {
      // Calculate percentages
      const enquiriesPercentage = ( data.inspections1/ data.enquiries) * 100 || 0;
      const engagementsPercentage = (data.engagements / data.inspections2) * 100 || 0;

      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Week Header -->
  <div style="background-color: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
    <h2 style="font-size: 1.25rem; color: #000; font-weight: 600; margin: 0;">${data.name}</h2>
  </div>

  <!-- Form Content -->
  <div style="padding: 3px">
    <!-- Row 1: Price Point, Enquiries, Inspections, and Percentage -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-end;">
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Price Point</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.pricePoint || 'N/A'}</div>
      </div>
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Enquiries</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.enquiries}</div>
      </div>
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Inspections</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.inspections1}</div>
      </div>
      <span style="display: inline-block; background-color: #000; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; margin-bottom: 8px;">${enquiriesPercentage.toFixed(2)}%</span>
    </div>

    <!-- Row 2: Price Test, Inspections, Engagement, and Percentage -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-end;">
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Price Test</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.pricePoint || 'N/A'}</div>
      </div>
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Inspections</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.inspections2}</div>
      </div>
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Engagement</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.engagements}</div>
      </div>
      <span style="display: inline-block; background-color: #000; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; margin-bottom: 8px;">${engagementsPercentage.toFixed(2)}%</span>
    </div>

    <!-- Row 3: Finalise -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      <div style="flex: 1;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Finalise</label>
        <div style="width: 100%; height: 40px; padding: 8px 16px 8px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">${data.finalise || 'N/A'}</div>
      </div>
    </div>
  </div>
</div>
      `;
    })
    .join(""); // Join all the generated sections into one string
};

const generatePdf = async (reportContent, propertyName = 'Unknown Property',tableData,index,data) => {
    try {
      const firstPageHtml = `
            <div style="text-align: center; margin-top: 300px;">
        <h1>Insights To The Maximum Outcome</h1>
        <p>${index} Report: ${propertyName}</p>
      </div>
      <div style="page-break-after: always;"></div> 
    `;
    const reportSections = generateReportSections(data);
    const tableHtml = generateTableHtml(tableData);
      
      // Launch Puppeteer in headless mode
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const finalHtmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            
          </style>
        </head>
        <body>
          ${firstPageHtml}
          <div style="text-align: start; font-weight: bold; font-size: 1.25rem; margin-bottom: 16px;">
  HERE IS WHAT HAS HAPPENED.
</div>
<div style="text-align: start; font-weight: bold; font-size: 1.25rem; margin-bottom: 16px;">
  MANUAL
</div>
          ${reportSections}
          
          <h2>CURRENT ENGAGEMENT</h2>
          ${tableHtml} <!-- Table gets embedded here -->
          ${reportContent}
        </body>
      </html>
    `;
      // Set the HTML content
      await page.setContent(finalHtmlContent);
  
      // Generate PDF and return it as a buffer
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '5mm',
          bottom: '20mm',
          left: '5mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size:10px; width: 100%; text-align: center;">Report for ' + propertyName + '</div>',
        footerTemplate: '<div style="font-size:10px; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        scale: 1,
        landscape: false,
      });
  
      await browser.close();
  
      return pdfBuffer; // Return the PDF as a buffer
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Could not generate PDF');
    }
};
  
module.exports = generatePdf;