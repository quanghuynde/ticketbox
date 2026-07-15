const API_URL = import.meta.env.VITE_API_URL || '/api';

const getNotifications = async (token) => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tải thông báo.');
  }
  return data;
};

const markAsRead = async (token, id) => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể đánh dấu đã đọc.');
  }
  return data;
};

const deleteNotification = async (token, id) => {
  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể xóa thông báo.');
  }
  return data;
};

export { getNotifications, markAsRead, deleteNotification };
