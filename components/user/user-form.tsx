import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { useRef, useState, useEffect } from "react"
import { toast } from "sonner"

type UserFormData = {
    id?: number
    company: string
    name: string
    email: string
    password?: string
    role: number
}

export default function DialogUserForm({
    mutateUsers,
    roleId,
    mode = "create",
    initialData,
}: {
    mutateUsers: () => void
    roleId: number
    mode?: "create" | "edit"
    initialData?: Partial<UserFormData>
}) {
    const closeRef = useRef<HTMLButtonElement>(null)

    const [formData, setFormData] = useState<UserFormData>({
        company: "",
        name: "",
        email: "",
        password: "",
        role: 0,
    })

    const getRoleLabel = (roleId: number) => {
        switch (roleId) {
            case 1:
                return "Admin";
            case 2:
                return "Engineer";
            case 3:
                return "User";
            default:
                return "User";
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData((prev) => ({
                ...prev,
                id: initialData.id || 0,
                company: initialData.company || "",
                name: initialData.name || "",
                email: initialData.email || "",
                password: "", // kosongkan password saat edit
            }))
        }
    }, [initialData])

    useEffect(() => {
        if (roleId) {
            setFormData((prev) => ({
                ...prev,
                role: roleId,
            }))
        }
    }, [roleId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(
                mode === "edit" ? `/api/users/${formData.id}` : "/api/users",
                {
                    method: mode === "edit" ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            )

            if (res.ok) {
                toast.success(mode === "edit" ? `${getRoleLabel(formData.role)} updated` : `${getRoleLabel(formData.role)} created`)
                closeRef.current?.click()
                mutateUsers()
                setFormData({
                    company: "",
                    name: "",
                    email: "",
                    password: "",
                    role: 0
                })
            } else {
                const err = await res.json()
                toast.error("Error: " + err.message || "Failed to submit")
            }
        } catch (err) {
            console.error("🔥 Error:", err)
            toast.error("Server error")
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={mode === "edit" ? "outline" : "default"}>
                    {mode === "edit" ? <><IconEdit className="mr-2 h-4 w-4" /> Edit</> : <><IconPlus className="mr-2 h-4 w-4" /> Add {getRoleLabel(formData.role)}</>}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{mode === "edit" ? `Edit ${getRoleLabel(formData.role)}` : `Add New ${getRoleLabel(formData.role)}`}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-3">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password {mode === "edit" && "(Optional)"}</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password || ""}
                                onChange={handleChange}
                                placeholder={mode === "edit" ? "••••••••" : ""}
                                required={mode === "create"}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button ref={closeRef} variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">
                            {mode === "edit" ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}