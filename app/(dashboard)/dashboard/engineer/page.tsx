"use client"

import { SectionCards } from "@/components/section-cards"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IconAlertTriangle, IconClock, IconPlus, IconSearch, IconTicket, IconTrendingUp, IconUser } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DialogCreate from "./(action)/create"
import { useFetchTickets } from "@/hooks/useFetchTickets"
import { useFetchUsers } from "@/hooks/useFetchUsers"

export default function Page() {
  const router = useRouter();

  const { users, mutate: mutateUsers } = useFetchUsers(null, 2)

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
  });

  // const users = [
  //   {
  //     id: 1,
  //     name: 'John Smith',
  //     email: 'john@company.com',
  //     role: 'engineer',
  //     department: 'IT Support',
  //     avatar: 'JS',
  //     status: 'active',
  //     ticketsCompleted: 47,
  //     performance: 94,
  //     joinDate: '2023-01-15',
  //   },
  //   {
  //     id: 2,
  //     name: 'Sarah Johnson',
  //     email: 'sarah@company.com',
  //     role: 'engineer',
  //     department: 'Software Development',
  //     avatar: 'SJ',
  //     status: 'active',
  //     ticketsCompleted: 32,
  //     performance: 88,
  //     joinDate: '2023-03-20',
  //   },
  //   {
  //     id: 3,
  //     name: 'Mike Davis',
  //     email: 'mike@company.com',
  //     role: 'engineer',
  //     department: 'Hardware Support',
  //     avatar: 'MD',
  //     status: 'active',
  //     ticketsCompleted: 28,
  //     performance: 91,
  //     joinDate: '2023-02-10',
  //   },
  //   {
  //     id: 4,
  //     name: 'Alice Brown',
  //     email: 'alice@company.com',
  //     role: 'user',
  //     department: 'Marketing',
  //     avatar: 'AB',
  //     status: 'active',
  //     joinDate: '2023-04-05',
  //   },
  //   {
  //     id: 5,
  //     name: 'Bob Wilson',
  //     email: 'bob@company.com',
  //     role: 'user',
  //     department: 'Sales',
  //     avatar: 'BW',
  //     status: 'active',
  //     joinDate: '2023-05-12',
  //   },
  // ];

  const getRoleColor = (role: string) => {
    return role === 'engineer'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Engineer Management
              </h1>
              <p className="text-gray-600">Manage engineer assignments</p>
            </div>
          </div>
          <div className="px-4 lg:px-6">
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl">Engineer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search engineers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <DialogCreate mutateUsers={mutateUsers} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200 !py-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <Badge className={getRoleColor(user.role?.name.toLowerCase())}>
                              {user.role?.name.charAt(0).toUpperCase() + user.role?.name.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <IconUser className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            {/* <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{user.department}</span>
                            </div> */}
                            <div className="flex items-center gap-1">
                              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {user.role?.name.toLowerCase() === 'engineer' && (
                          <div className="flex gap-6 text-center">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <IconTicket className="h-4 w-4" />
                                <span className="text-xs font-medium">Tickets</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-700">{user.ticketsCompleted ?? 10}</div>
                              <div className="text-xs text-blue-600">Completed</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 text-green-600 mb-1">
                                <IconTrendingUp className="h-4 w-4" />
                                <span className="text-xs font-medium">Performance</span>
                              </div>
                              <div className={`text-2xl font-bold ${getPerformanceColor(user.performance! ?? 90)}`}>
                                {user.performance ?? 90}%
                              </div>
                              <div className="text-xs text-green-600">Rating</div>
                            </div>
                          </div>
                        )}
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
