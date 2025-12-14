import { describe, it, expect } from "vitest";
import { tourSteps, filterTourStepsByRole } from "../tourSteps";

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
    expect(targets.some(t => t.includes("organization-tree"))).toBe(true);
    expect(targets.some(t => t.includes("zoom-controls"))).toBe(true);
  });

  it("should have descriptive titles and content", () => {
    tourSteps.forEach(step => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.content.length).toBeGreaterThan(10);
    });
  });

  it("should have unique targets for each step", () => {
    const targets = tourSteps.map(s => s.target);
    const uniqueTargets = new Set(targets);
    expect(uniqueTargets.size).toBe(targets.length);
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
});

describe("filterTourStepsByRole", () => {
  it("should return all steps without roles restriction for employee", () => {
    const filtered = filterTourStepsByRole("employee");
    // Employee should not see admin-button and tree-editor-button
    expect(filtered.every(s => !s.target.includes("admin-button"))).toBe(true);
    expect(filtered.every(s => !s.target.includes("tree-editor-button"))).toBe(
      true
    );
    // But should see logo, organization-tree, zoom-controls, about-button, profile-button
    expect(filtered.some(s => s.target.includes("logo"))).toBe(true);
    expect(filtered.some(s => s.target.includes("organization-tree"))).toBe(
      true
    );
    expect(filtered.some(s => s.target.includes("zoom-controls"))).toBe(true);
    expect(filtered.some(s => s.target.includes("about-button"))).toBe(true);
    expect(filtered.some(s => s.target.includes("profile-button"))).toBe(true);
  });

  it("should return all admin steps for hr role (same as admin)", () => {
    const filtered = filterTourStepsByRole("hr");
    // HR should see admin-button
    expect(filtered.some(s => s.target.includes("admin-button"))).toBe(true);
    // HR should also see tree-editor-button (same rights as admin)
    expect(filtered.some(s => s.target.includes("tree-editor-button"))).toBe(
      true
    );
    // And all basic steps
    expect(filtered.some(s => s.target.includes("logo"))).toBe(true);
    expect(filtered.some(s => s.target.includes("profile-button"))).toBe(true);
  });

  it("should return all steps for admin role", () => {
    const filtered = filterTourStepsByRole("admin");
    // Admin should see everything
    expect(filtered.some(s => s.target.includes("admin-button"))).toBe(true);
    expect(filtered.some(s => s.target.includes("tree-editor-button"))).toBe(
      true
    );
    expect(filtered.some(s => s.target.includes("logo"))).toBe(true);
    expect(filtered.some(s => s.target.includes("profile-button"))).toBe(true);
    // Admin gets all 7 steps
    expect(filtered.length).toBe(7);
  });

  it("employee should get 5 steps (excluding admin-button and tree-editor-button)", () => {
    const filtered = filterTourStepsByRole("employee");
    expect(filtered.length).toBe(5);
  });

  it("hr should get 7 steps (same as admin)", () => {
    const filtered = filterTourStepsByRole("hr");
    expect(filtered.length).toBe(7);
  });
});
