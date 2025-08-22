import React, { useState } from 'react';
import { X, Upload, Building, MapPin, Phone, Mail, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';

interface PostServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostServiceModal: React.FC<PostServiceModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addEventManager } = useApp();
  
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    categories: [] as string[],
    experience: 1,
    location: '',
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    services: [] as {
      name: string;
      description: string;
      price: number;
      duration: string;
    }[],
    pricing: {
      basePrice: 10000,
      packages: [] as {
        name: string;
        description: string;
        price: number;
        features: string[];
      }[]
    }
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventCategories = [
    { value: 'wedding', label: 'Wedding', icon: '💒' },
    { value: 'birthday', label: 'Birthday', icon: '🎂' },
    { value: 'corporate', label: 'Corporate', icon: '🏢' },
    { value: 'parties', label: 'Parties', icon: '🎉' },
    { value: 'others', label: 'Others', icon: '🎊' }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: '',
        description: '',
        price: 0,
        duration: ''
      }]
    }));
  };

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.contactInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.contactInfo.email.trim()) {
      newErrors.email = 'Email is required';
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
      toast.error('Please sign in to post your service');
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = await Promise.all(
        images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      await addEventManager({
        userId: user.id,
        businessName: formData.businessName,
        description: formData.description,
        categories: formData.categories,
        experience: formData.experience,
        location: formData.location,
        contactInfo: formData.contactInfo,
        portfolio: {
          images: imageUrls,
          videos: [],
          pastEvents: []
        },
        services: formData.services,
        availability: {
          dates: [],
          timeSlots: []
        },
        pricing: formData.pricing,
        rating: 0,
        reviews: 0,
        verified: false,
        featured: false,
        status: 'pending'
      });

      toast.success('Event manager profile created successfully! Pending admin approval.');
      onClose();
      
      setFormData({
        businessName: '',
        description: '',
        categories: [],
        experience: 1,
        location: '',
        contactInfo: { phone: '', email: '', website: '' },
        portfolio: { images: [], videos: [], pastEvents: [] },
        services: [],
        availability: { dates: [], timeSlots: [] },
        pricing: { basePrice: 10000, packages: [] }
      });
      setImages([]);
      setErrors({});
    } catch (error) {
      console.error('Error creating event manager profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create Event Manager Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.businessName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.businessName && (
              <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business, expertise, and what makes you unique"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Categories *
            </label>
            <div className="grid grid-cols-5 gap-3">
              {eventCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategoryToggle(category.value)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    formData.categories.includes(category.value)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium">{category.label}</div>
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-sm mt-1">{errors.categories}</p>
            )}
          </div>

          {/* Experience & Location */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                min="0"
                max="50"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
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
                  placeholder="Enter your location"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  placeholder="Enter phone number"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  placeholder="Enter email address"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Services
              </label>
              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
            
            {formData.services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No services added yet. Click "Add Service" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Service {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          placeholder="e.g., Wedding Planning"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={service.duration}
                          onChange={(e) => updateService(index, 'duration', e.target.value)}
                          placeholder="e.g., 6 months"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Describe what this service includes"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', parseInt(e.target.value))}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                ))}
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
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostServiceModal;
