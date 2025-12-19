import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

interface BackToTreeButtonProps {
  className?: string;
}

export const BackToTreeButton: React.FC<BackToTreeButtonProps> = ({ 
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleBackToTree = () => {
    navigate(ROUTES.root);
  };

  return (
    <Button
      icon="pi pi-arrow-left"
      onClick={handleBackToTree}
      className={`font-inter ${className}`}
      tooltip="Вернуться к дереву"
      tooltipOptions={{ position: 'left' }}
    />
  );
};