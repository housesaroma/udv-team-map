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
