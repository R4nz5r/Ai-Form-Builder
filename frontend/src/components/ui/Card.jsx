import { cn } from "../../lib/utils.js";

export function Card({ className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-default bg-surface shadow-soft",
        hover && "transition-all duration-200 hover:shadow-card hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardBody({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function StatCard({ icon: Icon, label, value, sublabel, accent = "brand", className }) {
  const accents = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
  };
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-fg">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
