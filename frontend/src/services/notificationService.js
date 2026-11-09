const API_URL = import.meta.env.VITE_API_URL || '/api';

const getNotifications = async (token) => {
  if (!token) {
    return [];
  }

  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tải thông báo.');
  }
  return Array.isArray(data) ? data : [];
};

const markAsRead = async (token, id) => {
  if (!token) return null;

  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể đánh dấu đã đọc.');
  }
  return data;
};

const deleteNotification = async (token, id) => {
  if (!token) return null;

  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể xóa thông báo.');
  }
  return data;
};

export { getNotifications, markAsRead, deleteNotification };
