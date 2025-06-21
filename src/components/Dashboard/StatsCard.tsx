
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend
}) => {
  return (
    <Card className="card-shadow hover:card-shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-commercial-600">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-commercial-900">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {subtitle && (
            <p className="text-xs text-commercial-500">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
