/**
 * Converts an array of objects to CSV content
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects { key, display }
 * @returns {string} CSV content
 */
export const arrayToCSV = (data, headers) => {
  if (!data || !data.length) return '';

  // Create the header row
  const headerRow = headers.map(header => `"${header.display}"`).join(',');
  
  // Create the data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Format the value appropriately based on its type
      let value = item[header.key];
      
      // Handle dates
      if (header.type === 'date' && value) {
        value = new Date(value).toLocaleDateString();
      }
      
      // Handle numbers (ensure 2 decimal places for currency)
      if (header.type === 'currency' && typeof value === 'number') {
        value = value.toFixed(2);
      }
      
      // Escape quotes and wrap in quotes
      if (value === null || value === undefined) {
        return '""';
      } else {
        return `"${String(value).replace(/"/g, '""')}"`;
      }
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${rows}`;
};

/**
 * Downloads a string as a file
 * @param {string} content - The content to download
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The MIME type of the file
 */
export const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Exports data as a CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects { key, display, type }
 * @param {string} fileName - Name of the file to download
 */
export const exportToCSV = (data, headers, fileName) => {
  const csv = arrayToCSV(data, headers);
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
};