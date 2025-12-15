import React from "react";
import { Message } from "primereact/message";
import CustomCanvas from "../components/features/map/CustomCanvas";
import { FullHierarchyTreeEditor } from "../components/features/organization/FullHierarchyTreeEditor";
import { PermissionGuard } from "../components/features/auth/PermissionGuard";
import { Permission } from "../types/permissions";

const ForbiddenFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-primary">
    <Message
      severity="warn"
      text="У вас нет доступа к редактированию дерева"
      className="w-full max-w-md"
    />
  </div>
);

const TreeEditorPage: React.FC = () => {
  return (
    <PermissionGuard
      permission={Permission.ACCESS_ADMIN_PANEL}
      fallback={<ForbiddenFallback />}
    >
      <div
        className="w-full h-100vh bg-primary relative"
        data-tour="tree-editor-page"
      >
        <CustomCanvas>
          <FullHierarchyTreeEditor />
        </CustomCanvas>
      </div>
    </PermissionGuard>
  );
};

export default TreeEditorPage;
