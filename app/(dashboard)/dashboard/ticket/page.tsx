"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IconAlertTriangle, IconClock, IconMessageCircle, IconSearch, IconUser } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DialogCreate from "./(action)/create"
import { useFetchTickets } from "@/hooks/useFetchTickets"
import { useAuth } from "@/hooks/useAuth"

export default function Page() {
  const router = useRouter();

  const { tickets, mutate: mutateTickets } = useFetchTickets();
  const { user, isAdmin, isEngineer } = useAuth()

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
    if (isEngineer && ticket.engineer?.id !== user.id) {
      return false;
    }
    const matchesStatus = filterStatus === 'all' || ticket.status?.name === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority?.name === filterPriority;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Ticket Management
              </h1>
              <p className="text-gray-600">Manage and track all support tickets</p>
            </div>
          </div>
          <div className="px-4 lg:px-6">
            <div>
              <Card className="mb-6">
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
                    {isAdmin && <DialogCreate mutateTickets={mutateTickets} />}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredTickets.map((ticket: any) => (
                  <Card key={ticket.id} className="hover:shadow-lg transition-shadow duration-200">
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
                            <Badge className={getPriorityColor(ticket.priority.name)}>
                              {ticket.priority.name}
                            </Badge>
                          )}
                          {ticket.status && ticket?.status?.name && (
                            <Badge className={getStatusColor(ticket.status.name)}>
                              {ticket.status.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                            <IconMessageCircle className="h-4 w-4" />
                            View Details
                          </Button>
                          {/* <Button variant="outline" size="sm">Edit</Button> */}
                        </div>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2">{ticket.title}</h4>
                      <p className="text-gray-600 mb-4">{ticket.description}</p>

                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <IconUser className="h-4 w-4" />
                          <span>Assigned to: {ticket.engineer?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconClock className="h-4 w-4" />
                          <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconAlertTriangle className="h-4 w-4" />
                          <span>Customer: {ticket.customer?.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
