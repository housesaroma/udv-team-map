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
                                    position: "Senior разработчик",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
                                    userName: "Орлова Анна Дмитриевна",
                                    position: "UX/UI дизайнер",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
                                    userName: "Ткаченко Владимир Сергеевич",
                                    position: "QA инженер",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
                                    userName: "Жуков Алексей Борисович",
                                    position: "Mobile разработчик",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
                                    userName: "Мельников Артем Юрьевич",
                                    position: "Frontend разработчик",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                            ],
                        },
                        {
                            userId: "77777777-7777-7777-7777-777777777777",
                            userName: "Громов Сергей Олегович",
                            position: "Системный администратор",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "11111111-2222-3333-4444-555555555555",
                                    userName: "Федоров Михаил Павлович",
                                    position: "Сетевой администратор",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "22222222-3333-4444-5555-666666666666",
                                    userName: "Кузнецов Роман Анатольевич",
                                    position: "DBA",
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
            department: "Финансы",
            employees: [
                {
                    userId: "22222222-2222-2222-2222-222222222222",
                    userName: "Петрова Ольга Сергеевна",
                    position: "Финансовый директор",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "44444444-4444-4444-4444-444444444444",
                            userName: "Козлова Елена Владимировна",
                            position: "Начальник отдела бухгалтерии",
                            avatarUrl: "",
                            subordinates: [
                                {
                                    userId: "88888888-8888-8888-8888-888888888888",
                                    userName: "Лебедева Мария Андреевна",
                                    position: "Главный бухгалтер",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "99999999-9999-9999-9999-999999999999",
                                    userName: "Данилова Екатерина Валерьевна",
                                    position: "Бухгалтер",
                                    avatarUrl: "",
                                    subordinates: [],
                                },
                                {
                                    userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                                    userName: "Попова Светлана Витальевна",
                                    position: "Экономист",
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
            department: "HR",
            employees: [
                {
                    userId: "66666666-6666-6666-6666-666666666666",
                    userName: "Морозова Ирина Александровна",
                    position: "HR менеджер",
                    avatarUrl: "",
                    subordinates: [
                        {
                            userId: "33333333-4444-5555-6666-777777777777",
                            userName: "Семенова Татьяна Игоревна",
                            position: "HR специалист",
                            avatarUrl: "",
                            subordinates: [],
                        },
                        {
                            userId: "44444444-5555-6666-7777-888888888888",
                            userName: "Савельева Юлия Романовна",
                            position: "Специалист по кадрам",
                            avatarUrl: "",
                            subordinates: [],
                        },
                        {
                            userId: "55555555-6666-7777-8888-999999999999",
                            userName: "Воронова Надежда Львовна",
                            position: "Тренер",
                            avatarUrl: "",
                            subordinates: [],
                        },
                    ],
                },
            ],
        },
    ],
    totalEmployees: 20,
};