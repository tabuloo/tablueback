import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import GoogleMapPicker from './GoogleMapPicker';

interface Location {
  lat: number;
  lng: number;
  address: string;
  formattedAddress: string;
}

interface AddressDetails {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  addressType: 'home' | 'work' | 'office' | 'other';
}

interface AddressFormProps {
  onSave: (address: {
    label: string;
    details: AddressDetails;
    location?: Location;
  }) => void;
  onCancel: () => void;
  initialData?: {
    label: string;
    details: AddressDetails;
    location?: Location;
  };
  isEditing?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSave,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [label, setLabel] = useState(initialData?.label || '');
  const [location, setLocation] = useState<Location>(initialData?.location || {
    lat: 0,
    lng: 0,
    address: '',
    formattedAddress: ''
  });
  const [details, setDetails] = useState<AddressDetails>(initialData?.details || {
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'home'
  });

  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation);
    
    // Try to parse address components from Google's formatted address
    if (selectedLocation.formattedAddress) {
      const addressParts = selectedLocation.formattedAddress.split(', ');
      if (addressParts.length >= 3) {
        const newDetails = { ...details };
        
        // Extract street address (first part)
        newDetails.street = addressParts[0] || '';
        
        // Extract city (usually second to last part)
        if (addressParts.length >= 2) {
          newDetails.city = addressParts[addressParts.length - 3] || '';
        }
        
        // Extract state (usually second to last part)
        if (addressParts.length >= 2) {
          newDetails.state = addressParts[addressParts.length - 2] || '';
        }
        
        // Extract pincode (last part, if it's numeric)
        const lastPart = addressParts[addressParts.length - 1];
        if (lastPart && /^\d{6}$/.test(lastPart)) {
          newDetails.pincode = lastPart;
        }
        
        setDetails(newDetails);
      }
    }
  };

  const handleSave = () => {
    if (!label.trim()) {
      alert('Please enter an address label');
      return;
    }
    
    // Check if either map location is selected OR manual address details are filled
    const hasMapLocation = location.formattedAddress && location.lat !== 0 && location.lng !== 0;
    const hasManualAddress = details.street && details.city && details.state && details.pincode;
    
    if (!hasMapLocation && !hasManualAddress) {
      alert('Please either select a location on the map OR fill in the address details manually');
      return;
    }

    onSave({
      label,
      details,
      location: hasMapLocation ? location : undefined
    });
  };

  const clearAddressFields = () => {
    setDetails({
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      addressType: details.addressType
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Address Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Label *
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Home, Work, Office"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Type *
        </label>
        <select
          value={details.addressType}
          onChange={(e) => setDetails({ ...details, addressType: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Map Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Location on Map (Optional)
        </label>
        <div className="mb-2 text-xs text-gray-600">
          💡 <strong>You can either:</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li><strong>Option 1:</strong> Select a location on the map (auto-fills address details)</li>
            <li><strong>Option 2:</strong> Skip the map and fill in address details manually below</li>
          </ul>
          <p className="mt-2 text-blue-600"><strong>How to use the map:</strong></p>
          <ul className="mt-1 ml-4 list-disc">
            <li>Type your address in the search box above the map</li>
            <li>Click anywhere on the map to select a location</li>
            <li>Use the "Use Current Location" button</li>
          </ul>
        </div>
        <GoogleMapPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={location.lat !== 0 ? location : undefined}
          placeholder="Search for your address..."
        />
      </div>

      {/* Address Details */}
      <div>
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>📝 Address Details:</strong> Fill in your address details below.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={details.street}
              onChange={(e) => setDetails({ ...details, street: e.target.value })}
              placeholder="House/Flat number, Street name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={details.city}
              onChange={(e) => setDetails({ ...details, city: e.target.value })}
              placeholder="City name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              value={details.state}
              onChange={(e) => setDetails({ ...details, state: e.target.value })}
              placeholder="State name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <input
              type="text"
              value={details.pincode}
              onChange={(e) => setDetails({ ...details, pincode: e.target.value })}
              placeholder="6-digit pincode"
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Landmark (Optional)
        </label>
        <input
          type="text"
          value={details.landmark}
          onChange={(e) => setDetails({ ...details, landmark: e.target.value })}
          placeholder="e.g., Near Metro Station, Behind Mall"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address Preview */}
      {(details.street || details.city || details.state || details.pincode || location.formattedAddress) && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">📋 Address Preview:</p>
              {location.formattedAddress ? (
                <div>
                  <p className="text-sm text-green-800 font-medium">From Map: {location.formattedAddress}</p>
                  {details.street && (
                    <p className="text-sm text-green-700 mt-1">
                      Manual Details: {details.street}, {details.city}, {details.state} {details.pincode}
                      {details.landmark && ` (${details.landmark})`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-green-800">
                  {details.street && `${details.street}, `}
                  {details.city && `${details.city}, `}
                  {details.state && `${details.state} `}
                  {details.pincode && `${details.pincode}`}
                  {details.landmark && ` (${details.landmark})`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {isEditing ? 'Update Address' : 'Save Address'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddressForm; 