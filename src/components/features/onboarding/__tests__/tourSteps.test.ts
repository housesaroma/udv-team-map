import { describe, it, expect } from "vitest";
import { tourSteps, filterTourStepsByRole } from "../tourSteps";
import { ROUTES } from "../../../../constants/routes";

describe("tourSteps", () => {
  it("should export an array of tour steps", () => {
    expect(Array.isArray(tourSteps)).toBe(true);
    expect(tourSteps.length).toBeGreaterThan(0);
  });

  it("each step should have required properties", () => {
    tourSteps.forEach(step => {
      expect(step.target).toBeDefined();
      expect(typeof step.target).toBe("string");
      expect(step.target.startsWith("[data-tour=")).toBe(true);
      expect(step.title).toBeDefined();
      expect(typeof step.title).toBe("string");
      expect(step.content).toBeDefined();
      expect(typeof step.content).toBe("string");
      expect(step.placement).toBeDefined();
      expect(["top", "bottom", "left", "right"]).toContain(step.placement);
    });
  });

  it("should have steps for key UI elements", () => {
    const targets = tourSteps.map(s => s.target);

    // Check for important tour targets
    expect(targets.some(t => t.includes("logo"))).toBe(true);
    expect(targets.some(t => t.includes("zoom-controls"))).toBe(true);
  });

  it("should have descriptive titles and content", () => {
    tourSteps.forEach(step => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.content.length).toBeGreaterThan(10);
    });
  });

  it("first step should be about logo/navigation", () => {
    const firstStep = tourSteps[0];
    expect(firstStep.target).toContain("logo");
  });

  it("should include admin button step with hr/admin roles", () => {
    const adminStep = tourSteps.find(s => s.target.includes("admin-button"));
    expect(adminStep).toBeDefined();
    expect(adminStep?.roles).toEqual(["hr", "admin"]);
  });

  it("should include profile button step without roles restriction", () => {
    const profileStep = tourSteps.find(s =>
      s.target.includes("profile-button")
    );
    expect(profileStep).toBeDefined();
    expect(profileStep?.roles).toBeUndefined();
  });

  it("should have tree-editor-button step with hr and admin roles", () => {
    const treeEditorStep = tourSteps.find(s =>
      s.target.includes("tree-editor-button")
    );
    expect(treeEditorStep).toBeDefined();
    expect(treeEditorStep?.roles).toEqual(["hr", "admin"]);
  });

  it("second step (logo) should have disableScroll", () => {
    // Второй шаг использует тот же target что и первый (logo), но с disableScroll
    const stepsWithLogo = tourSteps.filter(s => s.target.includes("logo"));
    const stepWithDisableScroll = stepsWithLogo.find(
      s => s.disableScroll === true
    );
    expect(stepWithDisableScroll).toBeDefined();
  });

  it("zoom-controls step should have correct hotkey format", () => {
    const zoomStep = tourSteps.find(s => s.target.includes("zoom-controls"));
    expect(zoomStep).toBeDefined();
    expect(zoomStep?.content).toContain('Ctrl + "+"');
    expect(zoomStep?.content).toContain('Ctrl + "-"');
    expect(zoomStep?.content).toContain('Ctrl + "0"');
  });

  it("each step should have a route defined", () => {
    tourSteps.forEach(step => {
      expect(step.route).toBeDefined();
      expect(typeof step.route).toBe("string");
    });
  });

  it("should have steps that navigate to different pages", () => {
    const routes = tourSteps.map(s => s.route);
    expect(routes).toContain(ROUTES.root);
    expect(routes).toContain(ROUTES.treeEditor);
    expect(routes).toContain(ROUTES.admin);
    expect(routes).toContain(ROUTES.profile.root);
  });

  it("should have page-specific steps for admin pages", () => {
    // Информационные шаги на страницах теперь привязаны к logo, проверяем по route
    const adminPageStep = tourSteps.find(
      s =>
        s.route === ROUTES.admin &&
        s.target.includes("logo") &&
        s.roles?.includes("admin")
    );
    expect(adminPageStep).toBeDefined();
    expect(adminPageStep?.title).toContain("Панель администратора");

    const treeEditorPageStep = tourSteps.find(
      s =>
        s.route === ROUTES.treeEditor &&
        s.target.includes("logo") &&
        s.roles?.includes("admin")
    );
    expect(treeEditorPageStep).toBeDefined();
    expect(treeEditorPageStep?.title).toContain("Редактор структуры");
  });

  it("should have profile page step", () => {
    // Информационный шаг на странице profile теперь привязан к logo
    const profilePageStep = tourSteps.find(
      s =>
        s.route === ROUTES.profile.root &&
        s.target.includes("logo") &&
        !s.requiresClick
    );
    expect(profilePageStep).toBeDefined();
    expect(profilePageStep?.title).toContain("Страница профиля");
  });

  it("about-button step should mention tour can be restarted", () => {
    const aboutStep = tourSteps.find(s => s.target.includes("about-button"));
    expect(aboutStep).toBeDefined();
    expect(aboutStep?.content.toLowerCase()).toContain("тур");
    expect(aboutStep?.content.toLowerCase()).toContain("ещё раз");
  });
});

describe("filterTourStepsByRole", () => {
  it("should return all steps without roles restriction for employee", () => {
    const filtered = filterTourStepsByRole("employee");
    // Employee should see admin-button (for employees table) but not tree-editor-button
    expect(filtered.some(s => s.target.includes("admin-button"))).toBe(true);
    expect(filtered.every(s => !s.target.includes("tree-editor-button"))).toBe(
      true
    );
    // Employee can see admin route but only with employee role
    expect(
      filtered.filter(s => s.route === ROUTES.admin).every(
        s => !s.roles || s.roles.includes("employee")
      )
    ).toBe(true);
    expect(filtered.every(s => s.route !== ROUTES.treeEditor || !s.roles)).toBe(
      true
    );
    // But should see logo steps, zoom-controls, about-button, profile-button, and profile page step
    expect(
      filtered.filter(s => s.target.includes("logo")).length
    ).toBeGreaterThanOrEqual(2);
    expect(filtered.some(s => s.target.includes("zoom-controls"))).toBe(true);
    expect(filtered.some(s => s.target.includes("about-button"))).toBe(true);
    expect(filtered.some(s => s.target.includes("profile-button"))).toBe(true);
    expect(
      filtered.some(s => s.route === ROUTES.profile.root && !s.requiresClick)
    ).toBe(true);
  });

  it("should return all admin steps for hr role (same as admin)", () => {
    const filtered = filterTourStepsByRole("hr");
    // HR should see admin-button and admin page info step
    expect(filtered.some(s => s.target.includes("admin-button"))).toBe(true);
    expect(
      filtered.some(
        s =>
          s.route === ROUTES.admin &&
          s.target.includes("logo") &&
          s.roles?.includes("hr")
      )
    ).toBe(true);
    // HR should also see tree-editor-button and tree-editor page info step (same rights as admin)
    expect(filtered.some(s => s.target.includes("tree-editor-button"))).toBe(
      true
    );
    expect(
      filtered.some(
        s =>
          s.route === ROUTES.treeEditor &&
          s.target.includes("logo") &&
          s.roles?.includes("hr")
      )
    ).toBe(true);
    // And all basic steps
    expect(filtered.some(s => s.target.includes("logo"))).toBe(true);
    expect(filtered.some(s => s.target.includes("profile-button"))).toBe(true);
    expect(
      filtered.some(s => s.route === ROUTES.profile.root && !s.requiresClick)
    ).toBe(true);
  });

  it("should return all steps for admin role", () => {
    const filtered = filterTourStepsByRole("admin");
    // Admin should see everything
    expect(filtered.some(s => s.target.includes("admin-button"))).toBe(true);
    expect(
      filtered.some(
        s =>
          s.route === ROUTES.admin &&
          s.target.includes("logo") &&
          s.roles?.includes("admin")
      )
    ).toBe(true);
    expect(filtered.some(s => s.target.includes("tree-editor-button"))).toBe(
      true
    );
    expect(
      filtered.some(
        s =>
          s.route === ROUTES.treeEditor &&
          s.target.includes("logo") &&
          s.roles?.includes("admin")
      )
    ).toBe(true);
    expect(filtered.some(s => s.target.includes("logo"))).toBe(true);
    expect(filtered.some(s => s.target.includes("profile-button"))).toBe(true);
    expect(
      filtered.some(s => s.route === ROUTES.profile.root && !s.requiresClick)
    ).toBe(true);
    // Admin gets all 13 steps (including 3 "return to home" steps)
    expect(filtered.length).toBe(13);
  });

  it("employee should get 10 steps (including employees table)", () => {
    const filtered = filterTourStepsByRole("employee");
    // Employee gets: logo x2, zoom, admin-button (employees table), admin page (employee view), return home, profile-button, profile-page, return home, about
    expect(filtered.length).toBe(10);
  });

  it("hr should get 13 steps (same as admin)", () => {
    const filtered = filterTourStepsByRole("hr");
    expect(filtered.length).toBe(13);
  });
});
