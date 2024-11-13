const fetchCryptoPrices = async (apiKey) => {
  const apiUrl = '/api/v1/cryptocurrency/listings/latest';

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export default fetchCryptoPrices;
