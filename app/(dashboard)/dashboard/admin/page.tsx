"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { IconSearch, IconUser } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DialogCreate from "./(action)/create"
import { useFetchUsers } from "@/hooks/useFetchUsers"
import { useAuth } from "@/hooks/useAuth"

export default function Page() {
  const router = useRouter();

  const { users, mutate: mutateUsers } = useFetchUsers(null, 1)

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { isAdmin } = useAuth()


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
                Admin Management
              </h1>
              <p className="text-gray-600">Manage admin assignments</p>
            </div>
          </div>
          <div className="px-4 lg:px-6">
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl">Admin Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search admins..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    {isAdmin && <DialogCreate mutateUsers={mutateUsers} />}
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
