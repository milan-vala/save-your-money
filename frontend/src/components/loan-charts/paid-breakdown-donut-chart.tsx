import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@src/utils/loan-formatters";

type PaidBreakdownDatum = {
  name: string;
  value: number;
  color: string;
};

type PaidBreakdownDonutChartProps = {
  data: PaidBreakdownDatum[];
};

export function PaidBreakdownDonutChart({
  data,
}: PaidBreakdownDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={95}
          dataKey="value"
          nameKey="name"
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
