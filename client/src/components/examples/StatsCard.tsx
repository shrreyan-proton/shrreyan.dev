import { StatsCard } from "../StatsCard";
import { Key } from "lucide-react";

export default function StatsCardExample() {
  return (
    <StatsCard
      title="Total Licenses"
      value={42}
      icon={Key}
      description="+12% from last month"
    />
  );
}
