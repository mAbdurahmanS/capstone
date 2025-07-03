"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function DialogEditUser({
    open,
    setOpen,
    user,
    mutate,
}: {
    open: boolean
    setOpen: (val: boolean) => void
    user: {
        id: number
        company: string
        name: string
        email: string
        role: {
            id: number
            name: string
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutate: any
}) {
    const closeRef = useRef<HTMLButtonElement>(null)

    const [formData, setFormData] = useState({
        company: "",
        name: "",
        password: "",
    })

    const [initialData, setInitialData] = useState({
        company: "",
        name: "",
    })

    useEffect(() => {
        setFormData({
            company: user.company || "",
            name: user.name || "",
            password: "",
        })
        setInitialData({
            company: user.company || "",
            name: user.name || "",
        })
    }, [user, open])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Kirim hanya field yang diubah
        const updatedFields: Record<string, string> = {}
        if (formData.name !== initialData.name) updatedFields.name = formData.name
        if (formData.company !== initialData.company)
            updatedFields.company = formData.company
        if (formData.password.trim()) updatedFields.password = formData.password

        if (Object.keys(updatedFields).length === 0) {
            toast.info("Tidak ada perubahan yang dilakukan")
            return
        }

        try {
            const res = await fetch(`/api/users/${user?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedFields),
            })

            if (res.ok) {
                toast.success("User updated successfully")
                closeRef.current?.click()
                setFormData({
                    company: "",
                    name: "",
                    password: "",
                })
                mutate()
            } else {
                const err = await res.json()
                toast.error("Error: " + (err.message || "Failed to update user"))
            }
        } catch (err) {
            console.error("🔥 Error updating user:", err)
            toast.error("Server error")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
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
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password (opsional)</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button ref={closeRef} variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Update</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}