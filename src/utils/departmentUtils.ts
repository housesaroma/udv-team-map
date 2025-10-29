import type { DepartmentColors } from "../types";

// Конфигурация цветов отделов из UnoCSS
export const departmentColors: DepartmentColors = {
  it: "#3697FF",
  hr: "#24D07A",
  finance: "#F59E0B",
  marketing: "#FF4671",
  sales: "#7D5EFA",
  operations: "#2DD6C0",
};

// Маппинг русских названий отделов на ключи
const departmentNameToKey: Record<string, string> = {
  it: "it",
  айти: "it",
  "информационные технологии": "it",
  hr: "hr",
  эйчар: "hr",
  кадры: "hr",
  "человеческие ресурсы": "hr",
  finance: "finance",
  финансы: "finance",
  финансовый: "finance",
  marketing: "marketing",
  маркетинг: "marketing",
  sales: "sales",
  продажи: "sales",
  operations: "operations",
  операционный: "operations",
  операции: "operations",
};

export const getDepartmentColor = (departmentName: string): string => {
  if (!departmentName) return "#6B7280";

  const normalizedName = departmentName.toLowerCase().trim();
  const departmentKey = departmentNameToKey[normalizedName];

  return departmentColors[departmentKey] || "#6B7280";
};

export const generateDepartmentId = (departmentName: string): string => {
  if (!departmentName) return "unknown";
  return departmentName.toLowerCase().replaceAll(/\s+/g, "-");
};

export const getDepartmentInfo = (departmentName: string) => {
  return {
    id: generateDepartmentId(departmentName),
    name: departmentName,
    color: getDepartmentColor(departmentName),
  };
};
