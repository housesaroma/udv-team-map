import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { API_USER_BY_ID, API_USERS_MOVE } from "../../constants/apiConstants";
import type { ApiUserProfile, User } from "../../types";
import { apiClient } from "../../utils/apiClient";
import {
  type MoveUserPayload,
  updateUserProfile,
  userService,
} from "../userService";

const jwtUtilsMock = vi.hoisted(() => ({
  extractFullNameFromToken: vi.fn<(token: string) => string | null>(() => null),
}));

vi.mock("../../utils/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("../../utils/jwtUtils", () => jwtUtilsMock);

const mockExtractFullNameFromToken = jwtUtilsMock.extractFullNameFromToken;

const mockPost = apiClient.post as Mock;
const mockGet = apiClient.get as Mock;
const mockPut = apiClient.put as Mock;

interface LocalStorageLike {
  length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

const createLocalStorageMock = (): LocalStorageLike => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock as Storage,
  configurable: true,
});

const SERVER_USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

const createApiUser = (
  overrides: Partial<ApiUserProfile> = {}
): ApiUserProfile => ({
  userId: SERVER_USER_ID,
  userName: "Иванов Иван Иванович",
  position: "Frontend Developer",
  department: "IT",
  avatar: "",
  phoneNumber: "+7 (900) 000-00-00",
  city: "Москва",
  interests: "Спорт",
  bornDate: "1990-01-01",
  workExperience: "2018-01-01",
  contacts: { telegram: ["@ivanov"] },
  ...overrides,
});

const fallbackUser: User = {
  id: "fallback",
  firstName: "Fallback",
  lastName: "User",
  position: "Engineer",
  department: { id: "it", name: "IT", color: "#000000" },
};

const mockFallback = (value: User | null) =>
  vi.spyOn(userService, "getFallbackUser").mockReturnValue(value);

const validMovePayload: MoveUserPayload = {
  userId: "11111111-1111-4111-8111-111111111111",
  targetHierarchyId: 42,
  swapWithUserId: "22222222-2222-4222-8222-222222222222",
};

beforeEach(() => {
  mockPost.mockReset();
  mockGet.mockReset();
  mockPut.mockReset();
  mockExtractFullNameFromToken.mockReset();
  localStorageMock.clear();
});

describe("userService.moveUser", () => {
  it("отправляет корректный запрос и завершает без ошибок", async () => {
    mockPost.mockResolvedValueOnce({ status: 200, data: { success: true } });

    await expect(
      userService.moveUser(validMovePayload)
    ).resolves.toBeUndefined();

    expect(mockPost).toHaveBeenCalledWith(
      API_USERS_MOVE,
      {
        userId: validMovePayload.userId,
        targetHierarchyId: validMovePayload.targetHierarchyId,
        swapWithUserId: validMovePayload.swapWithUserId,
      },
      expect.objectContaining({ validateStatus: expect.any(Function) })
    );

    const [, , options] = mockPost.mock.calls[0];
    expect(options.validateStatus()).toBe(true);
  });

  it("бросает ошибку когда сервер возвращает статус 400+", async () => {
    mockPost.mockResolvedValueOnce({
      status: 409,
      data: { message: "Already swapped" },
    });

    await expect(userService.moveUser(validMovePayload)).rejects.toThrow(
      "Не удалось переместить сотрудника"
    );
  });

  it("пробрасывает ошибки сети", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network fail"));

    await expect(userService.moveUser(validMovePayload)).rejects.toThrow(
      "Network fail"
    );
  });

  it("валидирует входные данные", async () => {
    await expect(
      userService.moveUser({
        ...validMovePayload,
        userId: "bad-id",
      })
    ).rejects.toThrow("Неверный формат ID пользователя");

    await expect(
      userService.moveUser({
        ...validMovePayload,
        swapWithUserId: "bad-id",
      })
    ).rejects.toThrow("Неверный формат swapWithUserId");

    await expect(
      userService.moveUser({
        ...validMovePayload,
        targetHierarchyId: Number.NaN,
      })
    ).rejects.toThrow("Не указан targetHierarchyId для перемещения");

    await expect(
      userService.moveUser({
        ...validMovePayload,
        targetHierarchyId: 42.5,
      })
    ).rejects.toThrow("targetHierarchyId должен быть целым числом");
  });

  it("требует swapWithUserId", async () => {
    await expect(
      userService.moveUser({
        ...validMovePayload,
        swapWithUserId: "",
      })
    ).rejects.toThrow("Не указан swapWithUserId для операции обмена");
  });
});

describe("userService.getUserProfile", () => {
  it("возвращает mock пользователя, если он существует", async () => {
    const result = await userService.getUserProfile("1");

    expect(result.id).toBe("1");
  });

  it("валидирует формат id", async () => {
    await expect(userService.getUserProfile("bad-id")).rejects.toThrow(
      "Неверный формат ID пользователя"
    );
  });

  it("бросает ошибку при 401", async () => {
    mockGet.mockResolvedValueOnce({ status: 401, data: {} });

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Ошибка авторизации. Требуется повторный вход"
    );
  });

  it("бросает ошибку при 400", async () => {
    const fallbackSpy = mockFallback(null);
    mockGet.mockResolvedValueOnce({ status: 400, data: { message: "bad" } });

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Неверный запрос"
    );

    fallbackSpy.mockRestore();
  });

  it("возвращает fallback при 404", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockResolvedValueOnce({ status: 404, data: {} });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("бросает ошибку при отсутствии fallback и 404", async () => {
    const fallbackSpy = mockFallback(null);
    mockGet.mockResolvedValueOnce({ status: 404, data: {} });

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Пользователь не найден"
    );

    fallbackSpy.mockRestore();
  });

  it("возвращает fallback при 500", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockResolvedValueOnce({ status: 500, data: {} });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("возвращает fallback при прочих 4xx", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockResolvedValueOnce({ status: 418, data: { message: "tea" } });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("использует fallback при пустом ответе", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockResolvedValueOnce({ status: 200, data: "   " });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("возвращает нормализованные данные при валидном ответе", async () => {
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser()),
    });

    const result = await userService.getUserProfile(SERVER_USER_ID);

    expect(result.firstName).toBe("Иван");
    expect(result.lastName).toBe("Иванов");
  });

  it("использует кастомный validateStatus при запросе профиля", async () => {
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser()),
    });

    await userService.getUserProfile(SERVER_USER_ID);

    const [, options] = mockGet.mock.calls[0];
    expect(options.validateStatus()).toBe(true);
  });

  it("бросает ошибку при некорректном JSON", async () => {
    const fallbackSpy = mockFallback(null);
    mockGet.mockResolvedValueOnce({ status: 200, data: "{bad" });

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Некорректный ответ от сервера"
    );

    fallbackSpy.mockRestore();
  });

  it("использует fallback если ответ не объект", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify("text"),
    });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("использует fallback если отсутствует userName и токен", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser({ userName: "" })),
    });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("подставляет имя из токена при пустом userName", async () => {
    localStorageMock.setItem("authToken", "token");
    mockExtractFullNameFromToken.mockReturnValueOnce("Тестов Тест Тестович");
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser({ userName: "" })),
    });

    const result = await userService.getUserProfile(SERVER_USER_ID);

    expect(result.firstName).toBe("Тест");
    expect(result.lastName).toBe("Тестов");
  });

  it("не подставляет имя когда токен не содержит fullName", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    localStorageMock.setItem("authToken", "token");
    mockExtractFullNameFromToken.mockReturnValueOnce(null);
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser({ userName: "" })),
    });

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("повторно пробрасывает известные ошибки из catch", async () => {
    const knownError = new Error("Пользователь не найден на сервере");
    mockGet.mockRejectedValueOnce(knownError);

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toBe(
      knownError
    );
  });

  it("возвращает fallback из catch", async () => {
    const fallbackSpy = mockFallback(fallbackUser);
    mockGet.mockRejectedValueOnce(new Error("Network"));

    await expect(userService.getUserProfile(SERVER_USER_ID)).resolves.toBe(
      fallbackUser
    );

    fallbackSpy.mockRestore();
  });

  it("обрабатывает SyntaxError", async () => {
    const fallbackSpy = mockFallback(null);
    mockGet.mockRejectedValueOnce(new SyntaxError("bad json"));

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Некорректный ответ от сервера"
    );

    fallbackSpy.mockRestore();
  });

  it("обрабатывает TypeError", async () => {
    const fallbackSpy = mockFallback(null);
    mockGet.mockRejectedValueOnce(new TypeError("Failed"));

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Проблема с подключением к серверу"
    );

    fallbackSpy.mockRestore();
  });

  it("обрабатывает неизвестные ошибки", async () => {
    const fallbackSpy = mockFallback(null);
    mockGet.mockRejectedValueOnce("boom");

    await expect(userService.getUserProfile(SERVER_USER_ID)).rejects.toThrow(
      "Неизвестная ошибка при загрузке профиля: Неизвестная ошибка"
    );

    fallbackSpy.mockRestore();
  });
});

describe("вспомогательные методы userService", () => {
  it("валидирует UUID", () => {
    expect(userService.isValidUUID(SERVER_USER_ID)).toBe(true);
    expect(userService.isValidUUID("123")).toBe(false);
  });

  it("возвращает mock пользователей", () => {
    const mocks = userService.getMockUsers();

    expect(mocks.some(user => user.id === "1")).toBe(true);
  });

  it("возвращает пользователей админки", () => {
    const admins = userService.getAdminMockUsers();

    expect(admins.length).toBeGreaterThan(0);
    expect(admins[0].id).toBeTruthy();
  });

  it("находит fallback пользователя", () => {
    const user = userService.getFallbackUser(
      "11111111-1111-1111-1111-111111111111"
    );

    expect(user).not.toBeNull();
  });

  it("возвращает пользователя из основных моков при совпадении id", () => {
    const user = userService.getFallbackUser("1");

    expect(user?.id).toBe("1");
  });

  it("возвращает null, если пользователь не найден ни в одном источнике", () => {
    expect(userService.getFallbackUser("not-found-id")).toBeNull();
  });

  it("уникализирует пользователей при объединении", () => {
    const duplicate: User = {
      id: "duplicate",
      firstName: "Dup",
      lastName: "User",
      position: "Developer",
      department: { id: "it", name: "IT", color: "#000" },
    };

    const mockUsersSpy = vi
      .spyOn(userService, "getMockUsers")
      .mockReturnValue([duplicate, { ...duplicate, id: "mock-2" }]);
    const adminSpy = vi
      .spyOn(userService, "getAdminMockUsers")
      .mockReturnValue([duplicate]);

    const merged = userService.getAllAvailableUsers();

    expect(merged).toHaveLength(2);
    expect(new Set(merged.map(user => user.id)).size).toBe(2);

    mockUsersSpy.mockRestore();
    adminSpy.mockRestore();
  });
});

describe("updateUserProfile", () => {
  const baseUpdate: Partial<User> = {
    phone: "+7 (900) 555-44-33",
    city: "Пермь",
    interests: "Спорт",
    avatar: "https://cdn/avatar.png",
    messengerLink: "https://t.me/test-user",
    position: "Lead Developer",
    department: { id: "it", name: "IT", color: "#000" },
  };

  it("валидирует формат id", async () => {
    await expect(updateUserProfile("bad-id", baseUpdate)).rejects.toThrow(
      "Неверный формат ID пользователя"
    );
  });

  it("обновляет профиль и нормализует ответ", async () => {
    mockPut.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser()),
    });

    const result = await updateUserProfile(SERVER_USER_ID, baseUpdate);

    expect(mockPut).toHaveBeenCalledWith(
      API_USER_BY_ID(SERVER_USER_ID),
      {
        phone: baseUpdate.phone,
        city: baseUpdate.city,
        interests: baseUpdate.interests,
        avatar: baseUpdate.avatar,
        contacts: { telegram: [baseUpdate.messengerLink as string] },
        position: baseUpdate.position,
        department: baseUpdate.department?.name ?? baseUpdate.department ?? "",
      },
      expect.objectContaining({ validateStatus: expect.any(Function) })
    );

    const [, , putOptions] = mockPut.mock.calls[0];
    expect(putOptions.validateStatus()).toBe(true);

    expect(result.id).toBe(SERVER_USER_ID);
  });

  it("передает пустые контакты без messengerLink", async () => {
    mockPut.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser()),
    });

    await updateUserProfile(SERVER_USER_ID, { position: "Lead" });

    const [, body] = mockPut.mock.calls[mockPut.mock.calls.length - 1];
    expect(body.contacts).toEqual({});
  });

  it("бросает ошибку при 401", async () => {
    mockPut.mockResolvedValueOnce({ status: 401, data: {} });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Ошибка авторизации. Требуется повторный вход"
    );
  });

  it("бросает ошибку при 404", async () => {
    mockPut.mockResolvedValueOnce({ status: 404, data: {} });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Пользователь не найден"
    );
  });

  it("бросает ошибку при 400", async () => {
    mockPut.mockResolvedValueOnce({ status: 400, data: { message: "bad" } });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Неверный запрос"
    );
  });

  it("обрабатывает прочие ошибки", async () => {
    mockPut.mockResolvedValueOnce({ status: 502, data: { message: "bad" } });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Ошибка обновления профиля: 502"
    );
  });

  it("бросает ошибку при пустом ответе", async () => {
    mockPut.mockResolvedValueOnce({ status: 200, data: "" });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Пустой ответ от сервера"
    );
  });

  it("бросает ошибку при некорректном JSON", async () => {
    mockPut.mockResolvedValueOnce({ status: 200, data: "{bad" });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Некорректный ответ от сервера"
    );
  });

  it("использует только объектный ответ", async () => {
    mockPut.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify("text"),
    });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Некорректные данные профиля: ответ не является объектом"
    );
  });

  it("валидирует структуру ответа", async () => {
    mockPut.mockResolvedValueOnce({
      status: 200,
      data: JSON.stringify(createApiUser({ department: "" })),
    });

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Некорректные данные обновленного профиля"
    );
  });

  it("пробрасывает неизвестные ошибки", async () => {
    mockPut.mockRejectedValueOnce(new Error("boom"));

    await expect(updateUserProfile(SERVER_USER_ID, baseUpdate)).rejects.toThrow(
      "Неизвестная ошибка при обновлении профиля: boom"
    );
  });
});
