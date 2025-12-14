import type { TourStep } from "./OnboardingTour";
import type { UserRole } from "../../../types";

/**
 * Расширенный тип шага тура с ролями
 */
export interface TourStepWithRoles extends TourStep {
  /** Роли, которым доступен этот шаг. Если не указано - доступен всем */
  roles?: UserRole[];
}

/**
 * Шаги интерактивного тура для первого знакомства с системой
 * Каждый target должен соответствовать CSS селектору элемента на странице
 * Шаги с roles будут показаны только пользователям с соответствующими ролями
 */
export const tourSteps: TourStepWithRoles[] = [
  {
    target: "[data-tour='logo']",
    title: "Добро пожаловать в UDV Team Map!",
    content:
      "Это интерактивная карта организационной структуры компании. Давайте познакомимся с основными возможностями.",
    placement: "bottom",
    // Доступен всем - roles не указан
  },
  {
    target: "[data-tour='organization-tree']",
    title: "Карта организации",
    content:
      "Здесь отображается структура компании. Вы можете перемещаться по карте, приближать и отдалять её.",
    placement: "right",
    // Доступен всем
  },
  {
    target: "[data-tour='zoom-controls']",
    title: "Управление масштабом",
    content:
      "Используйте эти кнопки для масштабирования карты. Также работают горячие клавиши: Ctrl+Plus, Ctrl+Minus, Ctrl+0.",
    placement: "left",
    // Доступен всем
  },
  {
    target: "[data-tour='tree-editor-button']",
    title: "Редактирование структуры",
    content:
      "Здесь вы можете перейти к редактированию организационной структуры компании.",
    placement: "bottom",
    roles: ["hr", "admin"], // Для HR и админов
  },
  {
    target: "[data-tour='admin-button']",
    title: "Панель администратора",
    content:
      "Панель управления сотрудниками и модерации фотографий. Здесь вы можете редактировать данные сотрудников.",
    placement: "bottom",
    roles: ["hr", "admin"], // Только для HR и админов
  },
  {
    target: "[data-tour='about-button']",
    title: "Справка и обучение",
    content:
      "Здесь вы найдёте информацию о системе и видеоуроки по работе с ней. Рекомендуем посмотреть!",
    placement: "bottom",
    // Доступен всем
  },
  {
    target: "[data-tour='profile-button']",
    title: "Ваш профиль",
    content:
      "Нажмите сюда, чтобы перейти в свой профиль, отредактировать информацию и контакты.",
    placement: "bottom",
    // Доступен всем
  },
];

/**
 * Фильтрует шаги тура по роли пользователя
 * @param userRole - роль текущего пользователя
 * @returns отфильтрованные шаги тура
 */
export const filterTourStepsByRole = (
  userRole: UserRole
): TourStepWithRoles[] => {
  return tourSteps.filter(step => {
    // Если roles не указан - шаг доступен всем
    if (!step.roles || step.roles.length === 0) {
      return true;
    }
    // Иначе проверяем, есть ли роль пользователя в списке
    return step.roles.includes(userRole);
  });
};

export default tourSteps;
