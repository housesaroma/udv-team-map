import { http, HttpResponse } from "msw";
import {
  API_AUTH_LOGIN,
  API_DEPARTMENT_TREE,
  API_HIERARCHY,
  API_USERS,
  API_USERS_DEPARTMENTS,
  API_USERS_POSITIONS,
} from "../constants/apiConstants";
import { MOCK_HIERARCHY } from "../constants/mockUsersHierarchy";
import { MOCK_DEPARTMENT_TREE } from "../constants/mockDepartmentTree";
import { getMockDepartmentUsers } from "../constants/mockDepartmentUsers";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import type { ApiUserProfile } from "../validation/apiSchemas";
import type { LoginRequest } from "../services/authService";
import type { UserRole } from "../utils/jwtUtils";

interface LoginAccount {
  aliases: string[];
  role: UserRole;
  userId: string;
  fullName: string;
  email: string;
}

const LOGIN_ACCOUNTS: LoginAccount[] = [
  {
    aliases: ["employee", "employee@udv.group"],
    role: "employee",
    userId: "11111111-1111-1111-1111-111111111111",
    fullName: "Иванов Александр Петрович",
    email: "employee@udv.group",
  },
  {
    aliases: ["hr", "hr@udv.group"],
    role: "hr",
    userId: "bbbbbbbb-2222-2222-2222-222222222222",
    fullName: "Ковалева Марина Сергеевна",
    email: "hr@udv.group",
  },
  {
    aliases: ["admin", "admin@udv.group"],
    role: "admin",
    userId: "bbbbbbbb-1111-1111-1111-111111111111",
    fullName: "Семенов Игорь Васильевич",
    email: "admin@udv.group",
  },
];

const DEFAULT_PASSWORD = "password123";

type BufferLike = {
  from: (
    input: string,
    encoding: string
  ) => {
    toString: (encoding: string) => string;
  };
};

const toBase64Url = (value: string): string => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window
      .btoa(value)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  const bufferCtor = (globalThis as { Buffer?: BufferLike }).Buffer;
  if (bufferCtor) {
    return bufferCtor
      .from(value, "utf-8")
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  throw new Error("Base64 encoding is not supported in this environment");
};

const createMockToken = (account: LoginAccount): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const payload = {
    FullName: account.fullName,
    Email: account.email,
    exp: expiresAt,
    iss: "udv-team-map",
    aud: "udv-team-map",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": account.email,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
      account.userId,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
      account.role,
    IsHr: account.role === "hr" ? "true" : "false",
  };

  return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}.mock-signature`;
};

const findUserProfile = (userId: string): ApiUserProfile | undefined =>
  MOCK_USERS_RESPONSE.usersTable.find(user => user.userId === userId);

const upsertUserProfile = (
  userId: string,
  updater: (profile: ApiUserProfile) => ApiUserProfile
): ApiUserProfile => {
  const index = MOCK_USERS_RESPONSE.usersTable.findIndex(
    user => user.userId === userId
  );

  if (index === -1) {
    const emptyProfile: ApiUserProfile = {
      userId,
      userName: "Новый пользователь",
      department: "Unknown",
      position: "Unknown",
      bornDate: new Date().toISOString(),
      workExperience: new Date().toISOString(),
      phoneNumber: "+7 (000) 000-00-00",
      city: "",
      interests: "",
      avatar: "",
      contacts: {
        skype: [],
        telegram: [],
      },
    };
    const updated = updater(emptyProfile);
    MOCK_USERS_RESPONSE.usersTable.push(updated);
    return updated;
  }

  const current = MOCK_USERS_RESPONSE.usersTable[index];
  const updated = updater(current);
  MOCK_USERS_RESPONSE.usersTable[index] = updated;
  return updated;
};

const mapUpdateBodyToProfile = (
  profile: ApiUserProfile,
  body: Record<string, unknown>
): ApiUserProfile => {
  const contacts =
    typeof body.contacts === "object" && body.contacts !== null
      ? {
          ...profile.contacts,
          ...(body.contacts as ApiUserProfile["contacts"]),
        }
      : profile.contacts;

  const telegramFromLink =
    typeof body.messengerLink === "string" ? [body.messengerLink] : undefined;

  return {
    ...profile,
    department: (body.department as string) ?? profile.department,
    position: (body.position as string) ?? profile.position,
    phoneNumber: (body.phone as string) ?? profile.phoneNumber,
    city: (body.city as string) ?? profile.city,
    interests: (body.interests as string) ?? profile.interests,
    avatar: (body.avatar as string) ?? profile.avatar,
    contacts: telegramFromLink
      ? { ...contacts, telegram: telegramFromLink }
      : contacts,
  };
};

export const handlers = [
  http.post(API_AUTH_LOGIN, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const normalizedLogin = body.username.trim().toLowerCase();
    const password = body.password.trim();

    const account = LOGIN_ACCOUNTS.find(acc =>
      acc.aliases.some(alias => alias === normalizedLogin)
    );

    if (!account || password !== DEFAULT_PASSWORD) {
      return HttpResponse.json(
        { message: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const token = createMockToken(account);
    return HttpResponse.json({ token });
  }),

  http.get(API_HIERARCHY, () => HttpResponse.json(MOCK_HIERARCHY)),
  http.get(API_DEPARTMENT_TREE, () => HttpResponse.json(MOCK_DEPARTMENT_TREE)),
  http.get(`${API_USERS}/departmentUsers`, ({ request }) => {
    const url = new URL(request.url);
    const hierarchyIdParam = url.searchParams.get("hierarchyId");
    if (!hierarchyIdParam) {
      return HttpResponse.json(
        { message: "hierarchyId is required" },
        { status: 400 }
      );
    }

    const hierarchyId = Number.parseInt(hierarchyIdParam, 10);
    if (Number.isNaN(hierarchyId)) {
      return HttpResponse.json(
        { message: "hierarchyId must be a number" },
        { status: 400 }
      );
    }

    const data = getMockDepartmentUsers(hierarchyId);
    return HttpResponse.json(data);
  }),

  http.get(`${API_USERS}/:userId`, ({ params }) => {
    const userId = params.userId as string;
    const profile = findUserProfile(userId);

    if (!profile) {
      return HttpResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return HttpResponse.json(profile);
  }),

  http.put(`${API_USERS}/:userId`, async ({ params, request }) => {
    const userId = params.userId as string;
    const body = (await request.json()) as Record<string, unknown>;

    const updatedProfile = upsertUserProfile(userId, profile =>
      mapUpdateBodyToProfile(profile, body)
    );

    return HttpResponse.json(updatedProfile);
  }),

  http.get(API_USERS, () => HttpResponse.json(MOCK_USERS_RESPONSE)),

  http.get(API_USERS_DEPARTMENTS, () => {
    const departments = Array.from(
      new Set(MOCK_USERS_RESPONSE.usersTable.map(user => user.department))
    );
    return HttpResponse.json(departments);
  }),

  http.get(API_USERS_POSITIONS, () => {
    const positions = Array.from(
      new Set(MOCK_USERS_RESPONSE.usersTable.map(user => user.position))
    );
    return HttpResponse.json(positions);
  }),
];
