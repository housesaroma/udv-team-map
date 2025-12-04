import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ContextMenu } from "primereact/contextmenu";
import { DataTable, type DataTableRowClickEvent } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import type { MenuItem } from "primereact/menuitem";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentColor } from "../../../utils/departmentUtils";
import {
  useEmployeesTable,
  type TableUser,
} from "../../../hooks/useEmployeesTable";
import type { SelectOption } from "../../../types/ui";
import { ROUTES } from "../../../constants/routes";

export const EmployeesTable: React.FC = () => {
  const navigate = useNavigate();

  const dt = useRef<DataTable<TableUser[]> | null>(null);
  const departmentOp = useRef<OverlayPanel | null>(null);
  const positionOp = useRef<OverlayPanel | null>(null);
  const contextMenu = useRef<ContextMenu | null>(null);

  const {
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
    handleFieldChange,
    handleKeyPress,
    setSelectedUser,
    rowValidationErrors,
  } = useEmployeesTable();

  // Обработчик контекстного меню
  const onContextMenu = (event: React.MouseEvent, user: TableUser) => {
    if (!canEditUsers || user.isEditing) return;

    event.preventDefault();
    setSelectedUser(user);
    contextMenu.current?.show(event);
  };

  // Элементы контекстного меню
  const contextMenuItems: MenuItem[] = [
    {
      label: "Редактировать",
      icon: "pi pi-pencil",
      command: () => {
        if (selectedUser) {
          startEditing(selectedUser);
        }
      },
      disabled: !!editingUserId, // Блокируем если уже идет редактирование
    },
  ];

  const handleDepartmentFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    departmentOp.current?.toggle(e);
  };

  const handlePositionFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    positionOp.current?.toggle(e);
  };

  const applyDepartmentFilter = (selectedDepartments: string[]) => {
    handleDepartmentFilterChange(selectedDepartments);
    departmentOp.current?.hide();
  };

  const applyPositionFilter = (selectedPositions: string[]) => {
    handlePositionFilterChange(selectedPositions);
    positionOp.current?.hide();
  };

  const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
    return [];
  };

  // Обработчик клика по строке
  const onRowClick = (event: DataTableRowClickEvent) => {
    const user = event.data as TableUser;
    // Не переходим на страницу профиля если редактируем
    if (!user.isEditing) {
      navigate(ROUTES.profile.byId(user.id));
    }
  };

  // Используем все доступные опции для фильтров
  const departments = useMemo<SelectOption[]>(
    () =>
      allDepartments.map(dept => ({
        label: dept,
        value: dept,
      })),
    [allDepartments]
  );

  const positions = useMemo<SelectOption[]>(
    () =>
      allPositions.map(pos => ({
        label: pos,
        value: pos,
      })),
    [allPositions]
  );

  // Функция для применения стилей к строкам
  const rowClassName = (rowData: TableUser) => {
    const baseClass =
      "border-b border-gray-100 hover:bg-gray-50 transition-colors";
    const cursorClass = rowData.isEditing ? "cursor-default" : "cursor-pointer";

    if (rowData.isEditing) {
      return `${baseClass} ${cursorClass} bg-blue-50 border-l-4 border-l-blue-500`;
    }

    return `${baseClass} ${cursorClass}`;
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

  // Шаблон для департамента с редактированием
  const departmentBodyTemplate = (rowData: TableUser) => {
    const rowErrors = rowValidationErrors[rowData.id];
    const departmentError = rowErrors?.department;

    if (rowData.isEditing) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: rowData.department.color }}
            />
            <Dropdown
              value={rowData.department.name}
              options={departments}
              onChange={e => {
                const nextDepartment =
                  typeof e.value === "string"
                    ? e.value
                    : rowData.department.name;
                handleFieldChange(rowData.id, "department", nextDepartment);
                handleFieldChange(
                  rowData.id,
                  "departmentColor",
                  getDepartmentColor(nextDepartment)
                );
              }}
              onKeyDown={e => handleKeyPress(e, rowData)}
              className={`w-full text-sm ${
                departmentError ? "p-invalid border-red-500" : ""
              }`}
              placeholder="Выберите подразделение"
              aria-invalid={departmentError ? "true" : "false"}
              itemTemplate={(option: SelectOption) => (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getDepartmentColor(option.value),
                    }}
                  />
                  <span>{option.label}</span>
                </div>
              )}
            />
          </div>
          {departmentError && (
            <small className="text-xs text-red-600 font-golos">
              {departmentError}
            </small>
          )}
        </div>
      );
    }

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

  // Шаблон для должности с редактированием
  const positionBodyTemplate = (rowData: TableUser) => {
    const rowErrors = rowValidationErrors[rowData.id];
    const positionError = rowErrors?.position;

    if (rowData.isEditing) {
      return (
        <div className="flex flex-col gap-1">
          <InputText
            value={rowData.position}
            onChange={e =>
              handleFieldChange(rowData.id, "position", e.target.value)
            }
            onKeyDown={e => handleKeyPress(e, rowData)}
            className={`w-full text-sm ${
              positionError ? "p-invalid border-red-500" : ""
            }`}
            placeholder="Введите должность"
            aria-invalid={positionError ? "true" : "false"}
          />
          {positionError && (
            <small className="text-xs text-red-600 font-golos">
              {positionError}
            </small>
          )}
        </div>
      );
    }

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
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 font-golos">ФИО</span>
      </div>
    );
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
              onChange={e => handleGlobalFilterChange(e.target.value)}
              placeholder="Поиск по всем столбцам..."
              className="border-gray-300 focus:border-accent pl-10"
            />
          </span>

          <Button
            icon="pi pi-refresh"
            className="p-button-outlined border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={refreshUsers}
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
              !tableState.sort &&
              !globalFilter
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
        onContextMenu={e =>
          onContextMenu(
            e.originalEvent as React.MouseEvent<HTMLTableRowElement>,
            e.data as TableUser
          )
        }
        onPage={onPageChange}
        onSort={onSort}
        selectionMode="single"
        lazy
        sortField={sortState.sortField}
        sortOrder={sortState.sortOrder}
        globalFilter={globalFilter}
        // PrimeReact ожидает object | undefined, поэтому не передаем null
        contextMenuSelection={selectedUser ?? undefined}
      >
        <Column
          field="fullName"
          header={fullNameHeaderTemplate}
          body={fullNameBodyTemplate}
          sortable
          style={{ minWidth: "320px" }}
        />

        <Column
          field="department.name"
          header={departmentHeaderTemplate}
          body={departmentBodyTemplate}
          sortable
          style={{ minWidth: "240px" }}
        />

        <Column
          field="position"
          header={positionHeaderTemplate}
          body={positionBodyTemplate}
          sortable
          style={{ minWidth: "250px" }}
        />
      </DataTable>

      {/* Контекстное меню */}
      {canEditUsers && (
        <ContextMenu
          ref={contextMenu}
          model={contextMenuItems}
          onHide={() => setSelectedUser(null)}
        />
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
              onChange={e => applyDepartmentFilter(toStringArray(e.value))}
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
              onClick={() => applyDepartmentFilter([])}
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
              onChange={e => applyPositionFilter(toStringArray(e.value))}
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
              onClick={() => applyPositionFilter([])}
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
