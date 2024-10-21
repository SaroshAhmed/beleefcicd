const puppeteer = require('puppeteer');
const generateTableHtml = require('./generateTable');

const generatePdf = async (reportContent, propertyName = 'Unknown Property',tableData) => {
    try {
      const tableHtml = generateTableHtml(tableData);
  
      // Launch Puppeteer in headless mode
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const finalHtmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          ${reportContent}
          <h2>Data Summary</h2>
          ${tableHtml} <!-- Table gets embedded here -->
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