import type { OrganizationHierarchy } from "../types/organization";

// Мок-данные для тестирования
export const MOCK_HIERARCHY: OrganizationHierarchy = {
    ceo: {
        userId: "11111111-1111-1111-1111-111111111111",
        userName: "Иванов Александр Петрович",
        position: "Генеральный директор",
        avatarUrl: "",
        subordinates: [],
        department: "IT",
    },
    departments: [
        {
            department: "IT",
            employees: [
                {
                    userId: "33333333-3333-3333-3333-333333333333",
                    userName: "Сидоров Дмитрий Игоревич",
                    position: "Технический директор",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "55555555-5555-5555-5555-555555555555",
                            userName: "Васильев Андрей Николаевич",
                            position: "Руководитель разработки",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                                    userName: "Новиков Павел Викторович",
                                    position: "Team Lead Backend",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
                                            userName: "Орлова Анна Дмитриевна",
                                            position:
                                                "Senior Backend разработчик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
                                            userName:
                                                "Ткаченко Владимир Сергеевич",
                                            position:
                                                "Middle Backend разработчик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                                {
                                    userId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
                                    userName: "Жуков Алексей Борисович",
                                    position: "Team Lead Frontend",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
                                            userName: "Мельников Артем Юрьевич",
                                            position:
                                                "Senior Frontend разработчик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                                            userName:
                                                "Попова Светлана Витальевна",
                                            position:
                                                "Middle Frontend разработчик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                                {
                                    userId: "bbbbbbbb-1111-1111-1111-111111111111",
                                    userName: "Семенов Игорь Васильевич",
                                    position: "Team Lead Mobile",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "bbbbbbbb-2222-2222-2222-222222222222",
                                            userName:
                                                "Ковалева Марина Сергеевна",
                                            position: "Senior iOS разработчик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "bbbbbbbb-3333-3333-3333-333333333333",
                                            userName:
                                                "Никитин Алексей Владимирович",
                                            position:
                                                "Senior Android разработчик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            userId: "77777777-7777-7777-7777-777777777777",
                            userName: "Громов Сергей Олегович",
                            position: "Руководитель инфраструктуры",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "11111111-2222-3333-4444-777777777777",
                                    userName: "Федоров Михаил Павлович",
                                    position: "Lead системный администратор",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "22222222-3333-4444-5555-666666666666",
                                            userName:
                                                "Кузнецов Роман Анатольевич",
                                            position: "Senior DBA",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "33333333-4444-5555-6666-777777777777",
                                            userName:
                                                "Семенова Татьяна Игоревна",
                                            position: "Сетевой инженер",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                                {
                                    userId: "44444444-4444-4444-4444-444444444444",
                                    userName: "Козлова Елена Владимировна",
                                    position: "DevOps инженер",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "55555555-6666-7777-8888-999999999999",
                                            userName:
                                                "Воронова Надежда Львовна",
                                            position: "Junior DevOps",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            userId: "66666666-6666-6666-6666-666666666666",
                            userName: "Морозова Ирина Александровна",
                            position: "QA Manager",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "77777777-8888-9999-0000-111111111111",
                                    userName: "Белов Андрей Николаевич",
                                    position: "Lead QA инженер",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "88888888-9999-0000-1111-222222222222",
                                            userName:
                                                "Захарова Ольга Викторовна",
                                            position: "Senior QA",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "99999999-0000-1111-2222-333333333333",
                                            userName: "Тимофеев Денис Олегович",
                                            position: "Automation QA",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            department: "Финансы",
            employees: [
                {
                    userId: "22222222-2222-2222-2222-222222222222",
                    userName: "Петрова Ольга Сергеевна",
                    position: "Финансовый директор",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                            userName: "Соколов Артем Викторович",
                            position: "Начальник финансового отдела",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
                                    userName: "Калинина Ирина Сергеевна",
                                    position: "Старший финансовый аналитик",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "cccccccc-dddd-eeee-ffff-000000000000",
                                            userName:
                                                "Максимов Павел Андреевич",
                                            position: "Финансовый аналитик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "dddddddd-eeee-ffff-0000-111111111111",
                                            userName:
                                                "Григорьева Елена Владимировна",
                                            position: "Финансовый аналитик",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            userId: "eeeeeeee-ffff-0000-1111-222222222222",
                            userName: "Лебедев Дмитрий Олегович",
                            position: "Начальник отдела бухгалтерии",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "ffffffff-0000-1111-2222-333333333333",
                                    userName: "Лебедева Мария Андреевна",
                                    position: "Главный бухгалтер",
                                    avatarUrl: "",
                                    subordinates: [
                                        {
                                            userId: "00000000-1111-2222-3333-444444444444",
                                            userName:
                                                "Данилова Екатерина Валерьевна",
                                            position: "Бухгалтер по зарплате",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                        {
                                            userId: "11111111-2222-3333-4444-555555555555",
                                            userName: "Фролов Иван Петрович",
                                            position: "Бухгалтер по налогам",
                                            avatarUrl: "",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            department: "HR",
            employees: [
                {
                    userId: "22222222-4444-6666-8888-000000000000",
                    userName: "Волкова Татьяна Михайловна",
                    position: "HR директор",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "33333333-5555-7777-9999-111111111111",
                            userName: "Алексеев Сергей Владимирович",
                            position: "HR Business Partner",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "44444444-6666-8888-0000-222222222222",
                                    userName: "Савельева Юлия Романовна",
                                    position: "HR специалист",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "55555555-7777-9999-1111-333333333333",
                                    userName: "Крылов Антон Игоревич",
                                    position: "Recruiter",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                        {
                            userId: "66666666-8888-0000-2222-444444444444",
                            userName: "Орлов Максим Александрович",
                            position: "Learning & Development Manager",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "77777777-9999-1111-3333-555555555555",
                                    userName: "Медведева Анастасия Сергеевна",
                                    position: "Корпоративный тренер",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            department: "Маркетинг",
            employees: [
                {
                    userId: "88888888-aaaa-cccc-eeee-111111111111",
                    userName: "Комаров Алексей Николаевич",
                    position: "Директор по маркетингу",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "99999999-bbbb-dddd-ffff-222222222222",
                            userName: "Ильина Вероника Олеговна",
                            position: "Менеджер по продукту",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "aaaaaaa1-cccc-eeee-1111-333333333333",
                                    userName: "Борисов Кирилл Андреевич",
                                    position: "Product Analyst",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "aaaaaaa2-dddd-ffff-2222-444444444444",
                                    userName: "Зайцева Марина Викторовна",
                                    position: "UX Researcher",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                        {
                            userId: "aaaaaaa3-eeee-1111-3333-555555555555",
                            userName: "Щербаков Денис Сергеевич",
                            position: "Digital Marketing Manager",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "aaaaaaa4-ffff-2222-4444-666666666666",
                                    userName: "Мартынова Ольга Игоревна",
                                    position: "SMM специалист",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "aaaaaaa5-1111-3333-5555-777777777777",
                                    userName: "Силин Артем Владимирович",
                                    position: "PPC специалист",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            department: "Продажи",
            employees: [
                {
                    userId: "bbbbbbb1-2222-4444-6666-888888888888",
                    userName: "Тихонов Михаил Александрович",
                    position: "Директор по продажам",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "bbbbbbb2-3333-5555-7777-999999999999",
                            userName: "Соловьева Екатерина Дмитриевна",
                            position: "Руководитель отдела продаж",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "bbbbbbb3-4444-6666-8888-aaaaaaaaaaaa",
                                    userName: "Кузьмин Андрей Викторович",
                                    position: "Senior Sales Manager",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "bbbbbbb4-5555-7777-9999-bbbbbbbbbbbb",
                                    userName: "Филиппова Алина Сергеевна",
                                    position: "Sales Manager",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                        {
                            userId: "bbbbbbb5-6666-8888-aaaa-cccccccccccc",
                            userName: "Герасимов Иван Олегович",
                            position: "Account Manager",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "bbbbbbb6-7777-9999-bbbb-dddddddddddd",
                                    userName: "Давыдова Анна Михайловна",
                                    position: "Key Account Manager",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            department: "Операционный отдел",
            employees: [
                {
                    userId: "ccccccc1-3333-6666-9999-222222222222",
                    userName: "Макаров Виктор Николаевич",
                    position: "Операционный директор",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "ccccccc2-4444-7777-aaaa-333333333333",
                            userName: "Киселева Людмила Петровна",
                            position: "Менеджер по проектам",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "ccccccc3-5555-8888-bbbb-444444444444",
                                    userName: "Егоров Станислав Владимирович",
                                    position: "Project Coordinator",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                        {
                            userId: "ccccccc4-6666-9999-cccc-555555555555",
                            userName: "Щукин Александр Игоревич",
                            position: "Service Delivery Manager",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "ccccccc5-7777-aaaa-dddd-666666666666",
                                    userName: "Ларина Виктория Андреевна",
                                    position: "Support Specialist",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    totalEmployees: 55,
};
