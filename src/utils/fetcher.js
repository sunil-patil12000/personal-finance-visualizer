/**
 * SWR fetcher function for making API requests
 * @param {string} url - The URL to fetch
 * @returns {Promise<any>} - The response data
 */
export const fetcher = async (url) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  
  return response.json();
}; 