import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdaptiveDrawer } from '@/components/ui/AdaptiveDrawer';
import { LocationMapPicker } from '@/components/maps/LocationMapPicker';
import { MapPin, Users, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      title={step === 'details' ? t('groups.create_new') : t('groups.select_location')}
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
            <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground">
              {t('groups.group_name')} *
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Users className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('groups.group_name_placeholder')}
                className="h-14 pl-12 rounded-2xl border-border focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-muted-foreground">
              {t('groups.description')} ({t('common.optional')})
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-4">
                <FileText className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('groups.description_placeholder')}
                className="min-h-[120px] pl-12 pt-4 rounded-2xl border-border focus:border-primary focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-2xl border-border"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!formData.name.trim()}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-semibold"
            >
              {t('common.next')}: {t('groups.location')}
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
          <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border">
            <LocationMapPicker
              initialLat={location.lat}
              initialLng={location.lng}
              onLocationChange={handleLocationChange}
            />
          </div>

          {/* Helper Text */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <p className="text-sm text-foreground">
              <MapPin className="w-4 h-4 inline mr-2" aria-hidden="true" />
              {t('groups.drag_map_hint')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl border-border"
            >
              {t('common.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-semibold"
            >
              {t('groups.confirm_location')}
            </Button>
          </div>
        </motion.div>
      )}
    </AdaptiveDrawer>
  );
};

export default CreateGroupModal;
