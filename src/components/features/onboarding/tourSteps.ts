import type { TourStep } from "./OnboardingTour";
import type { UserRole } from "../../../types";
import { ROUTES } from "../../../constants/routes";

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
 * Шаги с requiresClick требуют клика на элемент для перехода далее
 */
export const tourSteps: TourStepWithRoles[] = [
  {
    target: "[data-tour='logo']",
    title: "Добро пожаловать в UDV Team Map!",
    content:
      "Это интерактивная карта организационной структуры компании. Давайте познакомимся с основными возможностями.",
    placement: "bottom",
    route: ROUTES.root,
    // Доступен всем - roles не указан
  },
  {
    target: "[data-tour='logo']",
    title: "Карта организации",
    content:
      "Здесь отображается структура компании. Вы можете перемещаться по карте, приближать и отдалять её.",
    placement: "bottom",
    route: ROUTES.root,
    disableScroll: true, // Не скроллим, чтобы карта оставалась на месте
    highlightContent: true, // Затемняем только header, оставляя карту в фокусе
    // Доступен всем
  },
  {
    target: "[data-tour='zoom-controls']",
    title: "Управление масштабом",
    content:
      'Используйте эти кнопки для масштабирования карты. Также работают горячие клавиши: Ctrl + "+", Ctrl + "-", Ctrl + "0".',
    placement: "left",
    route: ROUTES.root,
    // Доступен всем
  },
  {
    target: "[data-tour='tree-editor-button']",
    title: "Редактирование структуры",
    content:
      "Нажмите на эту кнопку, чтобы перейти к редактированию организационной структуры компании.",
    placement: "bottom",
    route: ROUTES.root,
    roles: ["hr", "admin"],
    requiresClick: true,
    nextRoute: ROUTES.treeEditor,
  },
  {
    target: "[data-tour='logo']",
    title: "Редактор структуры",
    content:
      "На этой странице вы можете редактировать иерархию организации: добавлять, перемещать и удалять подразделения.",
    placement: "bottom",
    route: ROUTES.treeEditor,
    roles: ["hr", "admin"],
    disableScroll: true,
    highlightContent: true, // Фокус на редакторе структуры
  },
  {
    target: "[data-tour='logo']",
    title: "Возврат на главную",
    content: "Нажмите на логотип, чтобы вернуться на главную страницу.",
    placement: "bottom",
    route: ROUTES.treeEditor,
    roles: ["hr", "admin"],
    requiresClick: true,
    nextRoute: ROUTES.root,
  },
  {
    target: "[data-tour='admin-button']",
    title: "Панель администратора",
    content: "Нажмите сюда, чтобы открыть панель управления сотрудниками.",
    placement: "bottom",
    route: ROUTES.root,
    roles: ["hr", "admin"],
    requiresClick: true,
    nextRoute: ROUTES.admin,
  },
  {
    target: "[data-tour='logo']",
    title: "Панель администратора",
    content:
      "Здесь вы можете редактировать данные сотрудников такие как подразделение и должность. А также искать нужных сотрудников в компании.",
    placement: "bottom",
    route: ROUTES.admin,
    roles: ["hr", "admin"],
    disableScroll: true,
    highlightContent: true, // Фокус на панели администратора
  },
  {
    target: "[data-tour='logo']",
    title: "Возврат на главную",
    content: "Нажмите на логотип, чтобы вернуться на главную страницу.",
    placement: "bottom",
    route: ROUTES.admin,
    roles: ["hr", "admin"],
    requiresClick: true,
    nextRoute: ROUTES.root,
  },
  {
    target: "[data-tour='admin-button']",
    title: "Таблица сотрудников",
    content:
      "Нажмите сюда, чтобы открыть таблицу всех сотрудников компании. Здесь можно искать коллег, смотреть их подразделения и должности.",
    placement: "bottom",
    route: ROUTES.root,
    roles: ["employee"],
    requiresClick: true,
    nextRoute: ROUTES.admin,
  },
  {
    target: "[data-tour='logo']",
    title: "Таблица сотрудников",
    content:
      "В этой таблице вы можете найти любого сотрудника компании, отфильтровать по отделу или должности, и посмотреть контактную информацию.",
    placement: "bottom",
    route: ROUTES.admin,
    roles: ["employee"],
    disableScroll: true,
    highlightContent: true,
  },
  {
    target: "[data-tour='logo']",
    title: "Возврат на главную",
    content: "Нажмите на логотип, чтобы вернуться на главную страницу.",
    placement: "bottom",
    route: ROUTES.admin,
    roles: ["employee"],
    requiresClick: true,
    nextRoute: ROUTES.root,
  },
  {
    target: "[data-tour='profile-button']",
    title: "Ваш профиль",
    content: "Нажмите сюда, чтобы перейти в свой профиль.",
    placement: "bottom",
    route: ROUTES.root,
    requiresClick: true,
    nextRoute: ROUTES.profile.root,
  },
  {
    target: "[data-tour='logo']",
    title: "Страница профиля",
    content:
      "Здесь вы можете просмотреть и отредактировать свою информацию.",
    placement: "bottom",
    route: ROUTES.profile.root,
    disableScroll: true,
    highlightContent: true, // Фокус на странице профиля
  },
  {
    target: "[data-tour='logo']",
    title: "Возврат на главную",
    content:
      "Нажмите на логотип, чтобы вернуться на главную страницу и завершить знакомство.",
    placement: "bottom",
    route: ROUTES.profile.root,
    requiresClick: true,
    nextRoute: ROUTES.root,
  },
  {
    target: "[data-tour='about-button']",
    title: "Справка и обучение",
    content:
      "Здесь вы найдёте информацию о системе и видеоуроки по работе с ней. Вы всегда можете запустить этот тур ещё раз из данного раздела. Рекомендуем посмотреть!",
    placement: "bottom",
    route: ROUTES.root,
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
