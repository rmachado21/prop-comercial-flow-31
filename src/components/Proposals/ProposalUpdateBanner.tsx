import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCcw } from "lucide-react";
import { useState } from "react";

interface ProposalUpdateBannerProps {
  hasUpdate: boolean;
  onMarkAsSeen: () => void;
}

export const ProposalUpdateBanner = ({ hasUpdate, onMarkAsSeen }: ProposalUpdateBannerProps) => {
  const [isMarking, setIsMarking] = useState(false);

  if (!hasUpdate) return null;

  const handleMarkAsSeen = async () => {
    setIsMarking(true);
    try {
      await onMarkAsSeen();
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
      <RefreshCcw className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-green-800 dark:text-green-200">
            Proposta Atualizada!
          </span>
          <p className="text-green-700 dark:text-green-300 mt-1">
            Esta proposta foi atualizada com base nos seus comentários. Por favor, revise as alterações abaixo.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAsSeen}
          disabled={isMarking}
          className="ml-4 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isMarking ? "Marcando..." : "Marcar como Visto"}
        </Button>
      </AlertDescription>
    </Alert>
  );
};