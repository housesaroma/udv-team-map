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

export const departmentHierarchyColors: Record<number, string> = {
  1: "#24D07A",
  2: "#7D5EFA",
  3: "#FF4671",
  4: "#FFAB00",
  5: "#3697FF",
};

const departmentNameToKey: Record<string, string> = {
  it: "it",
  айти: "it",
  "информационные технологии": "it",
  hr: "hr",
  эйчар: "hr",
  кадры: "hr",
  "человеческие ресурсы": "hr",
  finance: "finance",
  финансовый: "finance",
  "финансовый отдел": "finance",
  финансы: "finance",
  marketing: "marketing",
  маркетинг: "marketing",
  sales: "sales",
  продажи: "sales",
  operations: "operations",
  операционный: "operations",
  операции: "operations",
};

// Маппинг русских названий отделов на ключи
export const departmentNames: Record<string, string> = {
  IT: "it",
  HR: "hr",
  Финансы: "finance",
  Маркетинг: "marketing",
  Продажи: "sales",
  Операционный: "operations",
};

export const getDepartmentColor = (departmentName: string): string => {
  if (!departmentName) return "#6B7280";

  const normalizedName = departmentName.toLowerCase().trim();
  let departmentKey: string | undefined;

  for (const [key, value] of Object.entries(departmentNameToKey)) {
    if (normalizedName.includes(key)) {
      departmentKey = value;
      break;
    }
  }

  return (
    departmentColors[departmentKey as keyof typeof departmentColors] ||
    "#6B7280"
  );
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

export const getDepartmentHierarchyColor = (
  level: number,
  hierarchyColors: Record<number, string> = departmentHierarchyColors
): string => {
  if (level <= 1) {
    return hierarchyColors[1] ?? "#6B7280";
  }

  const directColor = hierarchyColors[level];
  if (directColor) {
    return directColor;
  }

  const colorKeys = Object.keys(hierarchyColors).map(Number);
  if (colorKeys.length === 0) {
    return "#6B7280";
  }

  const highestDefinedLevel = Math.max(...colorKeys);
  const highestLevelColor = hierarchyColors[highestDefinedLevel];
  if (highestLevelColor) {
    return highestLevelColor;
  }

  const baseLevelColor = hierarchyColors[1];
  if (baseLevelColor) {
    return baseLevelColor;
  }

  return "#6B7280";
};
