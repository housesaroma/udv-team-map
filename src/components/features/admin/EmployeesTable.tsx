import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import React, { useEffect, useRef, useState } from "react";
import { adminService } from "../../../services/adminService";
import type { User } from "../../../types";

interface TableUser extends User {
    fullName: string;
}

export const EmployeesTable: React.FC = () => {
    const [users, setUsers] = useState<TableUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
    const [positionFilter, setPositionFilter] = useState<string[]>([]);

    const dt = useRef<DataTable<TableUser[]>>(null);
    const op = useRef<OverlayPanel>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersData = await adminService.getUsersTransformed();

            const usersWithFullName: TableUser[] = usersData.map((user) => ({
                ...user,
                fullName: `${user.lastName} ${user.firstName} ${
                    user.middleName || ""
                }`,
            }));

            setUsers(usersWithFullName);
        } catch (error) {
            console.error("Ошибка загрузки пользователей:", error);
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация данных
    const filteredUsers = users.filter((user) => {
        const matchesGlobal =
            !globalFilter ||
            user.fullName.toLowerCase().includes(globalFilter.toLowerCase()) ||
            user.department.name
                .toLowerCase()
                .includes(globalFilter.toLowerCase()) ||
            user.position.toLowerCase().includes(globalFilter.toLowerCase());

        const matchesDepartment =
            departmentFilter.length === 0 ||
            departmentFilter.includes(user.department.name);
        const matchesPosition =
            positionFilter.length === 0 ||
            positionFilter.includes(user.position);

        return matchesGlobal && matchesDepartment && matchesPosition;
    });

    // Получаем уникальные значения для фильтров
    const departments = Array.from(
        new Set(users.map((user) => user.department.name))
    ).map((dept) => ({
        label: dept,
        value: dept,
    }));

    const positions = Array.from(
        new Set(users.map((user) => user.position))
    ).map((pos) => ({
        label: pos,
        value: pos,
    }));

    // Функция для применения стилей к строкам
    const rowClassName = () => {
        return "border-b border-gray-100 hover:bg-gray-50 transition-colors";
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
                <span className="text-gray-900 font-inter">
                    {rowData.fullName}
                </span>
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
        return (
            <span className="text-gray-700 font-inter">{rowData.position}</span>
        );
    };

    // Header для ФИО
    const fullNameHeaderTemplate = () => {
        return <span className="font-bold text-gray-900 font-golos">ФИО</span>;
    };

    // Header для департамента
    const departmentHeaderTemplate = () => {
        return (
            <span className="font-bold text-gray-900 font-golos">
                Подразделение
            </span>
        );
    };

    // Header для должности
    const positionHeaderTemplate = () => {
        return (
            <span className="font-bold text-gray-900 font-golos">
                Должность
            </span>
        );
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary font-golos">
                    Таблица сотрудников
                </h2>

                {/* Общий поиск и фильтры */}
                <div className="flex gap-3 items-center">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search text-gray-400 ml-3" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Поиск по всем столбцам..."
                            className="border-gray-300 focus:border-accent pl-10"
                        />
                    </span>

                    <Button
                        icon="pi pi-filter"
                        className="p-button-outlined border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={(e) => op.current?.toggle(e)}
                        tooltip="Фильтры"
                        tooltipOptions={{ position: "top" }}
                    />

                    <Button
                        icon="pi pi-refresh"
                        className="p-button-outlined border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={loadUsers}
                        tooltip="Обновить данные"
                        tooltipOptions={{ position: "top" }}
                    />
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredUsers}
                loading={loading}
                globalFilter={globalFilter}
                sortMode="multiple"
                removableSort
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Показано {first} - {last} из {totalRecords} сотрудников"
                emptyMessage="Сотрудники не найдены"
                className="p-datatable-sm border border-gray-200 rounded"
                paginatorClassName="border-t border-gray-200 px-4 py-3"
                rowClassName={rowClassName}
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

            {/* Оверлей с фильтрами */}
            <OverlayPanel ref={op} className="w-80">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-primary font-golos mb-4">
                        Фильтры
                    </h3>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 font-golos">
                            Подразделения
                        </label>
                        <MultiSelect
                            value={departmentFilter}
                            options={departments}
                            onChange={(e) => setDepartmentFilter(e.value)}
                            placeholder="Выберите подразделения"
                            className="w-full"
                            display="chip"
                            showSelectAll
                            selectAllLabel="Выбрать все"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 font-golos">
                            Должности
                        </label>
                        <MultiSelect
                            value={positionFilter}
                            options={positions}
                            onChange={(e) => setPositionFilter(e.value)}
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
                            onClick={() => {
                                setDepartmentFilter([]);
                                setPositionFilter([]);
                            }}
                        />
                        <Button
                            label="Применить"
                            icon="pi pi-check"
                            className="p-button-primary bg-accent border-accent"
                            onClick={() => op.current?.hide()}
                        />
                    </div>
                </div>
            </OverlayPanel>
        </div>
    );
};
