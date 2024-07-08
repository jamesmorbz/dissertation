import React, { useContext, useEffect, useState } from 'react';
import {
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Tooltip,
} from 'recharts';

interface DataPoint {
  _unix: number;
  _value: number;
  _time: string;
}
export interface DataProps {
  device_name: string;
  data: DataPoint[];
}

export function Chart({ device_name, data }: DataProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="device">{`Hardware Name: ${device_name}`}</p>
          <p className="label">{`Time: ${formatDate(label)}`}</p>
          <p className="value">{`Power: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  const formatDate = (tickItem: string) => {
    const tick = tickItem.split('+')[0].replace('T', ' ');
    return tick;
  };

  const formatXAxis = (tickItem: string) => {
    const tick = tickItem.split('T')[1].split('+')[0];
    return tick;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <XAxis dataKey="_time" tickFormatter={formatXAxis} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="_value"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
