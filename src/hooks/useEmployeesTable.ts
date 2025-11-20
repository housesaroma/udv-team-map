import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type {
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import {
  adminService,
  type UpdateUserRequest,
  type UsersQueryParams,
} from "../services/adminService";
import type { User } from "../types";

export interface TableUser extends User {
  fullName: string;
  isEditing?: boolean;
  originalData?: User;
}

export interface TableState {
  page: number;
  limit: number;
  sort: string;
  positionFilter: string[];
  departmentFilter: string[];
}

export interface SortState {
  sortField?: string;
  sortOrder?: 1 | -1 | null;
}

type EditableField = "department" | "departmentColor" | "position";

const GLOBAL_SEARCH_DEBOUNCE = 500;

export const useEmployeesTable = () => {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [, setIsCached] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);

  const [tableState, setTableState] = useState<TableState>({
    page: 0,
    limit: 10,
    sort: "",
    positionFilter: [],
    departmentFilter: [],
  });

  const [sortState, setSortState] = useState<SortState>({
    sortField: undefined,
    sortOrder: null,
  });

  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [allPositions, setAllPositions] = useState<string[]>([]);

  const canEditUsers = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const role = window.localStorage.getItem("userRole");
    return role === "admin" || role === "hr";
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const positionFilterStr =
        tableState.positionFilter.length > 0
          ? tableState.positionFilter.join(",")
          : "";
      const departmentFilterStr =
        tableState.departmentFilter.length > 0
          ? tableState.departmentFilter.join(",")
          : "";

      const params: UsersQueryParams = {
        page: tableState.page + 1,
        limit: tableState.limit,
        sort: tableState.sort,
        positionFilter: positionFilterStr,
        departmentFilter: departmentFilterStr,
        isCached: false,
        SearchText: globalFilter.trim() || undefined,
      };

      const response = await adminService.getUsersTransformed(params);

      const tableUsers: TableUser[] = response.users.map(user => ({
        ...user,
        fullName: `${user.lastName} ${user.firstName} ${
          user.middleName || ""
        }`.trim(),
        isEditing: false,
      }));

      setUsers(tableUsers);
      setTotalRecords(response.totalRecords);
      setIsCached(response.isCached);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  }, [tableState, globalFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [departments, positions] = await Promise.all([
          adminService.getAllDepartments(),
          adminService.getAllPositions(),
        ]);
        setAllDepartments(departments);
        setAllPositions(positions);
      } catch (error) {
        console.error("Ошибка загрузки опций фильтров:", error);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setTableState(prev => ({
        ...prev,
        page: 0,
      }));
    }, GLOBAL_SEARCH_DEBOUNCE);
  };

  const handleDepartmentFilterChange = (selectedDepartments: string[]) => {
    setTableState(prev => ({
      ...prev,
      departmentFilter: selectedDepartments,
      page: 0,
    }));
  };

  const handlePositionFilterChange = (selectedPositions: string[]) => {
    setTableState(prev => ({
      ...prev,
      positionFilter: selectedPositions,
      page: 0,
    }));
  };

  const onPageChange = (event: DataTablePageEvent) => {
    setTableState(prev => ({
      ...prev,
      page: event.page ?? 0,
      limit: event.rows ?? prev.limit,
    }));
  };

  const onSort = (event: DataTableSortEvent) => {
    if (!event.sortField) {
      setTableState(prev => ({ ...prev, sort: "" }));
      setSortState({ sortField: undefined, sortOrder: null });
      return;
    }

    let serverFieldName = event.sortField;
    if (serverFieldName === "department.name") {
      serverFieldName = "department";
    } else if (serverFieldName === "fullName") {
      serverFieldName = "username";
    }

    const sortDirection = event.sortOrder === 1 ? "asc" : "desc";
    const sortString = `${serverFieldName}_${sortDirection}`;

    setTableState(prev => ({ ...prev, sort: sortString }));
    setSortState({
      sortField: event.sortField,
      sortOrder: event.sortOrder as 1 | -1 | null,
    });
  };

  const startEditing = (user: TableUser) => {
    if (!canEditUsers) return;

    setUsers(prevUsers =>
      prevUsers.map(u => ({
        ...u,
        isEditing: u.id === user.id,
        originalData: u.id === user.id ? { ...u } : u.originalData,
      }))
    );
    setEditingUserId(user.id);
    setSelectedUser(null);
  };

  const cancelEditing = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId && u.originalData
          ? {
              ...u.originalData,
              fullName:
                `${u.originalData.lastName} ${u.originalData.firstName} ${
                  u.originalData.middleName || ""
                }`.trim(),
              isEditing: false,
            }
          : { ...u, isEditing: false }
      )
    );
    setEditingUserId(null);
  };

  const saveEditing = async (user: TableUser) => {
    if (!canEditUsers) return;

    try {
      const updateData: UpdateUserRequest = {
        department: user.department.name,
        position: user.position,
      };

      await adminService.updateUser(user.id, updateData);

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, isEditing: false, originalData: undefined }
            : u
        )
      );
      setEditingUserId(null);
      console.log("Пользователь успешно обновлен");
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      cancelEditing(user.id);
    }
  };

  const handleFieldChange = (
    userId: string,
    field: EditableField,
    value: string
  ) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id !== userId) return u;

        if (field === "department") {
          return {
            ...u,
            department: {
              ...u.department,
              name: value,
            },
          };
        }

        if (field === "departmentColor") {
          return {
            ...u,
            department: {
              ...u.department,
              color: value,
            },
          };
        }

        return {
          ...u,
          position: value,
        };
      })
    );
  };

  const handleKeyPress = (event: KeyboardEvent, user: TableUser) => {
    if (event.key === "Enter") {
      void saveEditing(user);
    } else if (event.key === "Escape") {
      cancelEditing(user.id);
    }
  };

  const resetAllFilters = () => {
    setGlobalFilter("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setTableState(prev => ({
      ...prev,
      page: 0,
      positionFilter: [],
      departmentFilter: [],
      sort: "",
    }));
    setSortState({ sortField: undefined, sortOrder: null });
  };

  return {
    users,
    loading,
    totalRecords,
    globalFilter,
    tableState,
    sortState,
    allDepartments,
    allPositions,
    canEditUsers,
    selectedUser,
    editingUserId,
    handleGlobalFilterChange,
    refreshUsers: loadUsers,
    resetAllFilters,
    onPageChange,
    onSort,
    handleDepartmentFilterChange,
    handlePositionFilterChange,
    startEditing,
    cancelEditing,
    saveEditing,
    handleFieldChange,
    handleKeyPress,
    setSelectedUser,
  };
};
