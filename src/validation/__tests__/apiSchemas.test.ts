import { describe, expect, it } from "vitest";
import {
  apiUserProfileSchema,
  organizationHierarchySchema,
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
