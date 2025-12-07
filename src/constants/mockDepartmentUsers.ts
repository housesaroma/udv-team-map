import type { DepartmentUsersResponse } from "../types/organization";

export const MOCK_DEPARTMENT_USERS: Record<number, DepartmentUsersResponse> = {
  44: {
    hierarchyId: 44,
    title: "Направление Аналитики и документации",
    manager: {
      userId: "10000000-0000-0000-0000-000000000044",
      userName: "Смирнова Анна Павловна",
      position: "Руководитель",
      avatarUrl: "",
      subordinates: [
        {
          userId: "10000000-0000-0000-0000-000000000045",
          userName: "Петров Иван Андреевич",
          position: "Аналитик",
          avatarUrl: "",
          subordinates: [
            {
              userId: "10000000-0000-0000-0000-000000000105",
              userName: "Иванов Петр Андреевич",
              position: "Аналитик",
              avatarUrl: "",
              subordinates: [],
            },
          ],
        },
      ],
    },
    employees: [
      {
        userId: "10000000-0000-0000-0000-000000000045",
        userName: "Петров Иван Андреевич",
        position: "Аналитик",
        avatarUrl: "",
      },
      {
        userId: "10000000-0000-0000-0000-000000000105",
        userName: "Иванов Петр Андреевич",
        position: "Аналитик",
        avatarUrl: "",
      },
    ],
  },
};

export const getMockDepartmentUsers = (
  hierarchyId: number
): DepartmentUsersResponse => {
  if (MOCK_DEPARTMENT_USERS[hierarchyId]) {
    return MOCK_DEPARTMENT_USERS[hierarchyId];
  }

  const [firstKey] = Object.keys(MOCK_DEPARTMENT_USERS);
  if (!firstKey) {
    throw new Error("Нет мок-данных для пользователей отделов");
  }

  return MOCK_DEPARTMENT_USERS[Number(firstKey)];
};
