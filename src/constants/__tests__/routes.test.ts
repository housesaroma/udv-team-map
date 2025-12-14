import { describe, expect, it } from "vitest";
import { ROUTES, toRelativePath } from "../routes";

describe("routes constants", () => {
  it("exposes stable absolute paths", () => {
    expect(ROUTES.root).toBe("/");
    expect(ROUTES.login).toBe("/login");
    expect(ROUTES.admin).toBe("/admin");
    expect(ROUTES.treeEditor).toBe("/tree-editor");
    expect(ROUTES.about).toBe("/about");
    expect(ROUTES.department.byId(7)).toBe("/department/7");
    expect(ROUTES.profile.byId("42")).toBe("/profile/42");
  });

  it("converts absolute paths to relative paths", () => {
    expect(toRelativePath("/admin")).toBe("admin");
    expect(toRelativePath("profile/:id?")).toBe("profile/:id?");
  });
});
