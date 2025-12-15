import React, { useState, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { usePermissions } from "../hooks/usePermissions";
import type { UserRole } from "../types";

type TabKey = "info" | "training";

// Типы для видеоуроков
interface VideoLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string; // путь к видео в /public/videos/
  thumbnail?: string;
  category: "basics" | "admin" | "advanced";
  /** Роли, которым доступен этот урок. Если не указано - доступен всем */
  roles?: UserRole[];
}

// Список видеоуроков (видео будут в public/videos/)
const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: "lesson-1",
    title: "Навигация по карте организации",
    description:
      "Узнайте, как перемещаться по карте, масштабировать и находить нужные отделы",
    duration: "2:30",
    videoUrl: "/videos/lesson-1-navigation.mp4",
    category: "basics",
    // Доступен всем - roles не указан
  },
  {
    id: "lesson-2",
    title: "Поиск сотрудников",
    description: "Как быстро найти нужного сотрудника по имени или должности",
    duration: "1:45",
    videoUrl: "/videos/lesson-2-search.mp4",
    category: "basics",
    // Доступен всем
  },
  {
    id: "lesson-3",
    title: "Просмотр профиля сотрудника",
    description: "Как открыть профиль сотрудника и посмотреть его контакты",
    duration: "1:30",
    videoUrl: "/videos/lesson-3-profile.mp4",
    category: "basics",
    // Доступен всем
  },
  {
    id: "lesson-4",
    title: "Редактирование своего профиля",
    description: "Как обновить свою информацию, фото и контактные данные",
    duration: "2:00",
    videoUrl: "/videos/lesson-4-edit-profile.mp4",
    category: "basics",
    // Доступен всем
  },
  {
    id: "lesson-5",
    title: "Работа с таблицей сотрудников",
    description: "Как использовать таблицу для поиска и фильтрации сотрудников",
    duration: "2:15",
    videoUrl: "/videos/lesson-5-employees-table.mp4",
    category: "admin",
    roles: ["hr", "admin"], // Только для HR и админов
  },
  {
    id: "lesson-6",
    title: "Перемещение сотрудников между отделами",
    description:
      "Пошаговая инструкция по переводу сотрудника в другой отдел (для HR)",
    duration: "3:00",
    videoUrl: "/videos/lesson-6-move-employee.mp4",
    category: "admin",
    roles: ["hr", "admin"], // Только для HR и админов
  },
  {
    id: "lesson-7",
    title: "Модерация фотографий",
    description: "Как одобрять или отклонять фотографии сотрудников (для HR)",
    duration: "1:45",
    videoUrl: "/videos/lesson-7-photo-moderation.mp4",
    category: "admin",
    roles: ["hr", "admin"], // Только для HR и админов
  },
  {
    id: "lesson-8",
    title: "Редактирование структуры организации",
    description:
      "Как добавлять, удалять и перемещать отделы в дереве (для HR и администраторов)",
    duration: "4:00",
    videoUrl: "/videos/lesson-8-tree-editor.mp4",
    category: "advanced",
    roles: ["hr", "admin"], // Для HR и админов
  },
];

/**
 * Фильтрует видеоуроки по роли пользователя
 */
const filterLessonsByRole = (
  lessons: VideoLesson[],
  userRole: UserRole
): VideoLesson[] => {
  return lessons.filter(lesson => {
    // Если roles не указан - урок доступен всем
    if (!lesson.roles || lesson.roles.length === 0) {
      return true;
    }
    // Иначе проверяем, есть ли роль пользователя в списке
    return lesson.roles.includes(userRole);
  });
};

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const tabs: { key: TabKey; label: string; disabled?: boolean }[] = [
    { key: "info", label: "О системе" },
    { key: "training", label: "Обучение" },
  ];

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="bg-secondary rounded-lg shadow-md p-8">
        {/* Вкладки */}
        <div className="flex mb-8">
          <div className="rounded-lg p-1 flex">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                disabled={tab.disabled}
                className={`px-6 py-3 rounded-md transition-colors font-inter mr-4 ${
                  activeTab === tab.key
                    ? "bg-accent text-white shadow-sm"
                    : tab.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {tab.disabled && <span className="ml-2 text-xs">(скоро)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Контент вкладок */}
        <div className="mb-8">
          {activeTab === "info" && <SystemInfo />}
          {activeTab === "training" && <TrainingContent />}
        </div>
      </div>
    </div>
  );
};

const SystemInfo: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">UDV Team Map</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Интерактивная карта организационной структуры компании для удобной
          навигации по командам и сотрудникам
        </p>
      </div>

      {/* Основные возможности */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <i className="pi pi-star mr-3 text-accent" />
          Основные возможности
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon="pi-sitemap"
            title="Визуализация структуры"
            description="Интерактивная карта организации с возможностью масштабирования и перемещения"
          />
          <FeatureCard
            icon="pi-search"
            title="Быстрый поиск"
            description="Поиск сотрудников по имени, должности или отделу"
          />
          <FeatureCard
            icon="pi-user"
            title="Профили сотрудников"
            description="Детальная информация о каждом сотруднике с контактными данными"
          />
          <FeatureCard
            icon="pi-cog"
            title="Администрирование"
            description="Управление данными сотрудников и структурой организации"
          />
        </div>
      </section>

      {/* Какие проблемы решает */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <i className="pi pi-exclamation-triangle mr-3 text-orange-500" />
          Какие проблемы решает
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <ul className="space-y-3">
            <ProblemItem text="Сложность понимания организационной структуры в крупных компаниях" />
            <ProblemItem text="Трудности в поиске нужного сотрудника или отдела" />
            <ProblemItem text="Отсутствие единого источника актуальной информации о команде" />
            <ProblemItem text="Неэффективная коммуникация из-за незнания структуры компании" />
            <ProblemItem text="Сложности адаптации новых сотрудников" />
          </ul>
        </div>
      </section>

      {/* Цели системы */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <i className="pi pi-flag mr-3 text-green-500" />
          Цели системы
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <ul className="space-y-3">
            <GoalItem text="Обеспечить прозрачность организационной структуры" />
            <GoalItem text="Ускорить поиск нужных специалистов и контактов" />
            <GoalItem text="Упростить онбординг новых сотрудников" />
            <GoalItem text="Повысить эффективность внутренней коммуникации" />
            <GoalItem text="Централизовать информацию о сотрудниках компании" />
          </ul>
        </div>
      </section>

      {/* Горячие клавиши */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <i className="pi pi-keyboard mr-3 text-purple-500" />
          Горячие клавиши
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <ShortcutItem keys='Ctrl + "+"' description="Увеличить масштаб" />
            <ShortcutItem keys='Ctrl + "-"' description="Уменьшить масштаб" />
            <ShortcutItem keys='Ctrl + "0"' description="Сбросить масштаб" />
            <ShortcutItem keys="ЛКМ" description="Перемещение по карте" />
          </div>
        </div>
      </section>
    </div>
  );
};

export const TrainingContent: React.FC = () => {
  const { userRole } = usePermissions();
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "basics" | "admin" | "advanced"
  >("all");

  // Фильтруем уроки по роли пользователя
  const availableLessons = useMemo(
    () => filterLessonsByRole(VIDEO_LESSONS, userRole),
    [userRole]
  );

  // Определяем доступные категории на основе отфильтрованных уроков
  const availableCategories = useMemo(() => {
    const hasBasics = availableLessons.some(l => l.category === "basics");
    const hasAdmin = availableLessons.some(l => l.category === "admin");
    const hasAdvanced = availableLessons.some(l => l.category === "advanced");

    const categories: {
      key: "all" | "basics" | "admin" | "advanced";
      label: string;
      icon: string;
    }[] = [{ key: "all" as const, label: "Все уроки", icon: "pi-list" }];

    if (hasBasics) {
      categories.push({
        key: "basics" as const,
        label: "Основы",
        icon: "pi-home",
      });
    }
    if (hasAdmin) {
      categories.push({
        key: "admin" as const,
        label: "Для HR",
        icon: "pi-users",
      });
    }
    if (hasAdvanced) {
      categories.push({
        key: "advanced" as const,
        label: "Администрирование",
        icon: "pi-cog",
      });
    }

    return categories;
  }, [availableLessons]);

  const filteredLessons =
    activeCategory === "all"
      ? availableLessons
      : availableLessons.filter(lesson => lesson.category === activeCategory);

  const handleRestartTour = () => {
    localStorage.removeItem("udv_onboarding_completed");
    window.location.href = "/";
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Обучение работе с системой
        </h1>
        <p className="text-gray-600">
          Видеоуроки помогут вам быстро освоить все возможности UDV Team Map
        </p>
      </div>

      {/* Кнопка перезапуска тура */}
      <div className="flex justify-center mb-6">
        <Button
          label="Пройти интерактивный тур заново"
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={handleRestartTour}
          style={{ borderColor: "#28CA9E", color: "#28CA9E" }}
        />
      </div>

      {/* Фильтр категорий */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {availableCategories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-full transition-colors flex items-center gap-2 ${
              activeCategory === cat.key
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className={`pi ${cat.icon}`} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Сетка видеоуроков */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(lesson => (
          <VideoLessonCard
            key={lesson.id}
            lesson={lesson}
            onSelect={() => setSelectedVideo(lesson)}
          />
        ))}
      </div>

      {/* Модальное окно с видео */}
      <Dialog
        visible={!!selectedVideo}
        onHide={() => setSelectedVideo(null)}
        header={selectedVideo?.title}
        style={{ width: "80vw", maxWidth: "900px" }}
        modal
        dismissableMask
      >
        {selectedVideo && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                src={selectedVideo.videoUrl}
                controls
                className="w-full h-full"
                autoPlay
              >
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
            </div>
            <p className="text-gray-600">{selectedVideo.description}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
};

interface VideoLessonCardProps {
  lesson: VideoLesson;
  onSelect: () => void;
}

const VideoLessonCard: React.FC<VideoLessonCardProps> = ({
  lesson,
  onSelect,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const categoryColors = {
    basics: "bg-blue-100 text-blue-700",
    admin: "bg-purple-100 text-purple-700",
    advanced: "bg-orange-100 text-orange-700",
  };

  const categoryLabels = {
    basics: "Основы",
    admin: "Для HR",
    advanced: "Администрирование",
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Пробуем воспроизвести видео при наведении (если не загружено автоматически)
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        // Игнорируем ошибки автовоспроизведения
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Превью с автовоспроизведением */}
      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 relative group overflow-hidden">
        {/* Видео с автовоспроизведением */}
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(false)}
        />

        {/* Плейсхолдер пока видео не загружено */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="pi pi-video text-4xl text-white/50" />
          </div>
        )}

        {/* Оверлей с кнопкой воспроизведения при наведении */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <i className="pi pi-play text-2xl text-white" />
          </div>
        </div>

        {/* Длительность */}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {lesson.duration}
        </span>

        {/* Иконка для открытия в плеере */}
        <span
          className={`absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <i className="pi pi-external-link mr-1" />
          Открыть
        </span>
      </div>

      {/* Информация */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${categoryColors[lesson.category]}`}
          >
            {categoryLabels[lesson.category]}
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{lesson.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {lesson.description}
        </p>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start">
      <i className={`pi ${icon} text-2xl text-accent mr-4 mt-1`} />
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

interface ProblemItemProps {
  text: string;
}

const ProblemItem: React.FC<ProblemItemProps> = ({ text }) => (
  <li className="flex items-start">
    <i className="pi pi-times-circle text-red-400 mr-3 mt-1" />
    <span className="text-gray-700">{text}</span>
  </li>
);

interface GoalItemProps {
  text: string;
}

const GoalItem: React.FC<GoalItemProps> = ({ text }) => (
  <li className="flex items-start">
    <i className="pi pi-check-circle text-green-500 mr-3 mt-1" />
    <span className="text-gray-700">{text}</span>
  </li>
);

interface ShortcutItemProps {
  keys: string;
  description: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keys, description }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
    <kbd className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
      {keys}
    </kbd>
    <span className="text-gray-600 text-sm">{description}</span>
  </div>
);

export default AboutPage;
