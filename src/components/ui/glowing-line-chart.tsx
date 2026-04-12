"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/line-chart";
import { Badge } from "@/components/ui/badge";

export function GlowingLineChart({ data, config, title, description, trending }) {
  return (
    <Card className="glass border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
          {title || "Files Processed"}
          {trending && (
            <Badge
              variant="outline"
              className="text-green-500 bg-green-500/10 border-none ml-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{trending}</span>
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description || "Usage trends"}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ChartContainer config={config} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {Object.keys(config).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="bump"
                stroke={config[key].color}
                dot={false}
                strokeWidth={2.5}
                filter="url(#rainbow-line-glow)"
              />
            ))}
            <defs>
              <filter
                id="rainbow-line-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
