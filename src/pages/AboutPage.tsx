import React, { useState } from "react";

type TabKey = "info" | "training";

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const tabs: { key: TabKey; label: string; disabled?: boolean }[] = [
    { key: "info", label: "О системе" },
    { key: "training", label: "Обучение", disabled: true },
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
            <ShortcutItem keys="Ctrl + +" description="Увеличить масштаб" />
            <ShortcutItem keys="Ctrl + -" description="Уменьшить масштаб" />
            <ShortcutItem keys="Ctrl + 0" description="Сбросить масштаб" />
            <ShortcutItem
              keys="Перетаскивание"
              description="Перемещение по карте"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const TrainingContent: React.FC = () => {
  return (
    <div className="text-center py-12">
      <i className="pi pi-book text-6xl text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">
        Раздел в разработке
      </h2>
      <p className="text-gray-500">
        Материалы по обучению работе с системой скоро будут доступны
      </p>
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
