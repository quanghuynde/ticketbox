const API_URL = import.meta.env.VITE_API_URL || '/api';

const uploadImage = async (token, file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'Không thể tải ảnh lên.');
    err.data = data;
    throw err;
  }

  return data.url;
};

export { uploadImage };