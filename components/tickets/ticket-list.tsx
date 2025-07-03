import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MessageCircle } from 'lucide-react';
import { IconClock, IconMessageCircle, IconSearch, IconUser } from '@tabler/icons-react';
import DialogCreate from '@/app/(user)/ticket/(action)/create';
import { useFetchTickets } from '@/hooks/useFetchTickets';
import { useAuth } from '@/hooks/useAuth';

interface UserTicketListProps {
    onReplyClick: (ticketId: number) => void;
}

export default function TicketList({ onReplyClick }: UserTicketListProps) {

    const { tickets, mutate: mutateTickets } = useFetchTickets();
    const { user, isUser } = useAuth()

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredTickets = tickets.filter((ticket: any) => {
        if (isUser && ticket.customer?.id !== user.id) {
            return false;
        }
        const matchesStatus = filterStatus === 'all' || ticket.status?.name === filterStatus;
        const matchesPriority = filterPriority === 'all' || ticket.priority?.name === filterPriority;
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tiket</p>
                                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MessageCircle className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sedang Dikerjakan</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {tickets.filter(t => t.status === 'in-progress').length}
                                </p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Selesai</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {tickets.filter(t => t.status === 'resolved').length}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MessageCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Balasan Baru</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {tickets.reduce((sum, t) => sum + t.unreadReplies, 0)}
                                </p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div> */}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Ticket Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search tickets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <DialogCreate mutateTickets={mutateTickets} userId={user?.id} />
                    </div>
                </CardContent>
            </Card>

            {/* Ticket List */}
            <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredTickets.map((ticket: any) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    <h3 className="text-lg font-semibold">
                                        TK-{ticket.id}-{new Date(ticket.created_at).toLocaleDateString("en-GB", {
                                            year: "2-digit",
                                            month: "2-digit",
                                        }).replace("/", "-")}
                                    </h3>
                                    {ticket.priority && ticket?.priority?.name && (
                                        <Badge className={getPriorityColor(ticket.priority?.name)}>
                                            {ticket.priority?.name}
                                        </Badge>
                                    )}
                                    {ticket.status && ticket?.status?.name && (
                                        <Badge className={getStatusColor(ticket.status?.name)}>
                                            {ticket.status.name}
                                        </Badge>
                                    )}
                                    {ticket.unreadReplies > 0 && (
                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                            {ticket.unreadReplies} balasan baru
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    onClick={() => onReplyClick(ticket.id)}
                                    variant="outline"
                                >
                                    <IconMessageCircle className="h-4 w-4" />
                                    View Detail
                                </Button>
                            </div>

                            <h4 className="font-medium text-gray-900 mb-2">{ticket.title}</h4>
                            <p className="text-gray-600 mb-4">{ticket.description}</p>

                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <IconClock className="h-4 w-4" />
                                    <span>Created: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <IconUser className="h-4 w-4" />
                                    <span>Engineer: {ticket.engineer?.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <IconClock className="h-4 w-4" />
                                    <span>Last Update: {new Date(ticket.updated_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTickets.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                        <p className="text-gray-600">Try changing the filters or creating a new ticket.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
