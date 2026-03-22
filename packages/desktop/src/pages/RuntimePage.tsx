import { useState } from "react";
import { useAppStore, type ServiceStatus } from "@/stores/app-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Play, Square, RefreshCw, Terminal } from "lucide-react";

export function RuntimePage() {
  const { services } = useAppStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button size="sm">
          <Play className="w-4 h-4" />
          Start All
        </Button>
        <Button size="sm" variant="danger">
          <Square className="w-4 h-4" />
          Stop All
        </Button>
        <Button size="sm" variant="secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-zinc-500">
            <Terminal className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No services running</p>
            <p className="text-sm mt-1">Create and scaffold a stack, then use `stackpilot up` to start services</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {services.map((svc) => (
            <ServiceCard
              key={svc.name}
              service={svc}
              isSelected={selectedService === svc.name}
              onClick={() => setSelectedService(selectedService === svc.name ? null : svc.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  isSelected,
  onClick,
}: {
  service: ServiceStatus;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColor = {
    running: "success" as const,
    healthy: "success" as const,
    unhealthy: "warning" as const,
    exited: "error" as const,
    stopped: "error" as const,
    not_started: "default" as const,
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      className={isSelected ? "border-indigo-500/40" : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            service.status === "running" || service.status === "healthy"
              ? "bg-green-400"
              : service.status === "exited" || service.status === "stopped"
                ? "bg-red-400"
                : "bg-zinc-500"
          }`} />
          <p className="font-medium">{service.name}</p>
        </div>
        <Badge variant={statusColor[service.status]}>{service.status}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        {service.port && <span>Port: {service.port}</span>}
        {service.healthCheck && service.healthCheck !== "none" && (
          <span className={service.healthCheck === "passing" ? "text-green-400" : "text-red-400"}>
            Health: {service.healthCheck}
          </span>
        )}
      </div>
    </Card>
  );
}
