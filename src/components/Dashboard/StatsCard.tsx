
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
  compact?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
  compact = false
}) => {
  return (
    <Card className="card-shadow hover:card-shadow-lg transition-all duration-200">
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${compact ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
        <CardTitle className={`font-medium text-commercial-600 ${compact ? 'text-xs' : 'text-sm'}`}>
          {title}
        </CardTitle>
        <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${iconColor}`} />
      </CardHeader>
      <CardContent className={compact ? 'px-3 pb-3' : ''}>
        <div className={`font-bold text-commercial-900 ${compact ? 'text-lg' : 'text-2xl'}`}>{value}</div>
        <div className={`flex items-center justify-between ${compact ? 'mt-1' : 'mt-2'}`}>
          {subtitle && (
            <p className={`text-commercial-500 ${compact ? 'text-xs' : 'text-xs'}`}>{subtitle}</p>
          )}
          {trend && (
            <p className={`font-medium ${compact ? 'text-xs' : 'text-xs'} ${
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
