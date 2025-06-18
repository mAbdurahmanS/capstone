"use client";

import React, { useState } from 'react';
import { Ticket, MessageCircle, User, LogOut } from 'lucide-react';
import TicketList from '@/components/tickets/ticket-list';
import TicketDetail from '@/components/tickets/ticket-detail';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFetchUsers } from '@/hooks/useFetchUsers';
import { IconUserCircle } from '@tabler/icons-react';
import DialogEditUser from '@/components/user/user-edit';

export default function Page() {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState('my-tickets');
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    const { user: userAuth } = useAuth()

    const { users: user, mutate } = useFetchUsers(userAuth?.id)

    const [openEdit, setOpenEdit] = useState(false);

    const handleTicketReply = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setActiveTab('ticket-detail');
    };

    const handleBackToTickets = () => {
        setSelectedTicketId(null);
        setActiveTab('my-tickets');
    };


    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'my-tickets':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                My Ticket
                            </h1>
                            <p className="text-gray-600">Manage and monitor the progress of your support tickets</p>
                        </div>
                        <TicketList onReplyClick={handleTicketReply} />
                    </div>
                );
            case 'ticket-detail':
                return selectedTicketId ? (
                    <TicketDetail
                        ticketId={selectedTicketId}
                        onBack={handleBackToTickets}
                        isUserView={true}
                    />
                ) : (
                    <div>Tiket tidak ditemukan</div>
                );
            default:
                return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="bg-blue-600 p-2 rounded-lg mr-3">
                                <Ticket className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">Capstone</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <User className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">john.doe@company.com</span> */}

                            {/* Tampilan Info User yang sedang login */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-gray-100/50 transition-all duration-200">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex flex-col text-start">
                                            <span className="hidden md:block font-medium truncate">{user?.name}</span>
                                            <span className="hidden md:block text-muted-foreground truncate text-xs">{user?.email}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border border-gray-200/50">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="hover:bg-red-50/50" onClick={() => setOpenEdit(true)}>
                                        <IconUserCircle className="mr-2 h-4 w-4" />
                                        Edit Account
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 hover:bg-red-50/50" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4 text-red-600" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            <DialogEditUser open={openEdit} setOpen={setOpenEdit} user={user} mutate={mutate} />

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('my-tickets')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-tickets'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                My Ticket
                            </div>
                        </button>
                        {/* <button
                            onClick={() => setActiveTab('create-ticket')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create-ticket'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Buat Tiket
                            </div>
                        </button> */}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
        </div>
    );
};