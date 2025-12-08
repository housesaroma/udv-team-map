import { describe, it, expect } from "vitest";
import {
  API_AUTH_LOGIN,
  API_USERS,
  API_HIERARCHY,
  API_HIERARCHY_V2,
  API_DEPARTMENT_TREE,
  API_DEPARTMENT_USERS,
  API_USER_BY_ID,
  API_USERS_DEPARTMENTS,
  API_USERS_POSITIONS,
  BASE_URL,
} from "../apiConstants";

describe("apiConstants", () => {
  describe("BASE_URL", () => {
    it("должен быть определен", () => {
      expect(BASE_URL).toBeDefined();
      expect(typeof BASE_URL).toBe("string");
    });
  });

  describe("API endpoints", () => {
    it("должен сформировать корректный API_AUTH_LOGIN", () => {
      expect(API_AUTH_LOGIN).toBe(`${BASE_URL}/api/Auth/login`);
    });

    it("должен сформировать корректный API_USERS", () => {
      expect(API_USERS).toBe(`${BASE_URL}/api/Users`);
    });

    it("должен сформировать корректный API_HIERARCHY", () => {
      expect(API_HIERARCHY).toBe(`${BASE_URL}/api/Users/hierarchy`);
    });

    it("должен сформировать корректный API_HIERARCHY_V2", () => {
      expect(API_HIERARCHY_V2).toBe(`${API_USERS}/hierarchyV2`);
    });

    it("должен сформировать корректный API_DEPARTMENT_TREE", () => {
      expect(API_DEPARTMENT_TREE).toBe(`${API_USERS}/treeWithoutUsers`);
    });

    it("должен сформировать корректный API_USERS_DEPARTMENTS", () => {
      expect(API_USERS_DEPARTMENTS).toBe(`${API_USERS}/departments`);
    });

    it("должен сформировать корректный API_USERS_POSITIONS", () => {
      expect(API_USERS_POSITIONS).toBe(`${API_USERS}/positions`);
    });
  });

  describe("API функции", () => {
    it("API_DEPARTMENT_USERS должен вернуть корректный URL для числового hierarchyId", () => {
      const url = API_DEPARTMENT_USERS(44);
      expect(url).toBe(`${API_USERS}/departmentUsers?hierarchyId=44`);
    });

    it("API_DEPARTMENT_USERS должен вернуть корректный URL для строкового hierarchyId", () => {
      const url = API_DEPARTMENT_USERS("44");
      expect(url).toBe(`${API_USERS}/departmentUsers?hierarchyId=44`);
    });

    it("API_USER_BY_ID должен вернуть корректный URL", () => {
      const userId = "11111111-1111-1111-1111-111111111111";
      const url = API_USER_BY_ID(userId);
      expect(url).toBe(`${API_USERS}/${userId}`);
    });
  });
});
