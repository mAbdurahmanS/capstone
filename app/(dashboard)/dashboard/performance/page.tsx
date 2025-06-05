"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Award, Target, Download, FileText } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useFetchPerformanceEngineer } from '@/hooks/useFetchPerformanceEngineer';

export const description = "A donut chart with text"
const chartData = [
    { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
    { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
    { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
    { browser: "other", visitors: 190, fill: "var(--color-other)" },
]
const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    chrome: {
        label: "Chrome",
        color: "var(--chart-1)",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
    firefox: {
        label: "Firefox",
        color: "var(--chart-3)",
    },
    edge: {
        label: "Edge",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export default function Page() {

    const totalVisitors = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
    }, [])

    const { performanceEngineer } = useFetchPerformanceEngineer()

    const [selectedEngineer, setSelectedEngineer] = useState<string>('all');
    const chartRef = useRef<HTMLDivElement>(null);

    // const performanceEngineer = [
    //     { id: 'john', name: 'John Smith', resolved: 45, avgTime: '2.1h', efficiency: 92, assigned: 50 },
    //     { id: 'sarah', name: 'Sarah Johnson', resolved: 38, avgTime: '1.8h', efficiency: 95, assigned: 40 },
    //     { id: 'mike', name: 'Mike Davis', resolved: 41, avgTime: '2.4h', efficiency: 88, assigned: 47 },
    //     { id: 'lisa', name: 'Lisa Chen', resolved: 52, avgTime: '1.5h', efficiency: 98, assigned: 53 },
    //     { id: 'tom', name: 'Tom Wilson', resolved: 35, avgTime: '2.8h', efficiency: 85, assigned: 42 },
    // ];

    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 95) return 'bg-green-100 text-green-800';
        if (efficiency >= 90) return 'bg-blue-100 text-blue-800';
        if (efficiency >= 85) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    // Function to get engineer's chart data
    const getEngineerChartData = (engineer: any) => {
        const resolvedData = [
            { name: 'Resolved', value: engineer.resolved, color: '#10b981' },
            { name: 'Pending', value: engineer.assigned - engineer.resolved, color: '#ef4444' }
        ];

        const avgTimeData = [
            { name: 'Current Time', value: parseFloat(engineer.avgTime), color: '#3b82f6' },
            { name: 'Target Time', value: Math.max(0, 4 - parseFloat(engineer.avgTime)), color: '#e5e7eb' }
        ];

        const performanceData = [
            { name: 'Performance', value: engineer.efficiency, color: '#8b5cf6' },
            { name: 'Gap', value: 100 - engineer.efficiency, color: '#e5e7eb' }
        ];

        return { resolvedData, avgTimeData, performanceData };
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{`${payload[0].name}: ${payload[0].value}${payload[0].name.includes('Time') ? 'h' : payload[0].name.includes('Performance') ? '%' : ''}`}</p>
                </div>
            );
        }
        return null;
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString('id-ID');

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Report', 20, 30);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tanggal: ${currentDate}`, 20, 45);

        // Capture charts if available
        let chartImage = null;
        if (chartRef.current) {
            try {
                const canvas = await html2canvas(chartRef.current, {
                    backgroundColor: 'white',
                    scale: 1,
                    height: 300,
                    width: 800
                });
                chartImage = canvas.toDataURL('image/png');
            } catch (error) {
                console.log('Could not capture chart:', error);
            }
        }

        if (selectedEngineer === 'all') {
            // Generate report untuk semua engineer
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Laporan Semua Engineer', 20, 65);

            // Add chart if captured
            if (chartImage) {
                doc.addImage(chartImage, 'PNG', 20, 75, 170, 60);
            }

            let yPosition = chartImage ? 150 : 85;

            performanceEngineer.forEach((engineer, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 30;
                }

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${engineer.name}`, 20, yPosition);

                doc.setFont('helvetica', 'normal');
                doc.text(`   Total Tiket Assigned: ${engineer.assigned}`, 20, yPosition + 15);
                doc.text(`   Total Tiket Solved: ${engineer.resolved}`, 20, yPosition + 30);
                doc.text(`   Average Resolution Time: ${engineer.avgTime}`, 20, yPosition + 45);
                doc.text(`   Performance: ${engineer.efficiency}%`, 20, yPosition + 60);

                // Add resolution rate calculation
                const resolutionRate = ((engineer.resolved / engineer.assigned) * 100).toFixed(1);
                doc.text(`   Resolution Rate: ${resolutionRate}%`, 20, yPosition + 75);

                yPosition += 95;
            });

            // Summary
            const totalAssigned = performanceEngineer.reduce((sum, eng) => sum + eng.assigned, 0);
            const totalResolved = performanceEngineer.reduce((sum, eng) => sum + eng.resolved, 0);
            const avgEfficiency = (performanceEngineer.reduce((sum, eng) => sum + eng.efficiency, 0) / performanceEngineer.length).toFixed(1);

            if (yPosition > 200) {
                doc.addPage();
                yPosition = 30;
            }

            doc.setFont('helvetica', 'bold');
            doc.text('Summary Tim:', 20, yPosition + 20);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Tiket Assigned: ${totalAssigned}`, 20, yPosition + 35);
            doc.text(`Total Tiket Solved: ${totalResolved}`, 20, yPosition + 50);
            doc.text(`Average Team Performance: ${avgEfficiency}%`, 20, yPosition + 65);
            doc.text(`Overall Resolution Rate: ${((totalResolved / totalAssigned) * 100).toFixed(1)}%`, 20, yPosition + 80);

        } else {
            // Generate report untuk engineer tertentu
            const engineer = performanceEngineer.find(eng => eng.id === selectedEngineer);
            if (!engineer) return;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Laporan Performance - ${engineer.name}`, 20, 65);

            // Create individual donut chart data for this engineer
            const engineerResolvedData = [
                { name: 'Solved', value: engineer.resolved, color: '#10b981' },
                { name: 'Remaining', value: engineer.assigned - engineer.resolved, color: '#ef4444' }
            ];

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Tiket Assigned: ${engineer.assigned}`, 20, 90);
            doc.text(`Total Tiket Solved: ${engineer.resolved}`, 20, 110);
            doc.text(`Average Resolution Time: ${engineer.avgTime}`, 20, 130);
            doc.text(`Performance Score: ${engineer.efficiency}%`, 20, 150);

            // Performance rating
            let rating = '';
            if (engineer.efficiency >= 95) rating = 'Excellent';
            else if (engineer.efficiency >= 90) rating = 'Very Good';
            else if (engineer.efficiency >= 85) rating = 'Good';
            else rating = 'Needs Improvement';

            doc.text(`Performance Rating: ${rating}`, 20, 170);

            // Resolution rate
            const resolutionRate = ((engineer.resolved / engineer.assigned) * 100).toFixed(1);
            doc.text(`Resolution Rate: ${resolutionRate}%`, 20, 190);

            // Add chart visualization description
            doc.setFont('helvetica', 'bold');
            doc.text('Performance Breakdown:', 20, 220);
            doc.setFont('helvetica', 'normal');
            doc.text(`- Tickets Solved: ${engineer.resolved} (${resolutionRate}%)`, 20, 235);
            doc.text(`- Tickets Remaining: ${engineer.assigned - engineer.resolved} (${(100 - parseFloat(resolutionRate)).toFixed(1)}%)`, 20, 250);
        }

        // Save PDF
        const fileName = selectedEngineer === 'all' ?
            `Performance_Report_All_Engineers_${currentDate.replace(/\//g, '-')}.pdf` :
            `Performance_Report_${performanceEngineer.find(eng => eng.id === selectedEngineer)?.name.replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;

        doc.save(fileName);
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                    <div className="flex items-center justify-between ">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Performance Monitoring
                            </h1>
                            <p className="text-gray-600">Track team performance and resolution rate</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="flex flex-col">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Total Ticket Resolved</CardTitle>
                                <CardDescription>January - June 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={chartData}
                                            dataKey="visitors"
                                            nameKey="browser"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                            >
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {totalVisitors.toLocaleString()}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-muted-foreground"
                                                                >
                                                                    Visitors
                                                                </tspan>
                                                            </text>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="text-muted-foreground leading-none">
                                    Showing total visitors for the last 6 months
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Avg Resolution Time</CardTitle>
                                <CardDescription>January - June 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={chartData}
                                            dataKey="visitors"
                                            nameKey="browser"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                            >
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {totalVisitors.toLocaleString()}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-muted-foreground"
                                                                >
                                                                    Visitors
                                                                </tspan>
                                                            </text>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="text-muted-foreground leading-none">
                                    Showing total visitors for the last 6 months
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Team Efficiency</CardTitle>
                                <CardDescription>January - June 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={chartData}
                                            dataKey="visitors"
                                            nameKey="browser"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                            >
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {totalVisitors.toLocaleString()}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-muted-foreground"
                                                                >
                                                                    Visitors
                                                                </tspan>
                                                            </text>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="text-muted-foreground leading-none">
                                    Showing total visitors for the last 6 months
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Export Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Export Performance Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Engineer
                                    </label>
                                    <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih engineer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Engineer</SelectItem>
                                            {performanceEngineer.map((engineer) => (
                                                <SelectItem key={engineer.id} value={engineer.id}>
                                                    {engineer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={generatePDF} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Engineer Performance Details with Charts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Engineer Performance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {performanceEngineer.map((engineer, index) => {
                                    const { resolvedData, avgTimeData, performanceData } = getEngineerChartData(engineer);

                                    return (
                                        <div key={index} className="p-6 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="font-medium text-lg">{engineer.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Assigned: {engineer.assigned} | Resolved: {engineer.resolved} | Resolution Rate: {((engineer.resolved / engineer.assigned) * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <Badge className={getEfficiencyColor(engineer.efficiency)}>
                                                    {engineer.efficiency}%
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Ticket Resolution Chart */}
                                                <div className="text-center">
                                                    <h4 className="text-sm font-medium mb-2">Ticket Resolution</h4>
                                                    <ChartContainer config={{}} className="h-[150px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={resolvedData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={40}
                                                                    outerRadius={60}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                >
                                                                    {resolvedData.map((entry, idx) => (
                                                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <ChartTooltip content={<CustomTooltip />} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                    <div className="text-xs text-gray-600">
                                                        {engineer.resolved}/{engineer.assigned} tickets
                                                    </div>
                                                </div>

                                                {/* Average Time Chart */}
                                                <div className="text-center">
                                                    <h4 className="text-sm font-medium mb-2">Avg Resolution Time</h4>
                                                    <ChartContainer config={{}} className="h-[150px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={avgTimeData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={40}
                                                                    outerRadius={60}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                >
                                                                    {avgTimeData.map((entry, idx) => (
                                                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <ChartTooltip content={<CustomTooltip />} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                    <div className="text-xs text-gray-600">
                                                        {engineer.avgTime} (Target: ≤4h)
                                                    </div>
                                                </div>

                                                {/* Performance Chart */}
                                                <div className="text-center">
                                                    <h4 className="text-sm font-medium mb-2">Performance Score</h4>
                                                    <ChartContainer config={{}} className="h-[150px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={performanceData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={40}
                                                                    outerRadius={60}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                >
                                                                    {performanceData.map((entry, idx) => (
                                                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <ChartTooltip content={<CustomTooltip />} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                    <div className="text-xs text-gray-600">
                                                        {engineer.efficiency}% efficiency
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};