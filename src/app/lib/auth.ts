export const isAuthenticated = () =>
  !!localStorage.getItem('customerToken');

export const getToken = () =>
  localStorage.getItem('customerToken');

export const logout = () => {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');

  window.location.href = '/login';
};