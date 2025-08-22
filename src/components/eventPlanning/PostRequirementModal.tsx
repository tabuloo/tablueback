import React, { useState } from 'react';
import { X, Upload, Calendar, MapPin, Users, DollarSign, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostRequirementModal: React.FC<PostRequirementModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addEventRequirement } = useApp();
  
  const [formData, setFormData] = useState({
    eventType: 'wedding' as const,
    eventDate: '',
    location: '',
    guestCount: 50,
    budget: {
      min: 10000,
      max: 50000,
      currency: 'INR'
    },
    notes: '',
    priority: 'medium' as const
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventTypes = [
    { value: 'wedding', label: 'Wedding', icon: '💒' },
    { value: 'birthday', label: 'Birthday', icon: '🎂' },
    { value: 'corporate', label: 'Corporate', icon: '🏢' },
    { value: 'parties', label: 'Parties', icon: '🎉' },
    { value: 'others', label: 'Others', icon: '🎊' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed.');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.eventDate = 'Event date must be in the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1';
    }

    if (formData.budget.min < 0) {
      newErrors.budgetMin = 'Minimum budget cannot be negative';
    }

    if (formData.budget.max < formData.budget.min) {
      newErrors.budgetMax = 'Maximum budget must be greater than minimum budget';
    }

    if (!formData.notes.trim()) {
      newErrors.notes = 'Please provide some details about your event';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error('Please sign in to post a requirement');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 strings (in a real app, you'd upload to cloud storage)
      const imagePromises = images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);

      await addEventRequirement({
        userId: user.uid,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        location: formData.location,
        guestCount: formData.guestCount,
        budget: formData.budget,
        notes: formData.notes,
        images: imageUrls,
        status: 'open',
        priority: formData.priority
      });

      toast.success('Event requirement posted successfully!');
      onClose();
      
      // Reset form
      setFormData({
        eventType: 'wedding',
        eventDate: '',
        location: '',
        guestCount: 50,
        budget: { min: 10000, max: 50000, currency: 'INR' },
        notes: '',
        priority: 'medium'
      });
      setImages([]);
      setErrors({});
    } catch (error) {
      console.error('Error posting requirement:', error);
      toast.error('Failed to post requirement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Post Your Event Requirement</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <div className="grid grid-cols-5 gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('eventType', type.value)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    formData.eventType === type.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.eventDate ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.eventDate && (
              <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter event location"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Guest Count *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                value={formData.guestCount}
                onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                min="1"
                max="1000"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.guestCount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.guestCount && (
              <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
            )}
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Minimum Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={formData.budget.min}
                    onChange={(e) => handleInputChange('budget.min', parseInt(e.target.value))}
                    min="0"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.budgetMin ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.budgetMin && (
                  <p className="text-red-500 text-xs mt-1">{errors.budgetMin}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Maximum Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={formData.budget.max}
                    onChange={(e) => handleInputChange('budget.max', parseInt(e.target.value))}
                    min="0"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.budgetMax ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.budgetMax && (
                  <p className="text-red-500 text-xs mt-1">{errors.budgetMax}</p>
                )}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    formData.priority === priority.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`font-medium ${priority.color}`}>{priority.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Details *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Describe your event, special requirements, theme, etc."
                rows={4}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer inline-flex flex-col items-center ${
                  images.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'
                }`}
              >
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-sm text-gray-600">
                  {images.length >= 5 
                    ? 'Maximum 5 images uploaded' 
                    : 'Click to upload images (max 5)'
                  }
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </span>
              </label>
            </div>
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-5 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Post Requirement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRequirementModal;
