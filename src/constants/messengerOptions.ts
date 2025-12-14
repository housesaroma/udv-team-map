import type { MessengerType } from "../types";
import vkIcon from "../assets/vk.png";
import mattermostIcon from "../assets/mattermost.png";

export interface MessengerOption {
  label: string;
  value: MessengerType;
  icon?: string; // PrimeReact icon class
  iconImage?: string; // Custom image URL
  placeholder: string;
}

export const MESSENGER_OPTIONS: MessengerOption[] = [
  {
    label: "Telegram",
    value: "telegram",
    icon: "pi pi-telegram",
    placeholder: "@username или https://t.me/...",
  },
  {
    label: "Skype",
    value: "skype",
    icon: "pi pi-microsoft",
    placeholder: "live:username или skype:...",
  },
  {
    label: "LinkedIn",
    value: "linkedin",
    icon: "pi pi-linkedin",
    placeholder: "https://linkedin.com/in/...",
  },
  {
    label: "WhatsApp",
    value: "whatsapp",
    icon: "pi pi-whatsapp",
    placeholder: "+7... или https://wa.me/...",
  },
  {
    label: "ВКонтакте",
    value: "vk",
    iconImage: vkIcon,
    placeholder: "https://vk.com/...",
  },
  {
    label: "Mattermost",
    value: "mattermost",
    iconImage: mattermostIcon,
    placeholder: "@username",
  },
];

// Список всех типов мессенджеров для валидации и обработки
export const ALL_MESSENGER_TYPES: MessengerType[] = [
  "telegram",
  "skype",
  "linkedin",
  "whatsapp",
  "vk",
  "mattermost",
];

/**
 * Генерирует ссылку на мессенджер по типу и значению контакта.
 * Если значение уже является URL, возвращает его как есть.
 * Иначе формирует ссылку в зависимости от типа мессенджера.
 */
export const getMessengerLink = (
  type: MessengerType,
  value: string
): string => {
  // Если значение уже является полным URL
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Очищаем значение от лишних символов для некоторых типов
  const cleanValue = value.trim();

  switch (type) {
    case "telegram": {
      // Поддержка @username и t.me/...
      if (cleanValue.startsWith("@")) {
        return `https://t.me/${cleanValue.slice(1)}`;
      }
      if (cleanValue.startsWith("t.me/")) {
        return `https://${cleanValue}`;
      }
      return `https://t.me/${cleanValue}`;
    }
    case "skype": {
      // skype:username или skype:username?chat
      if (cleanValue.startsWith("skype:")) {
        return cleanValue;
      }
      if (cleanValue.startsWith("live:")) {
        return `skype:${cleanValue}?chat`;
      }
      return `skype:${cleanValue}?chat`;
    }
    case "linkedin": {
      // linkedin.com/in/username
      if (cleanValue.startsWith("linkedin.com")) {
        return `https://${cleanValue}`;
      }
      return `https://linkedin.com/in/${cleanValue}`;
    }
    case "whatsapp": {
      // wa.me/номер или https://wa.me/...
      if (cleanValue.startsWith("wa.me/")) {
        return `https://${cleanValue}`;
      }
      // Очищаем номер от всех символов кроме цифр и +
      const phoneNumber = cleanValue.replace(/[^\d+]/g, "");
      return `https://wa.me/${phoneNumber.replace("+", "")}`;
    }
    case "vk": {
      // vk.com/username
      if (cleanValue.startsWith("vk.com")) {
        return `https://${cleanValue}`;
      }
      return `https://vk.com/${cleanValue}`;
    }
    case "mattermost": {
      // Mattermost обычно внутренний сервис, возвращаем как есть
      // или можно настроить базовый URL для организации
      return cleanValue;
    }
    default:
      return cleanValue;
  }
};
