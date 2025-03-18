
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

interface NoContentProps {
  title: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
}

const NoContent: React.FC<NoContentProps> = ({
  title,
  description,
  actionText,
  actionLink,
  icon = <Package className="h-12 w-12 text-primary/20" />,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      {actionText && (actionLink || onAction) && (
        <Button 
          asChild={!!actionLink}
          onClick={onAction}
        >
          {actionLink ? (
            <Link to={actionLink}>{actionText}</Link>
          ) : (
            actionText
          )}
        </Button>
      )}
    </div>
  );
};

export default NoContent;
