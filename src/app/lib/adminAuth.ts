export const isAdminAuthenticated = () =>
  !!localStorage.getItem('adminToken') && localStorage.getItem('role') === 'admin';

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('role');
  window.location.href = '/admin/login';
};
