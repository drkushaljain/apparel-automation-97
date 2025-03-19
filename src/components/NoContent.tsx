
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface NoContentProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  icon?: ReactNode;
  onAction?: () => void;
}

const NoContent = ({
  title,
  description,
  actionText,
  actionLink,
  icon,
  onAction
}: NoContentProps) => {
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionText && (actionLink || onAction) && (
        <Button 
          onClick={handleAction}
          {...(actionLink && !onAction ? { as: "a", href: actionLink } : {})}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default NoContent;
