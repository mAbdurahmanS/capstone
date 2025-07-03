"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { IconBuildings, IconSearch, IconTrash, IconUser } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useFetchUsers } from "@/hooks/useFetchUsers"
import { useAuth } from "@/hooks/useAuth"
import DialogUserForm from "@/components/user/user-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function Page() {

  const { users, mutate: mutateUsers } = useFetchUsers(null, 2)

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole] = useState('all');
  const { isAdmin } = useAuth()


  const getRoleColor = (role: string) => {
    return role === 'engineer'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // const getPerformanceColor = (performance: number) => {
  //   if (performance >= 90) return 'text-green-600';
  //   if (performance >= 80) return 'text-yellow-600';
  //   return 'text-red-600';
  // };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredUsers = users.filter((user: any) => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleDelete = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("User deleted successfully");
        mutateUsers();
      } else {
        const err = await res.json();
        toast.error("Failed to delete data: " + err.message || "Unknown error");
      }
    } catch (error) {
      console.error("🔥 Delete error:", error);
      toast.error("Server error while deleting data");
    }
  };

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
                    {isAdmin && <DialogUserForm mutateUsers={mutateUsers} roleId={2} />}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredUsers.map((user: any) => (
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
                              <IconBuildings className="h-4 w-4" />
                              <span>{user?.company ?? "Tokopedia"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>


                        <div className="flex gap-2">
                          {isAdmin && <DialogUserForm mutateUsers={mutateUsers} roleId={2} mode="edit" initialData={user} />}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline"><IconTrash className="h-4 w-4" /> Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your
                                  data and remove your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user?.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* {user.role?.name.toLowerCase() === 'engineer' && (
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
                        )} */}
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
