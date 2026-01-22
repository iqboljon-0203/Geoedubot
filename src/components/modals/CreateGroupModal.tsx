import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/maps/LocationPicker";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    } | null;
  }) => void;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateGroupModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Xatolik",
        description: "Guruh sarlavhasini kiriting",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setLocation(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yangi guruh yaratish</DialogTitle>
            <DialogDescription>
              Yangi guruh yaratish uchun quyidagi ma'lumotlarni to'ldiring
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Guruh sarlavhasi</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Guruh nomini kiriting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Guruh haqida qisqacha ma'lumot"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Manzil</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setIsMapOpen(true)}
                >
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {location ? location.address : "Manzilni tanlang"}
                  </span>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Bekor qilish
              </Button>
              <Button type="submit">Yaratish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={setLocation}
      />
    </>
  );
}
