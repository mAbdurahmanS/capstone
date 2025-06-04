import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Calendar, Tag, AlertTriangle, Send, MessageCircle, Shield, MessageSquare, Clock } from 'lucide-react';
import { IconAlertTriangle, IconClock, IconUser } from '@tabler/icons-react';
import { useFetchProgressLogs } from '@/hooks/useFetchProgressLogs';

interface TicketDetailProps {
    ticketId: string;
    onBack: () => void;
    isUserView?: boolean;
}

export default function TicketDetail({ ticketId, onBack, isUserView = false }: TicketDetailProps) {
    const [newMessage, setNewMessage] = useState('');

    const { progressLogs, mutate: mutateProgressLogs } = useFetchProgressLogs(2);

    // Mock data - in real app this would come from API
    const ticket = {
        id: 'TK-2024-001',
        title: 'Email server connectivity issues',
        description: 'Unable to connect to email server, getting timeout errors',
        priority: 'critical',
        status: 'open',
        category: 'Technical',
        customer: 'alice@company.com',
        assignee: 'John Smith',
        created: '1/15/2024, 5:30:00 PM',
        messages: [
            {
                id: 1,
                sender: 'alice@company.com',
                content: 'Hi, I\'m having trouble connecting to the email server. I keep getting timeout errors when trying to send emails.',
                timestamp: '1/15/2024, 5:30:00 PM',
                isCustomer: true
            },
            {
                id: 2,
                sender: 'John Smith (Engineer)',
                content: 'Hello Alice, thank you for reporting this issue. I\'m looking into the email server connectivity problem. Can you please provide more details about when this started happening?',
                timestamp: '1/15/2024, 6:15:00 PM',
                isCustomer: false
            }
        ]
    };
    const ticket2 = {
        "id": 2,
        "title": "Tes",
        "description": "cekkk",
        "priority": {
            "id": 3,
            "name": "Low"
        },
        "status": {
            "id": 2,
            "name": "In Progress"
        },
        "customer": {
            "id": 2,
            "name": "Cek",
            "email": "cek@gmail.com"
        },
        "engineer": {
            "id": 3,
            "name": "Cek2",
            "email": "cek2@gmail.com"
        },
        "created_at": "2025-06-03T14:08:04.049Z",
        "updated_at": "2025-06-03T18:01:40.282Z",
        "assigned_at": "2025-06-03T14:11:32.732Z",
        "resolved_at": null
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-red-200';
            case 'Medium': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-300 shadow-orange-200';
            case 'Low': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300 shadow-green-200';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300 shadow-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-blue-200';
            case 'In Progress': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 shadow-purple-200';
            case 'Resolved': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-300 shadow-emerald-200';
            case 'Closed': return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-300 shadow-slate-200';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300 shadow-gray-200';
        }
    };

    const updateTicket = async (field: string, value: string) => {
        try {
            await fetch(`/api/tickets/${2}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [field]: value }),
            });
            console.log(`${field} updated to`, value);
            //   mutate();
        } catch (error) {
            console.error('Failed to update ticket:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return; // mencegah kirim pesan kosong

        try {
            const res = await fetch("/api/progress-logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    note: newMessage,
                    ticket_id: id,  // pastikan ini ada
                    user_id: ticket?.engineer?.id,       // pastikan ini ada
                }),
            });

            if (!res.ok) {
                console.error("Gagal mengirim pesan");
                return;
            }

            const data = await res.json();
            console.log("Berhasil kirim:", data);
            setNewMessage(""); // reset textarea
            mutateProgressLogs()
            // 🔁 opsional: panggil mutate / refetch untuk refresh log terbaru
        } catch (error) {
            console.error("Error mengirim pesan:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <Button variant="outline" size="sm"
                onClick={onBack}
            >Back
            </Button>
            <div className="flex items-center justify-between items-center">
                <div>
                    <p className=" text mb-1 font-medium ">TK-{ticket2.id}-{new Date(ticket2.created_at).toLocaleDateString("en-GB", {
                        year: "2-digit",
                        month: "2-digit",
                    }).replace("/", "-")}</p>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">{ticket2.title}</h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <IconClock className="h-4 w-4" />
                            <span>Created: {new Date(ticket2.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <IconUser className="h-4 w-4" />
                            <span>Engineer: {ticket2.engineer?.name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={`${getPriorityColor(ticket2.priority?.name)} px-4 py-2 text-sm font-semibold shadow-lg`}>
                        {/* <AlertTriangle className="h-4 w-4 mr-2" /> */}
                        {ticket2.priority?.name.charAt(0).toUpperCase() + ticket2.priority?.name.slice(1)}
                    </Badge>
                    <Badge className={`${getStatusColor(ticket2.status?.name)} px-4 py-2 text-sm font-semibold shadow-lg`}>
                        {/* <Shield className="h-4 w-4 mr-2" /> */}
                        {ticket2.status?.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                </div>
            </div>

            <div className="">
                <Card className="h-[700px] !py-0 flex flex-col border-0 shadow-2xl bg-white/90 backdrop-blur-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            Chat
                            <div className="ml-auto flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Live Chat
                            </div>
                        </CardTitle>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
                            <div
                                className={`flex justify-start animate-fade-in`}
                            >
                                <div className={`max-w-[85%] order-2`}>
                                    <div
                                        className={`p-5 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl bg-white border border-gray-100 text-gray-900 rounded-tl-lg ml-4`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`p-1.5 rounded-full bg-blue-100`}>
                                                <User className={`h-4 w-4 text-blue-600`} />
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {ticket2?.customer?.name}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed mb-3">{ticket2?.description}</p>
                                        <div className={`flex items-center gap-1 text-xs text-gray-500`}>
                                            <Clock className="h-3 w-3" />
                                            {new Date(ticket2.created_at).toLocaleString("id-ID", {
                                                timeZone: "Asia/Jakarta",
                                                hour12: false,
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {progressLogs.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.user?.role === 'User' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                                >
                                    <div className={`max-w-[85%] ${message.user?.role === 'User' ? 'order-2' : 'order-1'}`}>
                                        <div
                                            className={`p-5 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${message.user?.role === 'User'
                                                ? 'bg-white border border-gray-100 text-gray-900 rounded-tl-lg ml-4'
                                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-tr-lg mr-4'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`p-1.5 rounded-full ${message.user?.role === 'User' ? 'bg-blue-100' : 'bg-white/20'}`}>
                                                    {message.user?.role === 'User' ? (
                                                        <User className={`h-4 w-4 ${message.user?.role === 'User' ? 'text-blue-600' : 'text-white'}`} />
                                                    ) : (
                                                        <Shield className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold">
                                                    {message.user?.role === 'User' ? message?.user?.name : `${message?.user?.name} (Engineer)`}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed mb-3">{message.note}</p>
                                            <div className={`flex items-center gap-1 text-xs ${message.user?.role === 'User' ? 'text-gray-500' : 'text-white/80'}`}>
                                                <Clock className="h-3 w-3" />
                                                {new Date(message.created_at).toLocaleString("id-ID", {
                                                    timeZone: "Asia/Jakarta",
                                                    hour12: false,
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="border-t bg-gradient-to-r from-gray-50 to-white p-6">
                            <div className="flex gap-4 items-end">
                                <Textarea
                                    placeholder="Ketik balasan Anda..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 min-h-[60px] max-h-[120px] resize-none border-0 bg-white shadow-lg rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600  rounded-full transition-all duration-200 text-white font-semibold"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};