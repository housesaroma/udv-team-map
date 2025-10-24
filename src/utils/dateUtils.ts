export const formatDate = (dateString?: string): string => {
    if (!dateString) return "Не указано";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU");
    } catch {
        return "Не указано";
    }
};

export const calculateExperience = (startDateString?: string): string => {
    if (!startDateString) return "Не указано";

    try {
        const startDate = new Date(startDateString);
        const currentDate = new Date();

        // Проверка валидности даты
        if (Number.isNaN(startDate.getTime())) {
            return "Не указано";
        }

        const years = currentDate.getFullYear() - startDate.getFullYear();
        const months = currentDate.getMonth() - startDate.getMonth();

        let totalMonths = years * 12 + months;
        if (currentDate.getDate() < startDate.getDate()) {
            totalMonths--;
        }

        // Если стаж отрицательный (дата в будущем)
        if (totalMonths < 0) {
            return "Не указано";
        }

        const experienceYears = Math.floor(totalMonths / 12);
        const experienceMonths = totalMonths % 12;

        if (experienceYears === 0) {
            return `${experienceMonths} мес.`;
        } else if (experienceMonths === 0) {
            return `${experienceYears} ${getYearsText(experienceYears)}`;
        } else {
            return `${experienceYears} ${getYearsText(
                experienceYears
            )} ${experienceMonths} мес.`;
        }
    } catch {
        return "Не указано";
    }
};

const getYearsText = (years: number): string => {
    if (years % 10 === 1 && years % 100 !== 11) return "год";
    if (
        years % 10 >= 2 &&
        years % 10 <= 4 &&
        (years % 100 < 10 || years % 100 >= 20)
    )
        return "года";
    return "лет";
};

// Дополнительные утилиты для работы с датами
export const isValidDate = (dateString?: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime());
};

export const getYearsFromDate = (dateString?: string): number | null => {
    if (!dateString || !isValidDate(dateString)) return null;

    const date = new Date(dateString);
    const currentDate = new Date();
    return currentDate.getFullYear() - date.getFullYear();
};
