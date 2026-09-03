import { useEffect, useState } from "react";
import { getHealth, type HealthStatus } from "../lib/api";

type ConnectionState = "checking" | "healthy" | "unavailable";

export function HealthIndicator() {
  const [state, setState] = useState<ConnectionState>("checking");

  useEffect(() => {
    let active = true;

    getHealth()
      .then((health: HealthStatus) => {
        if (active) setState(health.status === "ok" ? "healthy" : "unavailable");
      })
      .catch(() => {
        if (active) setState("unavailable");
      });

    return () => {
      active = false;
    };
  }, []);

  const labels: Record<ConnectionState, string> = {
    checking: "Checking API",
    healthy: "API connected",
    unavailable: "API unavailable",
  };

  return <p className={`health health--${state}`}>{labels[state]}</p>;
}
