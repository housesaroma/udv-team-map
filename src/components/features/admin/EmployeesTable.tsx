import { Button } from "primereact/button";
import { Column } from "primereact/column";
import {
  DataTable,
  type DataTablePageEvent,
  type DataTableRowClickEvent,
  type DataTableSortEvent,
} from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminService,
  type UsersQueryParams,
} from "../../../services/adminService";
import type { User } from "../../../types";

interface TableUser extends User {
  fullName: string;
}

interface TableState {
  page: number;
  limit: number;
  sort: string;
  positionFilter: string[];
  departmentFilter: string[];
}

interface SortState {
  sortField?: string;
  sortOrder?: 1 | -1 | null;
}

export const EmployeesTable: React.FC = () => {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isCached, setIsCached] = useState(false);

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

  const navigate = useNavigate();

  const dt = useRef<DataTable<TableUser[]>>(null);
  const departmentOp = useRef<OverlayPanel>(null);
  const positionOp = useRef<OverlayPanel>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Преобразуем массивы фильтров в строки (подготовка для множественного выбора)
      const positionFilterStr =
        tableState.positionFilter.length > 0
          ? tableState.positionFilter.join(",")
          : "";
      const departmentFilterStr =
        tableState.departmentFilter.length > 0
          ? tableState.departmentFilter.join(",")
          : "";

      const params: UsersQueryParams = {
        page: tableState.page + 1, // Сервер использует 1-based индексацию
        limit: tableState.limit,
        sort: tableState.sort,
        positionFilter: positionFilterStr,
        departmentFilter: departmentFilterStr,
        isCached: true,
      };

      const response = await adminService.getUsersTransformed(params);

      // Преобразуем User[] в TableUser[]
      const tableUsers: TableUser[] = response.users.map(user => ({
        ...user,
        fullName: `${user.lastName} ${user.firstName} ${
          user.middleName || ""
        }`.trim(),
      }));

      setUsers(tableUsers);
      setTotalRecords(response.totalRecords);
      setIsCached(response.isCached);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  }, [tableState]); // Добавляем tableState как зависимость

  useEffect(() => {
    loadUsers();
  }, [loadUsers]); // Теперь loadUsers стабилен благодаря useCallback

  // Обработчик пагинации с правильным типом
  const onPageChange = (event: DataTablePageEvent) => {
    setTableState(prev => ({
      ...prev,
      page: event.page ?? 0,
      limit: event.rows ?? 10,
    }));
  };

  // Обработчик сортировки
  const onSort = (event: DataTableSortEvent) => {
    if (!event.sortField) {
      // Если сортировка отменена
      setTableState(prev => ({ ...prev, sort: "" }));
      setSortState({ sortField: undefined, sortOrder: null });
      return;
    }

    // Преобразуем названия полей для сервера
    let serverFieldName = event.sortField;

    if (serverFieldName === "department.name") {
      serverFieldName = "department";
    } else if (serverFieldName === "fullName") {
      serverFieldName = "username";
    }
    // position остается как есть

    const sortDirection = event.sortOrder === 1 ? "asc" : "desc";
    const sortString = `${serverFieldName}_${sortDirection}`;

    setTableState(prev => ({ ...prev, sort: sortString }));
    setSortState({
      sortField: event.sortField,
      sortOrder: event.sortOrder as 1 | -1 | null,
    });
  };

  // Обработчик клика по кнопке фильтра департаментов
  const handleDepartmentFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие события
    departmentOp.current?.toggle(e);
  };

  // Обработчик клика по кнопке фильтра должностей
  const handlePositionFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие события
    positionOp.current?.toggle(e);
  };

  // Обработчик фильтрации по департаментам
  const handleDepartmentFilterChange = (selectedDepartments: string[]) => {
    setTableState(prev => ({
      ...prev,
      departmentFilter: selectedDepartments,
      page: 0, // Сбрасываем на первую страницу при изменении фильтра
    }));
    departmentOp.current?.hide();
  };

  // Обработчик фильтрации по должностям
  const handlePositionFilterChange = (selectedPositions: string[]) => {
    setTableState(prev => ({
      ...prev,
      positionFilter: selectedPositions,
      page: 0, // Сбрасываем на первую страницу при изменении фильтра
    }));
    positionOp.current?.hide();
  };

  // Сброс всех фильтров
  const resetAllFilters = () => {
    setGlobalFilter("");
    setTableState(prev => ({
      ...prev,
      page: 0,
      positionFilter: [],
      departmentFilter: [],
      sort: "",
    }));
    // Сбрасываем сортировку
    setSortState({ sortField: undefined, sortOrder: null });
  };

  // Обработчик клика по строке
  const onRowClick = (event: DataTableRowClickEvent) => {
    const user = event.data as TableUser;
    navigate(`/profile/${user.id}`);
  };

  // Получаем уникальные значения для фильтров (для MultiSelect)
  const departments = Array.from(
    new Set(users.map(user => user.department.name))
  ).map(dept => ({
    label: dept,
    value: dept,
  }));

  const positions = Array.from(new Set(users.map(user => user.position))).map(
    pos => ({
      label: pos,
      value: pos,
    })
  );

  // Функция для применения стилей к строкам
  const rowClassName = () => {
    return "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer";
  };

  // Шаблон для ФИО с аватаром
  const fullNameBodyTemplate = (rowData: TableUser) => {
    return (
      <div className="flex items-center gap-3">
        {rowData.avatar ? (
          <img
            src={rowData.avatar}
            alt={rowData.fullName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: rowData.department.color }}
          >
            {rowData.firstName?.[0]}
            {rowData.lastName?.[0]}
          </div>
        )}
        <span className="text-gray-900 font-inter">{rowData.fullName}</span>
      </div>
    );
  };

  // Шаблон для департамента с цветом
  const departmentBodyTemplate = (rowData: TableUser) => {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: rowData.department.color }}
        />
        <span className="text-gray-700 font-inter">
          {rowData.department.name}
        </span>
      </div>
    );
  };

  // Шаблон для должности
  const positionBodyTemplate = (rowData: TableUser) => {
    return <span className="text-gray-700 font-inter">{rowData.position}</span>;
  };

  // Header для департамента с иконкой фильтра
  const departmentHeaderTemplate = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 font-golos">
          Подразделение
        </span>
        <Button
          icon={`pi pi-filter${
            tableState.departmentFilter.length > 0 ? "-fill" : ""
          }`}
          className="p-button-text p-button-sm w-2 h-2 text-gray-500"
          onClick={handleDepartmentFilterClick}
          tooltip="Фильтр по подразделениям"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  // Header для должности с иконкой фильтра
  const positionHeaderTemplate = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 font-golos">Должность</span>
        <Button
          icon={`pi pi-filter${
            tableState.positionFilter.length > 0 ? "-fill" : ""
          }`}
          className="p-button-text p-button-sm w-2 h-2 text-gray-500"
          onClick={handlePositionFilterClick}
          tooltip="Фильтр по должностям"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  // Header для ФИО
  const fullNameHeaderTemplate = () => {
    return <span className="font-bold text-gray-900 font-golos">ФИО</span>;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary font-golos">
          Таблица сотрудников
        </h2>

        {/* Общий поиск и кнопки */}
        <div className="flex gap-3 items-center">
          <span className="p-input-icon-left">
            <i className="pi pi-search text-gray-400 ml-3" />
            <InputText
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Поиск по всем столбцам..."
              className="border-gray-300 focus:border-accent pl-10"
            />
          </span>

          <Button
            icon="pi pi-refresh"
            className="p-button-outlined border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={loadUsers}
            tooltip="Обновить данные"
            tooltipOptions={{ position: "top" }}
          />

          <Button
            icon="pi pi-times"
            className="p-button-outlined border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={resetAllFilters}
            tooltip="Сбросить все фильтры"
            tooltipOptions={{ position: "top" }}
            disabled={
              tableState.positionFilter.length === 0 &&
              tableState.departmentFilter.length === 0 &&
              !tableState.sort
            }
          />
        </div>
      </div>

      <DataTable
        ref={dt}
        value={users}
        loading={loading}
        sortMode="single"
        removableSort
        paginator
        rows={tableState.limit}
        first={tableState.page * tableState.limit}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Показано {first} - {last} из {totalRecords} сотрудников"
        emptyMessage="Сотрудники не найдены"
        className="p-datatable-sm border border-gray-200 rounded"
        paginatorClassName="border-t border-gray-200 px-4 py-3"
        rowClassName={rowClassName}
        onRowClick={onRowClick}
        onPage={onPageChange}
        onSort={onSort}
        selectionMode="single"
        lazy
        sortField={sortState.sortField}
        sortOrder={sortState.sortOrder}
      >
        <Column
          field="fullName"
          header={fullNameHeaderTemplate}
          body={fullNameBodyTemplate}
          sortable
          style={{ minWidth: "300px" }}
        />

        <Column
          field="department.name"
          header={departmentHeaderTemplate}
          body={departmentBodyTemplate}
          sortable
          style={{ minWidth: "220px" }}
        />

        <Column
          field="position"
          header={positionHeaderTemplate}
          body={positionBodyTemplate}
          sortable
          style={{ minWidth: "250px" }}
        />
      </DataTable>

      {/* Информация о кэшировании */}
      {isCached && (
        <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <i className="pi pi-database" />
          <span>Данные загружены из кэша</span>
        </div>
      )}

      {/* Оверлей для фильтра подразделений */}
      <OverlayPanel ref={departmentOp} className="w-80">
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-primary font-golos mb-4">
            Фильтр по подразделениям
          </h3>

          <div className="space-y-2">
            <MultiSelect
              value={tableState.departmentFilter}
              options={departments}
              onChange={e => handleDepartmentFilterChange(e.value)}
              placeholder="Выберите подразделения"
              className="w-full"
              display="chip"
              showSelectAll
              selectAllLabel="Выбрать все"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button
              label="Сбросить"
              icon="pi pi-times"
              className="p-button-text text-gray-600"
              onClick={() => handleDepartmentFilterChange([])}
            />
            <Button
              label="Применить"
              icon="pi pi-check"
              className="p-button-primary bg-accent border-accent"
              onClick={() => departmentOp.current?.hide()}
            />
          </div>
        </div>
      </OverlayPanel>

      {/* Оверлей для фильтра должностей */}
      <OverlayPanel ref={positionOp} className="w-80">
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-primary font-golos mb-4">
            Фильтр по должностям
          </h3>

          <div className="space-y-2">
            <MultiSelect
              value={tableState.positionFilter}
              options={positions}
              onChange={e => handlePositionFilterChange(e.value)}
              placeholder="Выберите должности"
              className="w-full"
              display="chip"
              showSelectAll
              selectAllLabel="Выбрать все"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button
              label="Сбросить"
              icon="pi pi-times"
              className="p-button-text text-gray-600"
              onClick={() => handlePositionFilterChange([])}
            />
            <Button
              label="Применить"
              icon="pi pi-check"
              className="p-button-primary bg-accent border-accent"
              onClick={() => positionOp.current?.hide()}
            />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};
