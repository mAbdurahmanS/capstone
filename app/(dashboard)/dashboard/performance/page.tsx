"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useFetchPerformanceEngineer } from '@/hooks/useFetchPerformanceEngineer';


export default function Page() {

    const { performanceEngineer } = useFetchPerformanceEngineer()

    const [selectedEngineer, setSelectedEngineer] = useState<string>('all');

    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 95) {
            return 'bg-[#dcfce7] text-[#166534]'; // Tailwind: green-100, green-800
        }
        if (efficiency >= 90) {
            return 'bg-[#dbeafe] text-[#1e40af]'; // Tailwind: blue-100, blue-800
        }
        if (efficiency >= 85) {
            return 'bg-[#fef9c3] text-[#854d0e]'; // Tailwind: yellow-100, yellow-800
        }
        return 'bg-[#fee2e2] text-[#991b1b]';    // Tailwind: red-100, red-800
    };

    // Function to get engineer's chart data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#fff] p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{`${payload[0].name}: ${payload[0].value}${payload[0].name.includes('Time') ? 'h' : payload[0].name.includes('Performance') ? '%' : ''}`}</p>
                </div>
            );
        }
        return null;
    };

    const captureEngineerCharts = async (engineerId: string) => {
        const engineerChartsElement = document.getElementById(`engineer-charts-${engineerId}`);
        if (engineerChartsElement) {
            // Tambahkan delay agar chart benar-benar selesai render
            await new Promise((res) => setTimeout(res, 1000));

            try {
                const canvas = await html2canvas(engineerChartsElement, {
                    backgroundColor: 'white',
                    scale: 2, // agar lebih tajam
                    useCORS: true,
                    scrollY: -window.scrollY,
                });
                return canvas.toDataURL('image/png');
            } catch (error) {
                console.log('Could not capture engineer charts:', error);
                return null;
            }
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

        if (selectedEngineer === 'all') {
            // Generate report untuk semua engineer
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Laporan Semua Engineer', 20, 65);

            let yPosition = 85;

            for (let index = 0; index < performanceEngineer.length; index++) {
                const engineer = performanceEngineer[index];

                // Check if we need a new page
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 30;
                }

                // Capture engineer charts
                const chartImage = await captureEngineerCharts(engineer.id);

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${engineer.name}`, 20, yPosition);

                doc.setFont('helvetica', 'normal');
                doc.text(`   Total Tiket Assigned: ${engineer.assigned}`, 20, yPosition + 15);
                doc.text(`   Total Tiket Solved: ${engineer.resolved}`, 20, yPosition + 25);
                doc.text(`   Average Resolution Time: ${engineer.avgTime}`, 20, yPosition + 35);
                doc.text(`   Performance: ${engineer.efficiency}%`, 20, yPosition + 45);

                // Add resolution rate calculation
                const resolutionRate = ((engineer.resolved / engineer.assigned) * 100).toFixed(1);
                doc.text(`   Resolution Rate: ${resolutionRate}%`, 20, yPosition + 55);

                // Add chart if captured
                if (chartImage) {
                    doc.addImage(chartImage, 'PNG', 20, yPosition + 65, 150, 40);
                    yPosition += 150;
                } else {
                    yPosition += 95;
                }
            }

            // Summary
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalAssigned = performanceEngineer.reduce((sum: any, eng: any) => sum + eng.assigned, 0);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalResolved = performanceEngineer.reduce((sum: any, eng: any) => sum + eng.resolved, 0);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const avgEfficiency = (performanceEngineer.reduce((sum: any, eng: any) => sum + eng.efficiency, 0) / performanceEngineer.length).toFixed(1);

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const engineer = performanceEngineer.find((eng: any) => eng.id === selectedEngineer);
            if (!engineer) return;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Laporan Performance - ${engineer.name}`, 20, 65);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Tiket Assigned: ${engineer.assigned}`, 20, 85);
            doc.text(`Total Tiket Solved: ${engineer.resolved}`, 20, 95);
            doc.text(`Average Resolution Time: ${engineer.avgTime}`, 20, 105);
            doc.text(`Performance Score: ${engineer.efficiency}%`, 20, 115);

            // Performance rating
            let rating = '';
            if (engineer.efficiency >= 95) rating = 'Excellent';
            else if (engineer.efficiency >= 90) rating = 'Very Good';
            else if (engineer.efficiency >= 85) rating = 'Good';
            else rating = 'Needs Improvement';

            doc.text(`Performance Rating: ${rating}`, 20, 125);

            // Resolution rate
            const resolutionRate = ((engineer.resolved / engineer.assigned) * 100).toFixed(1);
            doc.text(`Resolution Rate: ${resolutionRate}%`, 20, 135);

            // Capture and add engineer charts
            const chartImage = await captureEngineerCharts(engineer.id);
            if (chartImage) {
                doc.addImage(chartImage, 'PNG', 20, 145, 150, 40);
            }

            // Add chart visualization description
            doc.setFont('helvetica', 'bold');
            doc.text('Performance Breakdown:', 20, 200);
            doc.setFont('helvetica', 'normal');
            doc.text(`- Tickets Solved: ${engineer.resolved} (${resolutionRate}%)`, 20, 210);
            doc.text(`- Tickets Remaining: ${engineer.assigned - engineer.resolved} (${(100 - parseFloat(resolutionRate)).toFixed(1)}%)`, 20, 220);
        }

        // Save PDF
        const fileName = selectedEngineer === 'all' ?
            `Performance_Report_All_Engineers_${currentDate.replace(/\//g, '-')}.pdf` :
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `Performance_Report_${performanceEngineer.find((eng: any) => eng.id === selectedEngineer)?.name.replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;

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

                    {/* Export Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
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
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {performanceEngineer.map((engineer: any) => (
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
                                {/* <Button
                                    onClick={async () => {
                                        const img = await captureEngineerCharts(performanceEngineer[0]?.id);
                                        console.log("img base64:", img);
                                        const w = window.open();
                                        if (w && img) w.document.write(`<img src="${img}" />`);
                                    }}
                                >
                                    Debug Capture
                                </Button> */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Engineer Performance Details with Charts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-2xl'>Engineer Performance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {performanceEngineer.map((engineer: any, index: number) => {
                                    const { resolvedData, avgTimeData, performanceData } = getEngineerChartData(engineer);

                                    return (
                                        <div key={index} className="p-6 bg-[#f9fafb] rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="font-medium text-lg">{engineer.name}</div>
                                                    <div className="text-sm text-[#6a7282]">
                                                        Assigned: {engineer.assigned} | Resolved: {engineer.resolved} | Resolution Rate: {((engineer.resolved / engineer.assigned) * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <Badge className={getEfficiencyColor(engineer.efficiency)}>
                                                    {engineer.efficiency}%
                                                </Badge>
                                            </div>

                                            <div id={`engineer-charts-${engineer.id}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[200px]">
                                                {/* Ticket Resolution Chart */}
                                                <div className="text-center">
                                                    <h4 className="text-sm font-medium mb-2">Ticket Resolution</h4>
                                                    <ChartContainer config={{}} className="h-[150px]">
                                                        {/* <ResponsiveContainer width="100%" height="100%"> */}
                                                        <PieChart width={180} height={180}>
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
                                                        {/* </ResponsiveContainer> */}
                                                    </ChartContainer>
                                                    <div className="text-xs text-[#4a5565]">
                                                        {engineer.resolved}/{engineer.assigned} tickets
                                                    </div>
                                                </div>

                                                {/* Average Time Chart */}
                                                <div className="text-center">
                                                    <h4 className="text-sm font-medium mb-2">Avg Resolution Time</h4>
                                                    <ChartContainer config={{}} className="h-[150px]">
                                                        {/* <ResponsiveContainer width="100%" height="100%"> */}
                                                        <PieChart width={180} height={180}>
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
                                                        {/* </ResponsiveContainer> */}
                                                    </ChartContainer>
                                                    <div className="text-xs text-[#4a5565]">
                                                        {engineer.avgTime}
                                                        {/* (Target: ≤4h) */}
                                                    </div>
                                                </div>

                                                {/* Performance Chart */}
                                                <div className="text-center">
                                                    <h4 className="text-sm font-medium mb-2">Performance Score</h4>
                                                    <ChartContainer config={{}} className="h-[150px]">
                                                        {/* <ResponsiveContainer width="100%" height="100%"> */}
                                                        <PieChart width={180} height={180}>
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
                                                        {/* </ResponsiveContainer> */}
                                                    </ChartContainer>
                                                    <div className="text-xs text-[#4a5565]">
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