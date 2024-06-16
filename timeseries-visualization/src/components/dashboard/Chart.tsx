import React, { useContext, useEffect, useState } from "react";
import {
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    AreaChart,
    Tooltip,
} from "recharts";

function convertDateToUnixTimestamp(date: any) {
    return Math.floor(date.getTime() / 1000);
};

function convertUnixTimestampToDate(unixTimestamp: any) {
  const milliseconds = unixTimestamp * 1000;
  return new Date(milliseconds).toLocaleDateString();
};

function createDate(date: any, days: any, weeks: any, months: any, years: any) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days + 7 * weeks);
    newDate.setMonth(newDate.getMonth() + months);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
};

function Chart() {

const [data, setData] = useState([
  { date: '2023-01-01', value: 400 },
  { date: '2023-01-02', value: 300 },
  { date: '2023-01-03', value: 200 },
  { date: '2023-01-04', value: 278 },
  { date: '2023-01-05', value: 189 },
  { date: '2023-01-06', value: 239 },
  { date: '2023-01-07', value: 349 },
  { date: '2023-01-08', value: 200 },
  { date: '2023-01-09', value: 300 },
  { date: '2023-01-10', value: 400 },
]);
const [filter, setFilter] = useState("1W");

const chartConfig = {
  "1D": { resolution: "1", days: 1, weeks: 0, months: 0, years: 0 },
  "1W": { resolution: "15", days: 0, weeks: 1, months: 0, years: 0 },
  "1M": { resolution: "60", days: 0, weeks: 0, months: 1, years: 0 },
  "1Y": { resolution: "D", days: 0, weeks: 0, months: 0, years: 1 },
};

return (
  <>
    <ul className="flex absolute top-2 right-2 z-40">
      {/* {Object.keys(chartConfig).map((item) => (
        <li key={item}>
          <ChartFilter
            text={item}
            active={filter === item}
            onClick={() => {
              setFilter(item);
            }}
          />
        </li>
      ))} */}
    </ul>
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="#312e81"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="#312e81"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Tooltip 
        contentStyle={{ backgroundColor: '#111827' }} 
        itemStyle={{ color: '#818cf8' }} 
      />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#312e81"
          fill="url(#chartColor)"
          fillOpacity={1}
          strokeWidth={0.5}
        />
        <XAxis dataKey="date" />
        <YAxis domain={["dataMin", "dataMax"]} />
      </AreaChart>
    </ResponsiveContainer>
  </>
);

}
export default Chart;