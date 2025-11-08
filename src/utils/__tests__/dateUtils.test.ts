import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatDate,
  calculateExperience,
  isValidDate,
  getYearsFromDate,
} from "../dateUtils";

describe("dateUtils", () => {
  beforeEach(() => {
    // Мокаем текущую дату для стабильности тестов
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDate", () => {
    it("должен форматировать валидную дату в русском формате", () => {
      const result = formatDate("2024-01-15");
      expect(result).toBe("15.01.2024");
    });

    it("должен возвращать 'Не указано' для undefined", () => {
      const result = formatDate(undefined);
      expect(result).toBe("Не указано");
    });

    it("должен возвращать 'Не указано' для пустой строки", () => {
      const result = formatDate("");
      expect(result).toBe("Не указано");
    });

    it("должен возвращать 'Invalid Date' для невалидной даты (toLocaleDateString поведение)", () => {
      // Примечание: formatDate не проверяет валидность даты перед форматированием
      // toLocaleDateString возвращает "Invalid Date" для невалидных дат
      const result = formatDate("invalid-date");
      // В jsdom/node окружении toLocaleDateString может возвращать "Invalid Date"
      expect(result).toMatch(/Invalid Date/);
    });

    it("должен корректно форматировать разные форматы дат", () => {
      expect(formatDate("2024-12-31")).toBe("31.12.2024");
      expect(formatDate("2023-06-01")).toBe("01.06.2023");
    });
  });

  describe("calculateExperience", () => {
    it("должен рассчитывать стаж в годах и месяцах", () => {
      const result = calculateExperience("2022-01-15");
      // Когда месяцев 0, функция возвращает только годы без "0 мес."
      expect(result).toBe("2 года");
    });

    it("должен рассчитывать стаж только в месяцах, если меньше года", () => {
      const result = calculateExperience("2023-10-15");
      expect(result).toBe("3 мес.");
    });

    it("должен рассчитывать стаж с годами и месяцами", () => {
      const result = calculateExperience("2021-06-15");
      expect(result).toBe("2 года 7 мес.");
    });

    it("должен корректно склонять 'год'", () => {
      const result = calculateExperience("2023-01-15");
      // Когда месяцев 0, функция возвращает только годы
      expect(result).toBe("1 год");
    });

    it("должен корректно склонять 'года'", () => {
      const result = calculateExperience("2022-01-15");
      // Когда месяцев 0, функция возвращает только годы
      expect(result).toBe("2 года");
    });

    it("должен корректно склонять 'лет'", () => {
      const result = calculateExperience("2015-01-15");
      // Когда месяцев 0, функция возвращает только годы
      expect(result).toBe("9 лет");
    });

    it("должен возвращать 'Не указано' для undefined", () => {
      const result = calculateExperience(undefined);
      expect(result).toBe("Не указано");
    });

    it("должен возвращать 'Не указано' для невалидной даты", () => {
      const result = calculateExperience("invalid-date");
      expect(result).toBe("Не указано");
    });

    it("должен возвращать 'Не указано' для даты в будущем", () => {
      const result = calculateExperience("2025-01-15");
      expect(result).toBe("Не указано");
    });

    it("должен учитывать день месяца при расчете", () => {
      // Если текущая дата 15.01.2024, а дата начала 20.01.2023
      // То стаж должен быть меньше на месяц
      const result = calculateExperience("2023-01-20");
      expect(result).toBe("11 мес.");
    });
  });

  describe("isValidDate", () => {
    it("должен возвращать true для валидной даты", () => {
      expect(isValidDate("2024-01-15")).toBe(true);
      expect(isValidDate("2023-12-31")).toBe(true);
    });

    it("должен возвращать false для undefined", () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it("должен возвращать false для пустой строки", () => {
      expect(isValidDate("")).toBe(false);
    });

    it("должен возвращать false для невалидной даты", () => {
      expect(isValidDate("invalid-date")).toBe(false);
      expect(isValidDate("2024-13-45")).toBe(false);
    });
  });

  describe("getYearsFromDate", () => {
    it("должен возвращать количество лет от даты", () => {
      const result = getYearsFromDate("2020-01-15");
      expect(result).toBe(4);
    });

    it("должен возвращать null для undefined", () => {
      const result = getYearsFromDate(undefined);
      expect(result).toBeNull();
    });

    it("должен возвращать null для невалидной даты", () => {
      const result = getYearsFromDate("invalid-date");
      expect(result).toBeNull();
    });

    it("должен возвращать 0 для текущего года", () => {
      const result = getYearsFromDate("2024-12-31");
      expect(result).toBe(0);
    });
  });
});

