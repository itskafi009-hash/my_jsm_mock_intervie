"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type ScoreData = {
    date: number;
    score: number;
};

export default function ScoreChart({ data }: { data: ScoreData[] }) {

    if (!data || data.length === 0) {
        return <p>No data available</p>;
    }

    return (
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                            new Date(value).toLocaleDateString()
                        }
                    />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}