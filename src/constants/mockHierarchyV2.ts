import type { FullHierarchyNode } from "../types/organization";

export const MOCK_HIERARCHY_V2: FullHierarchyNode = {
  hierarchyId: 1,
  level: 1,
  title: "UDV GROUP",
  color: "#000000",
  manager: null,
  employees: [],
  children: [
    {
      hierarchyId: 2,
      level: 2,
      title: "UDV Digital Transformation",
      color: "#FF5733",
      manager: {
        userId: "10000000-0000-0000-0000-000000000001",
        userName: "Смирнова Анна Павловна",
        position: "Директор",
        avatarUrl: "",
        subordinates: [
          {
            userId: "10000000-0000-0000-0000-000000000002",
            userName: "Петров Иван Андреевич",
            position: "Руководитель направления",
            avatarUrl: "",
            subordinates: [],
          },
        ],
      },
      employees: [
        {
          userId: "10000000-0000-0000-0000-000000000010",
          userName: "Иванов Петр Андреевич",
          position: "Аналитик",
          avatarUrl: "",
        },
      ],
      children: [
        {
          hierarchyId: 5,
          level: 3,
          title: "ТриниДата",
          color: "#F39C12",
          manager: null,
          employees: [
            {
              userId: "10000000-0000-0000-0000-000000000020",
              userName: "Фадеев Никита Максимович",
              position: "Разработчик",
              avatarUrl: "",
            },
          ],
          children: [],
        },
        {
          hierarchyId: 6,
          level: 3,
          title: "ФТ-СОФТ",
          color: "#F39C12",
          manager: {
            userId: "10000000-0000-0000-0000-000000000021",
            userName: "Козлов Дмитрий Сергеевич",
            position: "Руководитель",
            avatarUrl: "",
            subordinates: [
              {
                userId: "10000000-0000-0000-0000-000000000022",
                userName: "Морозова Елена Дмитриевна",
                position: "Руководитель проектов",
                avatarUrl: "",
                subordinates: [],
              },
            ],
          },
          employees: [
            {
              userId: "10000000-0000-0000-0000-000000000023",
              userName: "Сидоров Константин Петрович",
              position: "Инженер",
              avatarUrl: "",
            },
          ],
          children: [
            {
              hierarchyId: 44,
              level: 4,
              title: "Направление Аналитики",
              color: "#95A5A6",
              manager: null,
              employees: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      hierarchyId: 3,
      level: 2,
      title: "UDV Security",
      color: "#3498DB",
      manager: null,
      employees: [],
      children: [
        {
          hierarchyId: 8,
          level: 3,
          title: "КИТ",
          color: "#8E44AD",
          manager: null,
          employees: [
            {
              userId: "10000000-0000-0000-0000-000000000030",
              userName: "Кузнецов Андрей Олегович",
              position: "Консультант",
              avatarUrl: "",
            },
            {
              userId: "10000000-0000-0000-0000-000000000031",
              userName: "Лебедев Николай Викторович",
              position: "Аналитик",
              avatarUrl: "",
            },
          ],
          children: [],
        },
      ],
    },
  ],
};
