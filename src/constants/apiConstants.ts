export const USE_MOCK_DATA = false;
export const BASE_URL = "http://217.26.29.92:8080";
export const API_AUTH_LOGIN = `${BASE_URL}/api/Auth/login`;
export const API_USERS = `${BASE_URL}/api/Users`;
export const API_HIERARCHY = `${BASE_URL}/api/Users/hierarchy`;
export const API_HIERARCHY_V2 = `${API_USERS}/hierarchyV2`;
export const API_DEPARTMENT_TREE = `${API_USERS}/treeWithoutUsers`;
export const API_DEPARTMENT_USERS = (hierarchyId: number | string) =>
  `${API_USERS}/departmentUsers?hierarchyId=${hierarchyId}`;
export const API_USER_BY_ID = (userId: string) => `${API_USERS}/${userId}`;
export const API_USERS_DEPARTMENTS = `${API_USERS}/departments`;
export const API_USERS_POSITIONS = `${API_USERS}/positions`;
