import { describe, expect, it, beforeEach, vi, type Mock } from "vitest";
import { organizationService } from "../organizationService";
import { apiClient } from "../../utils/apiClient";
import { MOCK_HIERARCHY } from "../../constants/mockUsersHierarchy";
import { MOCK_DEPARTMENT_TREE } from "../../constants/mockDepartmentTree";
import { getMockDepartmentUsers } from "../../constants/mockDepartmentUsers";
import { MOCK_HIERARCHY_V2 } from "../../constants/mockHierarchyV2";

vi.mock("../../utils/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockedGet = apiClient.get as Mock;

const createResponse = <T>(data: T, status = 200) => ({ data, status });

describe("organizationService", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("getOrganizationHierarchy возвращает данные сервера", async () => {
    mockedGet.mockResolvedValueOnce(createResponse(MOCK_HIERARCHY));

    const result = await organizationService.getOrganizationHierarchy();

    expect(result.totalEmployees).toBe(MOCK_HIERARCHY.totalEmployees);
    expect(result.ceo.department).toBe("IT");

    const [, options] = mockedGet.mock.calls[
      mockedGet.mock.calls.length - 1
    ] as [unknown, { validateStatus: () => boolean }];
    expect(options.validateStatus()).toBe(true);
  });

  it("getOrganizationHierarchy использует мок при невалидных данных", async () => {
    mockedGet.mockResolvedValueOnce(createResponse({}));

    const result = await organizationService.getOrganizationHierarchy();

    expect(result.ceo.department).toBe("IT");
  });

  it("getOrganizationHierarchy использует мок при статусе ошибки", async () => {
    mockedGet.mockResolvedValueOnce(createResponse(MOCK_HIERARCHY, 500));

    const result = await organizationService.getOrganizationHierarchy();

    expect(result.ceo.department).toBe("IT");
  });

  it("getFullHierarchyTree возвращает данные сервера", async () => {
    mockedGet.mockResolvedValueOnce(createResponse(MOCK_HIERARCHY_V2));

    const result = await organizationService.getFullHierarchyTree();

    expect(result).toEqual(MOCK_HIERARCHY_V2);

    const [, options] = mockedGet.mock.calls[
      mockedGet.mock.calls.length - 1
    ] as [unknown, { validateStatus: () => boolean }];
    expect(options.validateStatus()).toBe(true);
  });

  it("getFullHierarchyTree использует мок при ошибке", async () => {
    mockedGet.mockResolvedValueOnce(createResponse({}, 503));

    const result = await organizationService.getFullHierarchyTree();

    expect(result).toEqual(MOCK_HIERARCHY_V2);
  });

  it("getFullHierarchyTree использует мок при невалидных данных", async () => {
    mockedGet.mockResolvedValueOnce(createResponse({}));

    const result = await organizationService.getFullHierarchyTree();

    expect(result).toEqual(MOCK_HIERARCHY_V2);
  });

  it("getDepartmentTree возвращает данные сервера", async () => {
    mockedGet.mockResolvedValueOnce(createResponse(MOCK_DEPARTMENT_TREE));

    const result = await organizationService.getDepartmentTree();

    expect(result).toEqual(MOCK_DEPARTMENT_TREE);

    const [, options] = mockedGet.mock.calls[
      mockedGet.mock.calls.length - 1
    ] as [unknown, { validateStatus: () => boolean }];
    expect(options.validateStatus()).toBe(true);
  });

  it("getDepartmentTree возвращает мок при невалидных данных", async () => {
    mockedGet.mockResolvedValueOnce(createResponse({}));

    const result = await organizationService.getDepartmentTree();

    expect(result).toEqual(MOCK_DEPARTMENT_TREE);
  });

  it("getDepartmentTree использует мок при статусе ошибки", async () => {
    mockedGet.mockResolvedValueOnce(createResponse(MOCK_DEPARTMENT_TREE, 500));

    const result = await organizationService.getDepartmentTree();

    expect(result).toEqual(MOCK_DEPARTMENT_TREE);
  });

  it("getDepartmentUsers возвращает данные сервера", async () => {
    const sample = getMockDepartmentUsers(44);
    mockedGet.mockResolvedValueOnce(createResponse(sample));

    const result = await organizationService.getDepartmentUsers(44);

    expect(result).toEqual(sample);

    const [, options] = mockedGet.mock.calls[
      mockedGet.mock.calls.length - 1
    ] as [unknown, { validateStatus: () => boolean }];
    expect(options.validateStatus()).toBe(true);
  });

  it("getDepartmentUsers использует мок при исключении", async () => {
    mockedGet.mockRejectedValueOnce(new Error("network"));

    const result = await organizationService.getDepartmentUsers(44);

    expect(result.hierarchyId).toBe(44);
  });

  it("getDepartmentUsers использует мок при невалидном ответе", async () => {
    mockedGet.mockResolvedValueOnce(createResponse({ hierarchyId: 44 }));

    const result = await organizationService.getDepartmentUsers(44);

    expect(result.hierarchyId).toBe(44);
  });

  it("getDepartmentUsers использует мок при статусе ошибки", async () => {
    const sample = getMockDepartmentUsers(44);
    mockedGet.mockResolvedValueOnce(createResponse(sample, 404));

    const result = await organizationService.getDepartmentUsers(44);

    expect(result.hierarchyId).toBe(44);
  });

  it("enrichWithDepartments проставляет department сотрудникам", () => {
    const enriched = organizationService.enrichWithDepartments(MOCK_HIERARCHY);

    expect(enriched.departments[0].employees[0].department).toBe(
      enriched.departments[0].department
    );
  });
});
