import type { ApiUserProfile, DepartmentColors, User } from "../types";
import { BASE_URL } from "./apiConstants";

const API_USERS = `${BASE_URL}/api/Users`;

// Типы для ответа API
export interface UsersResponse {
    amountOfUsers: number;
    users: ApiUserProfile[];
}

// Вспомогательная функция для преобразования ApiUserProfile в User
const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
    const nameParts = apiUser.userName.split(" ");

    // Определяем цвет департамента
    const departmentColors: DepartmentColors = {
        it: "#3697FF",
        hr: "#24D07A",
        finance: "#F59E0B",
        marketing: "#FF4671",
        sales: "#7D5EFA",
        operations: "#2DD6C0",
    };

    const departmentName = apiUser.department.toLowerCase();
    const departmentColor = departmentColors[departmentName] || "#6B7280";

    return {
        id: apiUser.user_id,
        firstName: nameParts[1] || "", // Имя
        lastName: nameParts[0] || "", // Фамилия
        middleName: nameParts[2] || "", // Отчество
        position: apiUser.position,
        department: {
            id: departmentName,
            name: apiUser.department,
            color: departmentColor,
        },
        avatar: apiUser.avatar,
        phone: apiUser.phoneNumber,
        city: apiUser.city,
        interests: apiUser.interests,
        birthDate: apiUser.bornDate,
        // workExperience преобразуется в hireDate (нужно будет вычислить)
        hireDate: apiUser.workExperience,
        messengerLink:
            apiUser.contacts.telegram?.[0] || apiUser.contacts.skype?.[0],
    };
};

// Мок-данные для админ панели в формате ApiUserProfile
const MOCK_USERS_RESPONSE: UsersResponse = {
    amountOfUsers: 20,
    users: [
        {
            user_id: "11111111-1111-1111-1111-111111111111",
            userName: "Иванов Александр Петрович",
            bornDate: "1980-05-15",
            department: "IT",
            position: "Генеральный директор",
            workExperience: "2010-01-15",
            phoneNumber: "+7 (999) 123-45-67",
            city: "Москва",
            interests: "Горные лыжи, программирование",
            avatar: "",
            contacts: {
                skype: ["ivanov.alex"],
                telegram: ["@ivanov_alex"],
            },
        },
        {
            user_id: "33333333-3333-3333-3333-333333333333",
            userName: "Сидоров Дмитрий Игоревич",
            bornDate: "1985-08-20",
            department: "IT",
            position: "Технический директор",
            workExperience: "2012-03-10",
            phoneNumber: "+7 (999) 123-45-68",
            city: "Москва",
            interests: "Футбол, автомобили",
            avatar: "",
            contacts: {
                skype: ["sidorov.dmitry"],
                telegram: ["@sidorov_dmitry"],
            },
        },
        {
            user_id: "55555555-5555-5555-5555-555555555555",
            userName: "Васильев Андрей Николаевич",
            bornDate: "1988-12-03",
            department: "IT",
            position: "Руководитель разработки",
            workExperience: "2014-07-22",
            phoneNumber: "+7 (999) 123-45-69",
            city: "Москва",
            interests: "Шахматы, книги",
            avatar: "",
            contacts: {
                skype: ["vasilyev.andrey"],
                telegram: ["@vasilyev_andrey"],
            },
        },
        {
            user_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            userName: "Новиков Павел Викторович",
            bornDate: "1990-03-25",
            department: "IT",
            position: "Senior разработчик",
            workExperience: "2016-09-14",
            phoneNumber: "+7 (999) 123-45-70",
            city: "Москва",
            interests: "Велоспорт, музыка",
            avatar: "",
            contacts: {
                skype: ["novikov.pavel"],
                telegram: ["@novikov_pavel"],
            },
        },
        {
            user_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
            userName: "Орлова Анна Дмитриевна",
            bornDate: "1992-07-18",
            department: "IT",
            position: "UX/UI дизайнер",
            workExperience: "2017-11-05",
            phoneNumber: "+7 (999) 123-45-71",
            city: "Москва",
            interests: "Рисование, путешествия",
            avatar: "",
            contacts: {
                skype: ["orlova.anna"],
                telegram: ["@orlova_anna"],
            },
        },
        {
            user_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
            userName: "Ткаченко Владимир Сергеевич",
            bornDate: "1991-01-30",
            department: "IT",
            position: "QA инженер",
            workExperience: "2018-02-20",
            phoneNumber: "+7 (999) 123-45-72",
            city: "Москва",
            interests: "Фотография, кино",
            avatar: "",
            contacts: {
                skype: ["tkachenko.vladimir"],
                telegram: ["@tkachenko_vladimir"],
            },
        },
        {
            user_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
            userName: "Жуков Алексей Борисович",
            bornDate: "1989-09-12",
            department: "IT",
            position: "Mobile разработчик",
            workExperience: "2015-06-08",
            phoneNumber: "+7 (999) 123-45-73",
            city: "Москва",
            interests: "Мобильные технологии, спорт",
            avatar: "",
            contacts: {
                skype: ["zhukov.alexey"],
                telegram: ["@zhukov_alexey"],
            },
        },
        {
            user_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
            userName: "Мельников Артем Юрьевич",
            bornDate: "1993-04-05",
            department: "IT",
            position: "Frontend разработчик",
            workExperience: "2019-08-15",
            phoneNumber: "+7 (999) 123-45-74",
            city: "Москва",
            interests: "Веб-технологии, видеоигры",
            avatar: "",
            contacts: {
                skype: ["melnikov.artem"],
                telegram: ["@melnikov_artem"],
            },
        },
        {
            user_id: "77777777-7777-7777-7777-777777777777",
            userName: "Громов Сергей Олегович",
            bornDate: "1987-11-28",
            department: "IT",
            position: "Системный администратор",
            workExperience: "2013-04-12",
            phoneNumber: "+7 (999) 123-45-75",
            city: "Москва",
            interests: "Серверы, железо",
            avatar: "",
            contacts: {
                skype: ["gromov.sergey"],
                telegram: ["@gromov_sergey"],
            },
        },
        {
            user_id: "11111111-2222-3333-4444-555555555555",
            userName: "Федоров Михаил Павлович",
            bornDate: "1994-06-14",
            department: "IT",
            position: "Сетевой администратор",
            workExperience: "2020-01-10",
            phoneNumber: "+7 (999) 123-45-76",
            city: "Москва",
            interests: "Сети, кибербезопасность",
            avatar: "",
            contacts: {
                skype: ["fedorov.mikhail"],
                telegram: ["@fedorov_mikhail"],
            },
        },
        {
            user_id: "22222222-3333-4444-5555-666666666666",
            userName: "Кузнецов Роман Анатольевич",
            bornDate: "1986-02-19",
            department: "IT",
            position: "DBA",
            workExperience: "2011-11-03",
            phoneNumber: "+7 (999) 123-45-77",
            city: "Москва",
            interests: "Базы данных, оптимизация",
            avatar: "",
            contacts: {
                skype: ["kuznetsov.roman"],
                telegram: ["@kuznetsov_roman"],
            },
        },
        {
            user_id: "22222222-2222-2222-2222-222222222222",
            userName: "Петрова Ольга Сергеевна",
            bornDate: "1983-10-08",
            department: "Финансы",
            position: "Финансовый директор",
            workExperience: "2009-08-22",
            phoneNumber: "+7 (999) 123-45-78",
            city: "Москва",
            interests: "Финансы, инвестиции",
            avatar: "",
            contacts: {
                skype: ["petrova.olga"],
                telegram: ["@petrova_olga"],
            },
        },
        {
            user_id: "44444444-4444-4444-4444-444444444444",
            userName: "Козлова Елена Владимировна",
            bornDate: "1984-12-25",
            department: "Финансы",
            position: "Начальник отдела бухгалтерии",
            workExperience: "2010-05-14",
            phoneNumber: "+7 (999) 123-45-79",
            city: "Москва",
            interests: "Бухгалтерия, налоги",
            avatar: "",
            contacts: {
                skype: ["kozlova.elena"],
                telegram: ["@kozlova_elena"],
            },
        },
        {
            user_id: "88888888-8888-8888-8888-888888888888",
            userName: "Лебедева Мария Андреевна",
            bornDate: "1990-08-17",
            department: "Финансы",
            position: "Главный бухгалтер",
            workExperience: "2015-03-30",
            phoneNumber: "+7 (999) 123-45-80",
            city: "Москва",
            interests: "Аудит, отчетность",
            avatar: "",
            contacts: {
                skype: ["lebedeva.maria"],
                telegram: ["@lebedeva_maria"],
            },
        },
        {
            user_id: "99999999-9999-9999-9999-999999999999",
            userName: "Данилова Екатерина Валерьевна",
            bornDate: "1995-03-22",
            department: "Финансы",
            position: "Бухгалтер",
            workExperience: "2021-07-11",
            phoneNumber: "+7 (999) 123-45-81",
            city: "Москва",
            interests: "Цифровизация, автоматизация",
            avatar: "",
            contacts: {
                skype: ["danilova.ekaterina"],
                telegram: ["@danilova_ekaterina"],
            },
        },
        {
            user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            userName: "Попова Светлана Витальевна",
            bornDate: "1988-07-04",
            department: "Финансы",
            position: "Экономист",
            workExperience: "2016-09-28",
            phoneNumber: "+7 (999) 123-45-82",
            city: "Москва",
            interests: "Экономика, аналитика",
            avatar: "",
            contacts: {
                skype: ["popova.svetlana"],
                telegram: ["@popova_svetlana"],
            },
        },
        {
            user_id: "66666666-6666-6666-6666-666666666666",
            userName: "Морозова Ирина Александровна",
            bornDate: "1982-04-11",
            department: "HR",
            position: "HR менеджер",
            workExperience: "2008-12-01",
            phoneNumber: "+7 (999) 123-45-83",
            city: "Москва",
            interests: "Психология, рекрутинг",
            avatar: "",
            contacts: {
                skype: ["morozova.irina"],
                telegram: ["@morozova_irina"],
            },
        },
        {
            user_id: "33333333-4444-5555-6666-777777777777",
            userName: "Семенова Татьяна Игоревна",
            bornDate: "1991-11-09",
            department: "HR",
            position: "HR специалист",
            workExperience: "2017-04-18",
            phoneNumber: "+7 (999) 123-45-84",
            city: "Москва",
            interests: "Обучение, развитие",
            avatar: "",
            contacts: {
                skype: ["semenova.tatiana"],
                telegram: ["@semenova_tatiana"],
            },
        },
        {
            user_id: "44444444-5555-6666-7777-888888888888",
            userName: "Савельева Юлия Романовна",
            bornDate: "1993-02-14",
            department: "HR",
            position: "Специалист по кадрам",
            workExperience: "2019-10-23",
            phoneNumber: "+7 (999) 123-45-85",
            city: "Москва",
            interests: "Кадровое делопроизводство",
            avatar: "",
            contacts: {
                skype: ["savelyeva.yulia"],
                telegram: ["@savelyeva_yulia"],
            },
        },
        {
            user_id: "55555555-6666-7777-8888-999999999999",
            userName: "Воронова Надежда Львовна",
            bornDate: "1989-09-30",
            department: "HR",
            position: "Тренер",
            workExperience: "2014-08-07",
            phoneNumber: "+7 (999) 123-45-86",
            city: "Москва",
            interests: "Обучение, коучинг",
            avatar: "",
            contacts: {
                skype: ["voronova.nadezhda"],
                telegram: ["@voronova_nadezhda"],
            },
        },
    ],
};

// Флаг для переключения между моком и бэкендом
const USE_MOCK_DATA = true; // Переключите на false для использования бэкенда

export const adminService = {
    async getUsers(): Promise<UsersResponse> {
        // Если используем мок-данные, возвращаем их сразу
        if (USE_MOCK_DATA) {
            console.log("📁 Используются мок-данные пользователей");
            return MOCK_USERS_RESPONSE;
        }

        // Иначе загружаем с бэкенда
        console.log("🌐 Загрузка данных пользователей с бэкенда...");
        try {
            const response = await fetch(API_USERS);

            if (!response.ok) {
                throw new Error(
                    `Ошибка загрузки пользователей: ${response.status}`
                );
            }

            const data: UsersResponse = await response.json();
            return data;
        } catch (error) {
            console.error(
                "Ошибка загрузки с бэкенда, используем мок-данные:",
                error
            );
            return MOCK_USERS_RESPONSE;
        }
    },

    // Метод для получения пользователей в формате User (трансформированном)
    async getUsersTransformed(): Promise<User[]> {
        const response = await this.getUsers();
        return response.users.map(transformApiUserToUser);
    },

    // Метод для получения текущего режима
    isUsingMockData(): boolean {
        return USE_MOCK_DATA;
    },
};
