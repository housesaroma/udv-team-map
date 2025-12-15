import { describe, expect, it } from "vitest";
import {
  apiUserProfileSchema,
  organizationHierarchySchema,
  updateUserResponseSchema,
  usersResponseSchema,
} from "../apiSchemas";

describe("apiUserProfileSchema", () => {
  it("drops nulls for optional fields", () => {
    const result = apiUserProfileSchema.parse({
      userId: "user-1",
      userName: "Test User",
      position: "Engineer",
      department: "IT",
      avatar: null,
      contacts: null,
    });

    expect(result.avatar).toBeUndefined();
    expect(result.contacts).toBeUndefined();
  });

  it("preserves provided contact arrays", () => {
    const result = apiUserProfileSchema.parse({
      userId: "user-2",
      userName: "Contact User",
      position: "Engineer",
      department: "IT",
      contacts: {
        telegram: ["@contact"],
        skype: null,
      },
    });

    expect(result.contacts?.telegram).toEqual(["@contact"]);
    expect(result.contacts?.skype).toBeUndefined();
  });
});

describe("usersResponseSchema", () => {
  it("rejects payload without users table", () => {
    const parsed = usersResponseSchema.safeParse({
      amountOfUsers: 0,
      isCached: false,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("organizationHierarchySchema", () => {
  it("accepts nested employee nodes", () => {
    const parsed = organizationHierarchySchema.parse({
      ceo: {
        userId: "ceo-1",
        userName: "CEO",
        position: "CEO",
        avatarUrl: "",
        subordinates: [],
      },
      departments: [
        {
          department: "IT",
          employees: [
            {
              userId: "lead-1",
              userName: "Lead",
              position: "Lead",
              avatarUrl: "",
              subordinates: [
                {
                  userId: "dev-1",
                  userName: "Dev",
                  position: "Dev",
                  avatarUrl: "",
                  subordinates: [],
                },
              ],
            },
          ],
        },
      ],
      totalEmployees: 2,
    });

    expect(parsed.departments[0].employees[0].subordinates).toHaveLength(1);
  });
});

describe("updateUserResponseSchema", () => {
  it("transforms snake_case user_id to camelCase userId", () => {
    const parsed = updateUserResponseSchema.parse({
      user_id: "10000000-0000-0000-0000-000000000056",
      userName: "Антонова Дарья Евгеньевна",
      bornDate: "1989-07-30T00:00:00Z",
      department: "Бухгалтерия",
      position: "Руководитель",
      workExperience: "2014-01-01T00:00:00Z",
      phoneNumber: "+7-495-505-05-05",
      city: "Москва",
      interests: "SMM, реклама",
      avatar: "",
      contacts: {
        telegram: [],
        instagram: [],
      },
    });

    expect(parsed.userId).toBe("10000000-0000-0000-0000-000000000056");
    expect(parsed.userName).toBe("Антонова Дарья Евгеньевна");
    expect(parsed.department).toBe("Бухгалтерия");
    expect(parsed.position).toBe("Руководитель");
  });

  it("accepts camelCase userId directly", () => {
    const parsed = updateUserResponseSchema.parse({
      userId: "test-user-id",
      userName: "Test User",
      department: "IT",
      position: "Developer",
      avatar: "",
      contacts: null,
    });

    expect(parsed.userId).toBe("test-user-id");
  });

  it("handles empty contacts arrays", () => {
    const parsed = updateUserResponseSchema.parse({
      user_id: "test-id",
      userName: "Test",
      department: "IT",
      position: "Dev",
      contacts: {
        telegram: [],
      },
    });

    expect(parsed.contacts).toEqual({ telegram: [] });
  });
});
