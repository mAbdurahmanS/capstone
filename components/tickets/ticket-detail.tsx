import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Send, Shield, MessageSquare, Clock } from 'lucide-react';
import { IconClock, IconUser } from '@tabler/icons-react';
import { useFetchProgressLogs } from '@/hooks/useFetchProgressLogs';
import { useFetchTickets } from '@/hooks/useFetchTickets';
import { Input } from '../ui/input';
import Image from 'next/image';
import { isImage } from '@/lib/isImage';

interface TicketDetailProps {
    ticketId: number;
    onBack: () => void;
    isUserView?: boolean;
}

export default function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [images, setImages] = useState<File[]>([]);

    const { tickets: ticket } = useFetchTickets(ticketId);
    const { progressLogs, mutate: mutateProgressLogs } = useFetchProgressLogs(ticketId);

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

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return; // mencegah kirim pesan kosong

        setIsSending(true);

        try {
            let imageUrls: string[] = [];
            if (images.length > 0) {
                const imageForm = new FormData();
                images.forEach((img) => imageForm.append("images", img));
                const imgRes = await fetch("/api/upload", {
                    method: "POST",
                    body: imageForm,
                });

                if (!imgRes.ok) throw new Error("Image upload failed");
                const imgData = await imgRes.json();
                imageUrls = imgData.urls;
            }

            const res = await fetch("/api/progress-logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    note: newMessage,
                    ticket_id: ticketId,  // pastikan ini ada
                    user_id: ticket?.customer?.id,       // pastikan ini ada
                    images: imageUrls
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
            setImages([]);
        } catch (error) {
            console.error("Error mengirim pesan:", error);
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [progressLogs]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <Button variant="outline" size="sm"
                onClick={onBack}
            >Back
            </Button>
            <div className="flex items-center justify-between items-center">
                <div>
                    <p className=" text mb-1 font-medium ">TK-{ticket.id}-{new Date(ticket.created_at).toLocaleDateString("en-GB", {
                        year: "2-digit",
                        month: "2-digit",
                    }).replace("/", "-")}</p>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">{ticket.title}</h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <IconClock className="h-4 w-4" />
                            <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <IconUser className="h-4 w-4" />
                            <span>Engineer: {ticket.engineer?.name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {ticket?.priority && ticket?.priority?.name && (

                        <Badge className={`${getPriorityColor(ticket.priority?.name)} px-4 py-2 text-sm font-semibold shadow-lg`}>
                            {/* <AlertTriangle className="h-4 w-4 mr-2" /> */}
                            {ticket.priority?.name.charAt(0).toUpperCase() + ticket.priority?.name.slice(1)}
                        </Badge>
                    )}
                    {ticket?.status && ticket?.status?.name && (
                        <Badge className={`${getStatusColor(ticket.status?.name)} px-4 py-2 text-sm font-semibold shadow-lg`}>
                            {/* <Shield className="h-4 w-4 mr-2" /> */}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {ticket.status?.name.replace('-', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                        </Badge>
                    )}
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
                                className={`flex justify-end animate-fade-in`}
                            >
                                <div className={`max-w-[85%] order-1`}>
                                    <div
                                        className={`p-5 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-tr-lg mr-4`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`p-1.5 rounded-full bg-white/20`}>
                                                <User className={`h-4 w-4 text-white`} />
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {ticket?.customer?.name}
                                            </span>
                                        </div>
                                        {/* Images */}
                                        <div className="w-full mb-2">
                                            {ticket?.image && (
                                                <>
                                                    {isImage(ticket.image) ? (
                                                        <Image
                                                            src={ticket.image}
                                                            alt={ticket.title}
                                                            layout="responsive"
                                                            width={16}
                                                            height={9}
                                                            className="rounded-lg object-contain border"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={ticket.image}
                                                            download
                                                            className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                                        >
                                                            Download File
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed mb-3">{ticket?.description}</p>
                                        <div className={`flex items-center gap-1 text-xs text-white/80`}>
                                            <Clock className="h-3 w-3" />
                                            {new Date(ticket.created_at).toLocaleString("id-ID", {
                                                timeZone: "Asia/Jakarta",
                                                hour12: false,
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {progressLogs.map((message: any) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.user?.role === 'Engineer' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                                >
                                    <div className={`max-w-[85%] ${message.user?.role === 'Engineer' ? 'order-2' : 'order-1'}`}>
                                        <div
                                            className={`p-5 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${message.user?.role === 'Engineer'
                                                ? 'bg-white border border-gray-100 text-gray-900 rounded-tl-lg ml-4'
                                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-tr-lg mr-4'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`p-1.5 rounded-full ${message.user?.role === 'Engineer' ? 'bg-blue-100' : 'bg-white/20'}`}>
                                                    {message.user?.role === 'Engineer' ? (
                                                        <Shield className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <User className={`h-4 w-4 ${message.user?.role === 'Engineer' ? 'text-blue-600' : 'text-white'}`} />
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold">
                                                    {message.user?.role === 'Engineer' ? message?.user?.name : `${message?.user?.name} (Engineer)`}
                                                </span>
                                            </div>
                                            <div className="w-[100%] mb-2">
                                                {/* {message?.image && (
                                                    <Image
                                                        src={message.image}
                                                        alt={message.id}
                                                        layout="responsive"
                                                        width={16}
                                                        height={9}
                                                        className="rounded-lg object-contain border"
                                                    />
                                                )} */}
                                                {message?.image && (
                                                    <>
                                                        {isImage(message.image) ? (
                                                            <Image
                                                                src={message.image}
                                                                alt={message.id}
                                                                layout="responsive"
                                                                width={16}
                                                                height={9}
                                                                className="rounded-lg object-contain border"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={message.image}
                                                                download
                                                                className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                                            >
                                                                Download File
                                                            </a>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-sm leading-relaxed mb-3">{message.note}</p>
                                            <div className={`flex items-center gap-1 text-xs ${message.user?.role === 'Engineer' ? 'text-gray-500' : 'text-white/80'}`}>
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

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="border-t bg-gradient-to-r from-gray-50 to-white p-6">
                            <Input
                                id="images"
                                type="file"
                                // accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setImages(Array.from(e.target.files));
                                    }
                                }}
                                className='mb-2'
                            />
                            <div className="flex gap-4 items-end">
                                <Textarea
                                    placeholder="Ketik balasan Anda..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 min-h-[60px] max-h-[120px] resize-none border-0 bg-white shadow-lg rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={isSending}
                                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600  rounded-full transition-all duration-200 text-white font-semibold"
                                >
                                    {isSending ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                            Sending...
                                        </div>
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};