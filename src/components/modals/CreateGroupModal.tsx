import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdaptiveDrawer } from '@/components/ui/AdaptiveDrawer';
import { LocationMapPicker } from '@/components/maps/LocationMapPicker';
import { MapPin, Users, FileText } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    location: { lat: number; lng: number; address: string };
  }) => void;
}

export const CreateGroupModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateGroupModalProps) => {
  const [step, setStep] = useState<'details' | 'location'>('details');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [location, setLocation] = useState({
    lat: 41.2995,
    lng: 69.2401,
    address: '',
  });

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
  };

  const handleNext = () => {
    if (formData.name.trim()) {
      setStep('location');
    }
  };

  const handleBack = () => {
    setStep('details');
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      location,
    });
    // Reset form
    setFormData({ name: '', description: '' });
    setStep('details');
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setStep('details');
    onClose();
  };

  return (
    <AdaptiveDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'details' ? 'Create New Group' : 'Select Location'}
      className={step === 'location' ? 'sm:max-w-4xl' : ''}
    >
      {step === 'details' ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-6"
        >
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-zinc-700">
              Group Name *
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., English Elementary A1"
                className="h-14 pl-12 rounded-2xl border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-zinc-700">
              Description (Optional)
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-4">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a brief description about this group..."
                className="min-h-[120px] pl-12 pt-4 rounded-2xl border-zinc-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-2xl border-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!formData.name.trim()}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
            >
              Next: Location
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Map Container */}
          <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-zinc-200/60">
            <LocationMapPicker
              initialLat={location.lat}
              initialLng={location.lng}
              onLocationChange={handleLocationChange}
            />
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4">
            <p className="text-sm text-blue-900">
              <MapPin className="w-4 h-4 inline mr-2" />
              Drag the map to position the pin at your desired location
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl border-zinc-300"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
            >
              Confirm Location
            </Button>
          </div>
        </motion.div>
      )}
    </AdaptiveDrawer>
  );
};

export default CreateGroupModal;
