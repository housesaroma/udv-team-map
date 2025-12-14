import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLoader } from "../components/ui/PageLoader";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { adminService } from "../services/adminService";
import { userService, updateUserProfile } from "../services/userService";
import type { MessengerType, User, UserContacts } from "../types";
import type { SelectOption } from "../types/ui";
import { calculateExperience, formatDate } from "../utils/dateUtils";
import { getDepartmentColor } from "../utils/departmentUtils";
import { ROUTES } from "../constants/routes";
import {
  MESSENGER_OPTIONS,
  ALL_MESSENGER_TYPES,
  type MessengerOption,
} from "../constants/messengerOptions";

// Хелпер для рендеринга иконки мессенджера
const MessengerIcon: React.FC<{
  option: MessengerOption;
  className?: string;
}> = ({ option, className = "" }) => {
  if (option.iconImage) {
    return (
      <img
        src={option.iconImage}
        alt={option.label}
        className={`w-5 h-5 object-contain ${className}`}
      />
    );
  }
  return <i className={`${option.icon} ${className}`}></i>;
};

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { logout, user: currentUser } = useAuth();
  const { canEditProfile } = usePermissions();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [selectedMessengers, setSelectedMessengers] = useState<MessengerType[]>(
    []
  );
  const [editContacts, setEditContacts] = useState<UserContacts>({});

  // Загрузка данных профиля и руководителя
  useEffect(() => {
    const loadProfile = async () => {
      // Если это личный профиль (без userId) и есть текущий пользователь
      if (!userId && currentUser) {
        try {
          setLoading(true);
          setError(null);
          setNotFound(false);

          // Для личного профиля используем данные текущего пользователя
          const userProfile = await userService.getUserProfile(currentUser.id);
          setProfile(userProfile);

          // Загружаем данные руководителя, если есть managerId
          if (userProfile.managerId) {
            try {
              const managerData = await userService.getUserProfile(
                userProfile.managerId
              );
              setManager(managerData);
            } catch (managerErr) {
              console.error("Ошибка загрузки данных руководителя:", managerErr);
            }
          }
        } catch (err) {
          console.error("Ошибка загрузки личного профиля:", err);
          setError("Ошибка загрузки профиля");
        } finally {
          setLoading(false);
        }
        return;
      }

      // Если указан userId (чужой профиль)
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const userProfile = await userService.getUserProfile(userId);
        setProfile(userProfile);

        // Загружаем данные руководителя, если есть managerId
        if (userProfile.managerId) {
          try {
            const managerData = await userService.getUserProfile(
              userProfile.managerId
            );
            setManager(managerData);
          } catch (managerErr) {
            console.error("Ошибка загрузки данных руководителя:", managerErr);
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Произошла ошибка при загрузке профиля";
        setError(errorMessage);

        // Определяем, является ли ошибка "не найден"
        if (
          errorMessage.includes("не найден") ||
          errorMessage.includes("Неверный формат") ||
          errorMessage.includes("404")
        ) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUser]);

  // Загрузка списка подразделений для выбора
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departments = await adminService.getAllDepartments();
        setAllDepartments(departments);
      } catch (err) {
        console.error("Ошибка загрузки списка подразделений:", err);
      }
    };

    loadDepartments();
  }, []);

  // Опции для выбора подразделения
  const departmentOptions = useMemo<SelectOption[]>(
    () =>
      allDepartments.map(dept => ({
        label: dept,
        value: dept,
      })),
    [allDepartments]
  );

  // Обработка начала редактирования
  const handleStartEditing = () => {
    if (profile) {
      // Инициализируем контакты из профиля
      const contacts: UserContacts = profile.contacts || {};

      // Если есть messengerLink (telegram) из старого формата, используем его
      if (!contacts.telegram && profile.messengerLink) {
        contacts.telegram = profile.messengerLink;
      }

      // Определяем какие мессенджеры уже заполнены
      const activeMessengers: MessengerType[] = [];
      if (contacts.telegram) activeMessengers.push("telegram");
      if (contacts.skype) activeMessengers.push("skype");
      if (contacts.linkedin) activeMessengers.push("linkedin");
      if (contacts.whatsapp) activeMessengers.push("whatsapp");

      setSelectedMessengers(activeMessengers);
      setEditContacts(contacts);

      setEditData({
        phone: profile.phone || "",
        email: profile.email || "",
        city: profile.city || "",
        interests: profile.interests || "",
        avatar: profile.avatar || "",
        position: profile.position || "",
        department: profile.department || undefined,
        contacts: contacts,
      });
      setIsEditing(true);
    }
  };

  // Обработка сохранения изменений
  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Включаем отредактированные контакты в данные для сохранения
      const dataToSave = {
        ...editData,
        contacts: editContacts,
      };
      const updatedProfile = await updateUserProfile(profile.id, dataToSave);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSelectedMessengers([]);
      setEditContacts({});
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
      setError("Ошибка при сохранении профиля");
    } finally {
      setSaving(false);
    }
  };

  // Обработка отмены редактирования
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setSelectedMessengers([]);
    setEditContacts({});
  };

  // Обработка изменения полей формы
  const handleChange = (field: keyof User, value: unknown) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Обработка выбора мессенджеров
  const handleMessengersChange = (messengers: MessengerType[]) => {
    setSelectedMessengers(messengers);

    // Удаляем контакты для снятых мессенджеров
    const newContacts = { ...editContacts };
    for (const type of ALL_MESSENGER_TYPES) {
      if (!messengers.includes(type)) {
        delete newContacts[type];
      }
    }
    setEditContacts(newContacts);
  };

  // Обработка изменения контакта
  const handleContactChange = (type: MessengerType, value: string) => {
    setEditContacts(prev => ({
      ...prev,
      [type]: value || undefined,
    }));
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  const handleGoHome = () => {
    navigate(ROUTES.root);
  };

  const handleGoToMyProfile = () => {
    navigate(ROUTES.profile.root);
  };

  const handleManagerClick = (managerId: string) => {
    navigate(ROUTES.profile.byId(managerId));
  };

  const isOwnProfile = !userId || userId === currentUser?.id;
  const canEdit = canEditProfile(profile?.id || "");
  // const editableFields = profile ? getEditableFields(profile.id) : { allEditableFields: [] };

  if (loading) {
    return <PageLoader />;
  }

  // Обработка случая когда профиль не найден
  if (notFound) {
    return (
      <div className="container mx-auto p-6 pt-24 pb-12">
        <div className="bg-secondary rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <i className="pi pi-user-slash text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-700 font-golos mb-2">
              Профиль не найден
            </h2>
            <p className="text-gray-600 font-golos">
              {error || "Пользователь с таким ID не существует или был удален"}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              label="На главную"
              icon="pi pi-home"
              onClick={handleGoHome}
              className="font-inter"
            />
            {currentUser && (
              <Button
                label="Мой профиль"
                icon="pi pi-user"
                onClick={handleGoToMyProfile}
                className="font-inter bg-primary border-primary"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Обработка других ошибок
  if (error && !profile) {
    return (
      <div className="container mx-auto p-6 pt-24 pb-12">
        <div className="bg-secondary rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <i className="pi pi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-700 font-golos mb-2">
              Ошибка загрузки
            </h2>
            <p className="text-gray-600 font-golos mb-4">
              {getUserFriendlyError(error)}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              label="Попробовать снова"
              icon="pi pi-refresh"
              onClick={() => globalThis.location.reload()}
              className="font-inter"
            />
            <Button
              label="На главную"
              icon="pi pi-home"
              onClick={handleGoHome}
              severity="secondary"
              className="font-inter"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 pb-12">
      <div className="bg-secondary rounded-lg shadow-md p-8 mx-4 md:mx-6 lg:mx-8">
        {/* Заголовок и кнопка выхода */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-golos">
              {profile
                ? `${profile.lastName} ${profile.firstName} ${
                    profile.middleName || ""
                  }`.trim()
                : "Профиль сотрудника"}
            </h1>
          </div>
          {isOwnProfile && (
            <Button
              onClick={handleLogout}
              label="Выйти"
              icon="pi pi-sign-out"
              severity="danger"
              className="font-inter"
            />
          )}
        </div>

        {profile ? (
          <div className="space-y-8">
            {/* Основная информация в три колонки */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Левая колонка - фото и руководитель */}
              <div className="space-y-6">
                {/* Фото сотрудника */}
                <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="pi pi-user text-4xl text-gray-400"></i>
                    )}
                  </div>
                </div>

                {/* Карточка руководителя */}
                {manager && (
                  <div
                    className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleManagerClick(manager.id)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 font-golos">
                      Руководитель
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {manager.avatar ? (
                          <img
                            src={manager.avatar}
                            alt={`${manager.firstName} ${manager.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <i className="pi pi-user text-lg text-gray-400"></i>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 font-golos truncate">
                          {manager.lastName} {manager.firstName}{" "}
                          {manager.middleName || ""}
                        </p>
                        <p className="text-sm text-gray-600 font-golos truncate">
                          {manager.position}
                        </p>
                        <p className="text-xs text-gray-500 font-golos truncate">
                          {manager.department?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Центральная колонка - основная информация */}
              <div className="space-y-6 lg:col-span-2">
                {/* Подразделение и должность */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditing ? (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 font-golos">
                          Подразделение
                        </h3>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                editData.department?.color ||
                                getDepartmentColor(
                                  editData.department?.name || ""
                                ),
                            }}
                          />
                          <Dropdown
                            value={editData.department?.name || ""}
                            options={departmentOptions}
                            onChange={e => {
                              const selectedDepartment =
                                typeof e.value === "string"
                                  ? e.value
                                  : editData.department?.name || "";
                              handleChange("department", {
                                id:
                                  profile.department?.id ||
                                  selectedDepartment
                                    .toLowerCase()
                                    .replaceAll(/\s+/g, "-"),
                                name: selectedDepartment,
                                color: getDepartmentColor(selectedDepartment),
                              });
                            }}
                            className="w-full font-inter"
                            placeholder="Выберите подразделение"
                            itemTemplate={(option: SelectOption) => (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getDepartmentColor(
                                      option.value
                                    ),
                                  }}
                                />
                                <span>{option.label}</span>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 font-golos">
                          Должность
                        </h3>
                        <InputText
                          value={editData.position || ""}
                          onChange={e =>
                            handleChange("position", e.target.value)
                          }
                          className="w-full font-inter"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 font-golos">
                          Подразделение
                        </h3>
                        <p className="text-gray-700 font-golos">
                          {profile.department?.name || "Не указано"}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 font-golos">
                          Должность
                        </h3>
                        <p className="text-gray-700 font-golos">
                          {profile.position || "Не указана"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Общая информация */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 font-golos">
                    Общая информация
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 font-golos">
                    {isEditing ? (
                      <>
                        <div>
                          <span className="font-medium">Город:</span>
                          <InputText
                            value={editData.city || ""}
                            onChange={e => handleChange("city", e.target.value)}
                            className="w-full font-inter mt-1"
                          />
                        </div>
                        <div>
                          <span className="font-medium">Телефон:</span>
                          <InputText
                            value={editData.phone || ""}
                            onChange={e =>
                              handleChange("phone", e.target.value)
                            }
                            className="w-full font-inter mt-1"
                          />
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>
                          <InputText
                            value={profile.email || ""}
                            disabled
                            className="w-full font-inter mt-1"
                          />
                        </div>
                        <div>
                          <span className="font-medium">Дата рождения:</span>
                          <InputText
                            value={formatDate(profile.birthDate)}
                            disabled
                            className="w-full font-inter mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">
                            Корпоративные чаты:
                          </span>
                          <MultiSelect
                            value={selectedMessengers}
                            options={MESSENGER_OPTIONS}
                            onChange={e =>
                              handleMessengersChange(e.value as MessengerType[])
                            }
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Выберите мессенджеры"
                            className="w-full font-inter mt-1"
                            display="chip"
                            itemTemplate={option => (
                              <div className="flex items-center gap-2">
                                <MessengerIcon option={option} />
                                <span>{option.label}</span>
                              </div>
                            )}
                          />

                          {/* Инпуты для выбранных мессенджеров */}
                          {selectedMessengers.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {selectedMessengers.map(messengerType => {
                                const option = MESSENGER_OPTIONS.find(
                                  o => o.value === messengerType
                                );
                                if (!option) return null;
                                return (
                                  <div
                                    key={messengerType}
                                    className="flex items-center gap-2"
                                  >
                                    <MessengerIcon
                                      option={option}
                                      className="text-lg w-6"
                                    />
                                    <InputText
                                      value={editContacts[messengerType] || ""}
                                      onChange={e =>
                                        handleContactChange(
                                          messengerType,
                                          e.target.value
                                        )
                                      }
                                      placeholder={option.placeholder}
                                      className="flex-1 font-inter"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium">Город:</span>{" "}
                          {profile.city || "Не указан"}
                        </div>
                        <div>
                          <span className="font-medium">Телефон:</span>{" "}
                          {profile.phone || "Не указан"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {profile.email || "Не указан"}
                        </div>
                        <div>
                          <span className="font-medium">Дата рождения:</span>{" "}
                          {formatDate(profile.birthDate)}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">
                            Корпоративные чаты:
                          </span>
                          {profile.contacts &&
                          Object.entries(profile.contacts).some(
                            ([, value]) => value
                          ) ? (
                            <div className="mt-2 space-y-2">
                              {MESSENGER_OPTIONS.map(option => {
                                const value = profile.contacts?.[option.value];
                                if (!value) return null;
                                return (
                                  <div
                                    key={option.value}
                                    className="flex items-center gap-2"
                                  >
                                    <MessengerIcon
                                      option={option}
                                      className="text-lg w-6"
                                    />
                                    <span>{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-500 ml-1">
                              Не указаны
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* О себе */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 font-golos">
                    О себе
                  </h3>
                  {isEditing ? (
                    <InputTextarea
                      value={editData.interests || ""}
                      onChange={e => handleChange("interests", e.target.value)}
                      className="w-full font-inter"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-700 font-golos leading-relaxed">
                      {profile.interests || "Информация не указана"}
                    </p>
                  )}
                </div>

                {/* Стаж работы */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 font-golos">
                    Стаж работы
                  </h3>
                  <p className="text-xl text-gray-900 font-golos font-medium">
                    {calculateExperience(profile.hireDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопки действий (только для своего профиля) */}
            {isOwnProfile && (
              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      label="Отмена"
                      icon="pi pi-times"
                      onClick={handleCancel}
                      className="font-inter bg-primary border-primary hover:bg-primary-dark"
                      disabled={saving}
                    />
                    <Button
                      label={saving ? "Сохранение..." : "Сохранить"}
                      icon="pi pi-check"
                      onClick={handleSave}
                      className="font-inter bg-primary border-primary hover:bg-primary-dark"
                      disabled={saving}
                    />
                  </>
                ) : (
                  <Button
                    label="Редактировать"
                    icon="pi pi-pencil"
                    onClick={handleStartEditing}
                    className="font-inter bg-primary border-primary hover:bg-primary-dark"
                    disabled={!canEdit}
                  />
                )}
              </div>
            )}

            {/* Кнопки действий для администраторов и HR при просмотре чужого профиля */}
            {!isOwnProfile && currentUser && canEdit && (
              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      label="Отмена"
                      icon="pi pi-times"
                      onClick={handleCancel}
                      className="font-inter bg-primary border-primary hover:bg-primary-dark"
                      disabled={saving}
                    />
                    <Button
                      label={saving ? "Сохранение..." : "Сохранить"}
                      icon="pi pi-check"
                      onClick={handleSave}
                      className="font-inter bg-primary border-primary hover:bg-primary-dark"
                      disabled={saving}
                    />
                  </>
                ) : (
                  <Button
                    label="Редактировать"
                    icon="pi pi-pencil"
                    onClick={handleStartEditing}
                    className="font-inter bg-primary border-primary hover:bg-primary-dark"
                    disabled={!canEdit}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg font-golos">
              Профиль не найден
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Функция для преобразования технических ошибок в понятные пользователю сообщения
const getUserFriendlyError = (error: string): string => {
  if (
    error.includes("Unexpected end of JSON input") ||
    error.includes("Некорректный ответ")
  ) {
    return "Сервер вернул некорректные данные. Попробуйте позже.";
  }
  if (
    error.includes("Failed to fetch") ||
    error.includes("проблема с подключением")
  ) {
    return "Проблема с подключением к серверу. Проверьте интернет-соединение.";
  }
  if (error.includes("500") || error.includes("Ошибка сервера")) {
    return "Временная проблема на сервере. Попробуйте позже.";
  }
  if (error.includes("400") || error.includes("Неверный запрос")) {
    return "Неверный запрос. Проверьте корректность данных.";
  }
  return error;
};

export default ProfilePage;
