import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

type AlertType = 'success' | 'info' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

const alertIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: XCircle,
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const Icon = alertIcons[type];

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${alertStyles[type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70" aria-label="Close">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}