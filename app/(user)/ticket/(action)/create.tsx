import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFetchCategories } from "@/hooks/useFetchCategories"
import { IconPlus } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function DialogCreate({ mutateTickets, userId }: { mutateTickets: () => void, userId: number }) {

    const closeRef = useRef<HTMLButtonElement>(null);
    const { categories } = useFetchCategories()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        customer_id: userId,
        category_id: "",
    })

    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            category_id: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true);
        try {
            // 1. Upload images ke /api/upload
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

            // 2. Submit ticket
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    images: imageUrls, // array of URL string
                }),
            })

            if (res.ok) {
                toast.success("Ticket created successfully")
                closeRef.current?.click();
                setFormData({
                    title: "",
                    description: "",
                    customer_id: userId,
                    category_id: "",
                })
                setImages([]);
                mutateTickets()
            } else {
                const err = await res.json()
                toast.error("Error: " + err.message || "Failed to create ticket")
            }
        } catch (err) {
            console.error("🔥 Error creating ticket:", err)
            toast.error("Server error")
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (userId) {
            setFormData((prev) => ({
                ...prev,
                customer_id: userId,
            }))
        }
    }, [userId])


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Ticket</DialogTitle>
                        <DialogDescription>
                            Fill the form to create a new ticket.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-3">
                            <Label htmlFor="images">Upload Images</Label>
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
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="category">Category</Label>
                            <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {categories.map((cat: any) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button ref={closeRef} variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
