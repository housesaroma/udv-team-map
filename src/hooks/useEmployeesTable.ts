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
import type { SortDirection, SortToken, TableSortField } from "../types/ui";
import { updateUserRequestSchema } from "../validation/adminSchemas";

export interface TableUser extends User {
  fullName: string;
  isEditing?: boolean;
  originalData?: User;
}

export interface TableState {
  page: number;
  limit: number;
  sort: SortToken;
  positionFilter: string[];
  departmentFilter: string[];
}

export interface SortState {
  sortField?: string;
  sortOrder?: 1 | -1 | null;
}

type EditableField = "department" | "departmentColor" | "position";
type RowValidationErrors = Partial<
  Record<Extract<EditableField, "department" | "position">, string>
>;

const GLOBAL_SEARCH_DEBOUNCE = 500;
const NO_SORT: SortToken = "";
const CLIENT_TO_SERVER_SORT_FIELD: Record<string, TableSortField> = {
  "department.name": "department",
  fullName: "username",
  position: "position",
};

export const useEmployeesTable = () => {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [, setIsCached] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const [rowValidationErrors, setRowValidationErrors] = useState<
    Record<string, RowValidationErrors>
  >({});

  const clearRowValidation = useCallback((userId: string) => {
    setRowValidationErrors(prevErrors => {
      if (!prevErrors[userId]) {
        return prevErrors;
      }
      const nextErrors = { ...prevErrors };
      delete nextErrors[userId];
      return nextErrors;
    });
  }, []);

  const applyRowValidationErrors = useCallback(
    (userId: string, errors: RowValidationErrors) => {
      setRowValidationErrors(prev => ({
        ...prev,
        [userId]: errors,
      }));
    },
    []
  );

  const clearFieldError = useCallback(
    (userId: string, field: keyof RowValidationErrors) => {
      setRowValidationErrors(prevErrors => {
        const rowErrors = prevErrors[userId];
        if (!rowErrors || !rowErrors[field]) {
          return prevErrors;
        }

        const nextRowErrors: RowValidationErrors = { ...rowErrors };
        delete nextRowErrors[field];

        const nextErrors = { ...prevErrors };
        if (Object.keys(nextRowErrors).length === 0) {
          delete nextErrors[userId];
        } else {
          nextErrors[userId] = nextRowErrors;
        }

        return nextErrors;
      });
    },
    []
  );

  const [tableState, setTableState] = useState<TableState>({
    page: 0,
    limit: 10,
    sort: NO_SORT,
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

  const loadUsers = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const positionFilterStr =
          tableState.positionFilter.length > 0
            ? tableState.positionFilter.join("_")
            : "";
        const departmentFilterStr =
          tableState.departmentFilter.length > 0
            ? tableState.departmentFilter.join("_")
            : "";

        const params: UsersQueryParams = {
          page: tableState.page + 1,
          limit: tableState.limit,
          sort: tableState.sort,
          positionFilter: positionFilterStr,
          departmentFilter: departmentFilterStr,
          isCached: false,
          SearchText: debouncedSearchText.trim() || undefined,
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
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [tableState, debouncedSearchText]
  );

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
      setDebouncedSearchText(value);
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
      setTableState(prev => ({ ...prev, sort: NO_SORT }));
      setSortState({ sortField: undefined, sortOrder: null });
      return;
    }

    const serverFieldName =
      CLIENT_TO_SERVER_SORT_FIELD[
        event.sortField as keyof typeof CLIENT_TO_SERVER_SORT_FIELD
      ];

    if (!serverFieldName) {
      setTableState(prev => ({ ...prev, sort: NO_SORT }));
      setSortState({ sortField: undefined, sortOrder: null });
      return;
    }

    const sortDirection: SortDirection = event.sortOrder === 1 ? "asc" : "desc";
    const sortString: SortToken = `${serverFieldName}_${sortDirection}`;

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
    clearRowValidation(user.id);
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
    clearRowValidation(userId);
  };

  const saveEditing = async (user: TableUser) => {
    if (!canEditUsers) return;

    const normalizedData = {
      userId: user.id,
      department: user.department.name.trim(),
      position: user.position.trim(),
    };

    const validationResult = updateUserRequestSchema.safeParse(normalizedData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const nextErrors: RowValidationErrors = {};

      if (fieldErrors.department?.[0]) {
        nextErrors.department = fieldErrors.department[0];
      }
      if (fieldErrors.position?.[0]) {
        nextErrors.position = fieldErrors.position[0];
      }

      applyRowValidationErrors(user.id, nextErrors);
      return;
    }

    // Оптимистичное обновление UI - сразу применяем изменения
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === user.id
          ? { ...u, isEditing: false, originalData: undefined }
          : u
      )
    );
    setEditingUserId(null);
    clearRowValidation(user.id);

    // Отправляем запрос в фоне
    try {
      const updateData: UpdateUserRequest = validationResult.data;
      await adminService.updateUser(user.id, updateData);
      console.log("Пользователь успешно обновлен на сервере");
    } catch (error) {
      console.error("Ошибка при обновлении пользователя на сервере:", error);
      // При ошибке перезагружаем данные с сервера (без спиннера)
      await loadUsers(true);
    }
  };

  const handleFieldChange = (
    userId: string,
    field: EditableField,
    value: string
  ) => {
    if (field === "department" || field === "position") {
      clearFieldError(userId, field);
    }

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
    setDebouncedSearchText("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setTableState(prev => ({
      ...prev,
      page: 0,
      positionFilter: [],
      departmentFilter: [],
      sort: NO_SORT,
    }));
    setSortState({ sortField: undefined, sortOrder: null });
  };

  const refreshUsers = useCallback(() => {
    return loadUsers(false);
  }, [loadUsers]);

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
    refreshUsers,
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
    rowValidationErrors,
  };
};
