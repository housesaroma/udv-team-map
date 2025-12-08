import { describe, it, expect } from "vitest";
import {
  getDepartmentColor,
  generateDepartmentId,
  getDepartmentInfo,
  getDepartmentHierarchyColor,
} from "../departmentUtils";

describe("departmentUtils", () => {
  describe("getDepartmentColor", () => {
    it("должен возвращать цвет для IT отдела", () => {
      expect(getDepartmentColor("it")).toBe("#3697FF");
      expect(getDepartmentColor("IT")).toBe("#3697FF");
      expect(getDepartmentColor("Айти")).toBe("#3697FF");
      expect(getDepartmentColor("Информационные технологии")).toBe("#3697FF");
    });

    it("должен возвращать цвет для HR отдела", () => {
      expect(getDepartmentColor("hr")).toBe("#24D07A");
      expect(getDepartmentColor("HR")).toBe("#24D07A");
      expect(getDepartmentColor("Эйчар")).toBe("#24D07A");
      expect(getDepartmentColor("Кадры")).toBe("#24D07A");
    });

    it("должен возвращать цвет для Finance отдела", () => {
      expect(getDepartmentColor("finance")).toBe("#F59E0B");
      expect(getDepartmentColor("Финансы")).toBe("#F59E0B");
      expect(getDepartmentColor("Финансовый")).toBe("#F59E0B");
    });

    it("должен возвращать цвет для Marketing отдела", () => {
      expect(getDepartmentColor("marketing")).toBe("#FF4671");
      expect(getDepartmentColor("Маркетинг")).toBe("#FF4671");
    });

    it("должен возвращать цвет для Sales отдела", () => {
      expect(getDepartmentColor("sales")).toBe("#7D5EFA");
      expect(getDepartmentColor("Продажи")).toBe("#7D5EFA");
    });

    it("должен возвращать цвет для Operations отдела", () => {
      expect(getDepartmentColor("operations")).toBe("#2DD6C0");
      expect(getDepartmentColor("Операционный")).toBe("#2DD6C0");
      expect(getDepartmentColor("Операции")).toBe("#2DD6C0");
    });

    it("должен возвращать дефолтный цвет для неизвестного отдела", () => {
      expect(getDepartmentColor("unknown")).toBe("#6B7280");
      expect(getDepartmentColor("Неизвестный отдел")).toBe("#6B7280");
    });

    it("должен возвращать дефолтный цвет для пустой строки", () => {
      expect(getDepartmentColor("")).toBe("#6B7280");
    });

    it("должен игнорировать пробелы", () => {
      expect(getDepartmentColor("  it  ")).toBe("#3697FF");
      expect(getDepartmentColor("  HR  ")).toBe("#24D07A");
    });
  });

  describe("generateDepartmentId", () => {
    it("должен генерировать ID из названия отдела", () => {
      expect(generateDepartmentId("IT Department")).toBe("it-department");
      expect(generateDepartmentId("Human Resources")).toBe("human-resources");
    });

    it("должен приводить к нижнему регистру", () => {
      expect(generateDepartmentId("IT")).toBe("it");
      expect(generateDepartmentId("HR")).toBe("hr");
    });

    it("должен заменять множественные пробелы на дефис", () => {
      expect(generateDepartmentId("IT   Department")).toBe("it-department");
    });

    it("должен возвращать 'unknown' для пустой строки", () => {
      expect(generateDepartmentId("")).toBe("unknown");
    });

    it("должен обрабатывать специальные символы", () => {
      expect(generateDepartmentId("IT & Development")).toBe("it-&-development");
    });
  });

  describe("getDepartmentInfo", () => {
    it("должен возвращать полную информацию об отделе", () => {
      const result = getDepartmentInfo("IT Department");

      // "IT Department" не совпадает с ключами в departmentNameToKey, поэтому используется дефолтный цвет
      expect(result).toEqual({
        id: "it-department",
        name: "IT Department",
        color: "#6B7280", // Дефолтный цвет для неизвестного отдела
      });
    });

    it("должен корректно обрабатывать HR отдел", () => {
      const result = getDepartmentInfo("HR");

      expect(result).toEqual({
        id: "hr",
        name: "HR",
        color: "#24D07A",
      });
    });

    it("должен использовать дефолтный цвет для неизвестного отдела", () => {
      const result = getDepartmentInfo("Unknown Department");

      expect(result).toEqual({
        id: "unknown-department",
        name: "Unknown Department",
        color: "#6B7280",
      });
    });
  });

  describe("getDepartmentHierarchyColor", () => {
    it("должен возвращать корректные цвета для уровней 1-5", () => {
      expect(getDepartmentHierarchyColor(1)).toBe("#24D07A");
      expect(getDepartmentHierarchyColor(2)).toBe("#7D5EFA");
      expect(getDepartmentHierarchyColor(3)).toBe("#FF4671");
      expect(getDepartmentHierarchyColor(4)).toBe("#FFAB00");
      expect(getDepartmentHierarchyColor(5)).toBe("#3697FF");
    });

    it("должен возвращать дефолтный цвет для первого уровня, если карта не содержит level 1", () => {
      const customColors: Record<number, string> = {
        2: "#123456",
      };

      expect(getDepartmentHierarchyColor(1, customColors)).toBe("#6B7280");
    });

    it("должен возвращать цвет первого уровня для невалидного уровня", () => {
      expect(getDepartmentHierarchyColor(0)).toBe("#24D07A");
      expect(getDepartmentHierarchyColor(-2)).toBe("#24D07A");
    });

    it("должен возвращать последний доступный цвет для уровней выше 5", () => {
      expect(getDepartmentHierarchyColor(6)).toBe("#3697FF");
      expect(getDepartmentHierarchyColor(10)).toBe("#3697FF");
    });

    it("должен возвращать цвет первого уровня из кастомной карты, если нет прямого совпадения", () => {
      const customColors: Record<number, string> = {
        1: "#111111",
        3: "",
      };

      expect(getDepartmentHierarchyColor(8, customColors)).toBe("#111111");
    });

    it("должен возвращать дефолтный цвет когда карта пустая", () => {
      const emptyColors: Record<number, string> = {};

      expect(getDepartmentHierarchyColor(2, emptyColors)).toBe("#6B7280");
    });

    it("должен возвращать дефолтный цвет когда нет валидных уровней", () => {
      const invalidColors: Record<number, string> = {
        2: "",
      };

      expect(getDepartmentHierarchyColor(4, invalidColors)).toBe("#6B7280");
    });
  });
});
