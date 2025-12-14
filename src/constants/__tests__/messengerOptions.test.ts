import { describe, expect, it } from "vitest";
import {
  ALL_MESSENGER_TYPES,
  MESSENGER_OPTIONS,
  type MessengerOption,
} from "../messengerOptions";

describe("messengerOptions", () => {
  describe("MESSENGER_OPTIONS", () => {
    it("содержит 6 мессенджеров", () => {
      expect(MESSENGER_OPTIONS).toHaveLength(6);
    });

    it("содержит все необходимые поля для каждого мессенджера", () => {
      for (const option of MESSENGER_OPTIONS) {
        expect(option.label).toBeTruthy();
        expect(option.value).toBeTruthy();
        expect(option.placeholder).toBeTruthy();
        // Должен быть либо icon, либо iconImage
        expect(option.icon || option.iconImage).toBeTruthy();
      }
    });

    it("содержит Telegram с корректными данными", () => {
      const telegram = MESSENGER_OPTIONS.find(
        opt => opt.value === "telegram"
      ) as MessengerOption;

      expect(telegram).toBeDefined();
      expect(telegram.label).toBe("Telegram");
      expect(telegram.icon).toBe("pi pi-telegram");
      expect(telegram.placeholder).toContain("@username");
    });

    it("содержит Skype с корректными данными", () => {
      const skype = MESSENGER_OPTIONS.find(
        opt => opt.value === "skype"
      ) as MessengerOption;

      expect(skype).toBeDefined();
      expect(skype.label).toBe("Skype");
      expect(skype.icon).toBe("pi pi-microsoft");
      expect(skype.placeholder).toContain("live:");
    });

    it("содержит LinkedIn с корректными данными", () => {
      const linkedin = MESSENGER_OPTIONS.find(
        opt => opt.value === "linkedin"
      ) as MessengerOption;

      expect(linkedin).toBeDefined();
      expect(linkedin.label).toBe("LinkedIn");
      expect(linkedin.icon).toBe("pi pi-linkedin");
      expect(linkedin.placeholder).toContain("linkedin.com");
    });

    it("содержит WhatsApp с корректными данными", () => {
      const whatsapp = MESSENGER_OPTIONS.find(
        opt => opt.value === "whatsapp"
      ) as MessengerOption;

      expect(whatsapp).toBeDefined();
      expect(whatsapp.label).toBe("WhatsApp");
      expect(whatsapp.icon).toBe("pi pi-whatsapp");
      expect(whatsapp.placeholder).toContain("+7");
    });

    it("содержит ВКонтакте с кастомной иконкой", () => {
      const vk = MESSENGER_OPTIONS.find(
        opt => opt.value === "vk"
      ) as MessengerOption;

      expect(vk).toBeDefined();
      expect(vk.label).toBe("ВКонтакте");
      expect(vk.icon).toBeUndefined();
      expect(vk.iconImage).toBeTruthy();
      expect(vk.placeholder).toContain("vk.com");
    });

    it("содержит Mattermost с кастомной иконкой", () => {
      const mattermost = MESSENGER_OPTIONS.find(
        opt => opt.value === "mattermost"
      ) as MessengerOption;

      expect(mattermost).toBeDefined();
      expect(mattermost.label).toBe("Mattermost");
      expect(mattermost.icon).toBeUndefined();
      expect(mattermost.iconImage).toBeTruthy();
      expect(mattermost.placeholder).toContain("@username");
    });

    it("все значения уникальны", () => {
      const values = MESSENGER_OPTIONS.map(opt => opt.value);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe("ALL_MESSENGER_TYPES", () => {
    it("содержит 6 типов мессенджеров", () => {
      expect(ALL_MESSENGER_TYPES).toHaveLength(6);
    });

    it("содержит все типы из MESSENGER_OPTIONS", () => {
      const optionValues = MESSENGER_OPTIONS.map(opt => opt.value);

      for (const type of ALL_MESSENGER_TYPES) {
        expect(optionValues).toContain(type);
      }
    });

    it("содержит telegram", () => {
      expect(ALL_MESSENGER_TYPES).toContain("telegram");
    });

    it("содержит skype", () => {
      expect(ALL_MESSENGER_TYPES).toContain("skype");
    });

    it("содержит linkedin", () => {
      expect(ALL_MESSENGER_TYPES).toContain("linkedin");
    });

    it("содержит whatsapp", () => {
      expect(ALL_MESSENGER_TYPES).toContain("whatsapp");
    });

    it("содержит vk", () => {
      expect(ALL_MESSENGER_TYPES).toContain("vk");
    });

    it("содержит mattermost", () => {
      expect(ALL_MESSENGER_TYPES).toContain("mattermost");
    });

    it("все значения уникальны", () => {
      const uniqueTypes = new Set(ALL_MESSENGER_TYPES);

      expect(uniqueTypes.size).toBe(ALL_MESSENGER_TYPES.length);
    });
  });

  describe("MessengerOption interface", () => {
    it("поддерживает опцию только с icon", () => {
      const option: MessengerOption = {
        label: "Test",
        value: "telegram",
        icon: "pi pi-test",
        placeholder: "test",
      };

      expect(option.icon).toBe("pi pi-test");
      expect(option.iconImage).toBeUndefined();
    });

    it("поддерживает опцию только с iconImage", () => {
      const option: MessengerOption = {
        label: "Test",
        value: "vk",
        iconImage: "/path/to/image.png",
        placeholder: "test",
      };

      expect(option.icon).toBeUndefined();
      expect(option.iconImage).toBe("/path/to/image.png");
    });

    it("поддерживает опцию с обоими полями иконок", () => {
      const option: MessengerOption = {
        label: "Test",
        value: "telegram",
        icon: "pi pi-test",
        iconImage: "/path/to/image.png",
        placeholder: "test",
      };

      expect(option.icon).toBe("pi pi-test");
      expect(option.iconImage).toBe("/path/to/image.png");
    });
  });
});
