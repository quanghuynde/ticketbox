const API_URL = import.meta.env.VITE_API_URL || '/api';

const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'Không thể tải thông tin hồ sơ.');
    err.data = data;
    throw err;
  }
  return data;
};

const updateProfile = async (token, payload) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'Cập nhật hồ sơ thất bại.');
    err.data = data;
    throw err;
  }
  return data;
};

const changePassword = async (token, payload) => {
  const response = await fetch(`${API_URL}/users/profile/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'Đổi mật khẩu thất bại.');
    err.data = data;
    throw err;
  }
  return data;
};

export { getProfile, updateProfile, changePassword };
