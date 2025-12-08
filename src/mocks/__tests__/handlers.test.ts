import { describe, it, expect } from "vitest";
import {
  API_AUTH_LOGIN,
  API_HIERARCHY,
  API_DEPARTMENT_TREE,
  API_USERS,
  API_USERS_DEPARTMENTS,
  API_USERS_POSITIONS,
} from "../../constants/apiConstants";
import { handlersTestUtils } from "../handlers";

describe("MSW handlers", () => {
  describe("POST /api/Auth/login", () => {
    it("должен вернуть токен для валидного employee", async () => {
      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "employee", password: "password123" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("token");
      expect(typeof data.token).toBe("string");
    });

    it("должен вернуть токен для валидного hr", async () => {
      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "hr", password: "password123" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("token");
    });

    it("должен вернуть токен для валидного admin", async () => {
      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "password123" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("token");
    });

    it("должен вернуть 401 для неверного пароля", async () => {
      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "employee", password: "wrongpass" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toContain("Неверный логин или пароль");
    });

    it("должен вернуть 401 для несуществующего пользователя", async () => {
      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "ghost", password: "password123" }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/Users/hierarchy", () => {
    it("должен вернуть иерархию организации", async () => {
      const response = await fetch(API_HIERARCHY);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("ceo");
      expect(data).toHaveProperty("departments");
    });
  });

  describe("GET /api/Users/treeWithoutUsers", () => {
    it("должен вернуть дерево отделов", async () => {
      const response = await fetch(API_DEPARTMENT_TREE);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("hierarchyId");
      expect(data).toHaveProperty("children");
    });
  });

  describe("GET /api/Users/departmentUsers", () => {
    it("должен вернуть пользователей отдела по hierarchyId", async () => {
      const response = await fetch(
        `${API_USERS}/departmentUsers?hierarchyId=44`
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("hierarchyId");
      expect(data).toHaveProperty("title");
      expect(data).toHaveProperty("employees");
    });

    it("должен вернуть 400 если hierarchyId отсутствует", async () => {
      const response = await fetch(`${API_USERS}/departmentUsers`);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toContain("hierarchyId is required");
    });

    it("должен вернуть 400 если hierarchyId не число", async () => {
      const response = await fetch(
        `${API_USERS}/departmentUsers?hierarchyId=abc`
      );
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toContain("hierarchyId must be a number");
    });

    it("должен вернуть fallback данные для неизвестного hierarchyId", async () => {
      const response = await fetch(
        `${API_USERS}/departmentUsers?hierarchyId=999`
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("hierarchyId");
    });
  });

  describe("GET /api/Users/:userId", () => {
    it("должен вернуть профиль существующего пользователя", async () => {
      const response = await fetch(
        `${API_USERS}/11111111-1111-1111-1111-111111111111`
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("userName");
    });

    it("должен вернуть 404 для несуществующего пользователя", async () => {
      const response = await fetch(
        `${API_USERS}/99999999-9999-9999-9999-999999999999`
      );
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.message).toContain("Пользователь не найден");
    });
  });

  describe("PUT /api/Users/:userId", () => {
    it("должен обновить существующего пользователя", async () => {
      const response = await fetch(
        `${API_USERS}/11111111-1111-1111-1111-111111111111`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: "Новый Город" }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.city).toBe("Новый Город");
    });

    it("должен создать профиль для нового пользователя", async () => {
      const response = await fetch(`${API_USERS}/new-user-id`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: "Новый отдел" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.userId).toBe("new-user-id");
      expect(data.department).toBe("Новый отдел");
    });

    it("должен обновить telegram из messengerLink", async () => {
      const response = await fetch(
        `${API_USERS}/11111111-1111-1111-1111-111111111111`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messengerLink: "https://t.me/testuser" }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.contacts.telegram).toContain("https://t.me/testuser");
    });

    it("должен мёржить contacts при обновлении", async () => {
      const response = await fetch(
        `${API_USERS}/11111111-1111-1111-1111-111111111111`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts: {
              telegram: ["https://t.me/newcontact"],
              skype: ["live:new.skype"],
            },
          }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.contacts.telegram).toContain("https://t.me/newcontact");
      expect(data.contacts.skype).toContain("live:new.skype");
    });
  });

  describe("GET /api/Users", () => {
    it("должен вернуть список пользователей", async () => {
      const response = await fetch(API_USERS);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("usersTable");
      expect(Array.isArray(data.usersTable)).toBe(true);
    });
  });

  describe("GET /api/Users/departments", () => {
    it("должен вернуть список отделов", async () => {
      const response = await fetch(API_USERS_DEPARTMENTS);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("GET /api/Users/positions", () => {
    it("должен вернуть список позиций", async () => {
      const response = await fetch(API_USERS_POSITIONS);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});

describe("handlersTestUtils.toBase64UrlForTests", () => {
  type BufferStub = {
    from: (
      input: string,
      encoding: string
    ) => {
      toString: (encoding: string) => string;
    };
  };

  it("использует Buffer когда он доступен", () => {
    const globalBuffer = globalThis as { Buffer?: BufferStub };
    const originalBuffer = globalBuffer.Buffer;

    globalBuffer.Buffer = {
      from: () => ({
        toString: () => "bW9ja19iYXNlNjQ=",
      }),
    };

    try {
      const encoded = handlersTestUtils.toBase64UrlForTests("ignored");
      expect(encoded).toBe("bW9ja19iYXNlNjQ");
    } finally {
      if (originalBuffer) {
        globalBuffer.Buffer = originalBuffer;
      } else {
        delete globalBuffer.Buffer;
      }
    }
  });

  it("использует window.btoa когда Buffer отсутствует", () => {
    const globalBuffer = globalThis as { Buffer?: BufferStub };
    const originalBuffer = globalBuffer.Buffer;
    delete globalBuffer.Buffer;

    const value = "Привет";
    const utf8Binary = Array.from(new TextEncoder().encode(value), byte =>
      String.fromCharCode(byte)
    ).join("");
    const expected = window
      .btoa(utf8Binary)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    try {
      const encoded = handlersTestUtils.toBase64UrlForTests(value);
      expect(encoded).toBe(expected);
    } finally {
      if (originalBuffer) {
        globalBuffer.Buffer = originalBuffer;
      } else {
        delete globalBuffer.Buffer;
      }
    }
  });

  it("бросает ошибку если нет Buffer и window.btoa", () => {
    const globalBuffer = globalThis as { Buffer?: BufferStub };
    const originalBuffer = globalBuffer.Buffer;
    const windowWithBtoa = window as typeof window & {
      btoa?: typeof window.btoa;
    };
    const originalBtoa = windowWithBtoa.btoa;

    delete globalBuffer.Buffer;
    delete windowWithBtoa.btoa;

    try {
      expect(() => handlersTestUtils.toBase64UrlForTests("data")).toThrow(
        "Base64 encoding is not supported in this environment"
      );
    } finally {
      if (originalBuffer) {
        globalBuffer.Buffer = originalBuffer;
      } else {
        delete globalBuffer.Buffer;
      }
      windowWithBtoa.btoa = originalBtoa;
    }
  });
});
