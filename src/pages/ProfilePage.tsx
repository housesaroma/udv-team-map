import React from "react";
import { useParams } from "react-router-dom";

const ProfilePage: React.FC = () => {
    const { userId } = useParams();

    return (
        <div className="container mx-auto p-6 bg-primary min-h-screen">
            <div className="bg-secondary rounded-lg shadow-md p-8 text-center">
                <h1 className="text-3xl font-bold text-primary mb-4 font-golos">
                    {userId ? `Профиль сотрудника #${userId}` : "Мой профиль"}
                </h1>
                <p className="text-gray-600 text-lg font-golos">
                    Страница профиля в разработке
                </p>
                <div className="mt-6 p-4 bg-department-hr bg-opacity-10 rounded-md border border-department-hr">
                    <p className="text-gray-700 font-golos">
                        Здесь будет отображаться информация о сотруднике,
                        фотография, контактные данные и возможность
                        редактирования (для своего профиля)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
