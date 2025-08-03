import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
  formattedAddress: string;
}

interface GoogleMapPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  placeholder?: string;
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for an address..."
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Wait for Google Maps API to be loaded
    const initMap = () => {
      if (!window.google || !window.google.maps) {
        // Retry after a short delay
        setTimeout(initMap, 100);
        return;
      }

      // Initialize map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: initialLocation 
          ? { lat: initialLocation.lat, lng: initialLocation.lng }
          : { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMap(mapInstance);

      // Initialize autocomplete
      if (searchInputRef.current) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'IN' }
        });

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.geometry && place.geometry.location) {
            const location: Location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || '',
              formattedAddress: place.formatted_address || ''
            };
            
            setSelectedLocation(location);
            onLocationSelect(location);
            
            // Update map
            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(16);
            
            // Update marker
            if (marker) {
              marker.setMap(null);
            }
            const newMarker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: mapInstance,
              title: place.formatted_address || ''
            });
            setMarker(newMarker);
          }
        });

        setAutocomplete(autocompleteInstance);
      }

      // Add click listener to map
      mapInstance.addListener('click', (event: any) => {
        if (event.latLng) {
          const location: Location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            address: '',
            formattedAddress: ''
          };

          // Reverse geocoding
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              location.address = results[0].formatted_address;
              location.formattedAddress = results[0].formatted_address;
            }
            
            setSelectedLocation(location);
            onLocationSelect(location);
            
            // Update marker
            if (marker) {
              marker.setMap(null);
            }
            const newMarker = new window.google.maps.Marker({
              position: { lat: location.lat, lng: location.lng },
              map: mapInstance,
              title: location.formattedAddress
            });
            setMarker(newMarker);
          });
        }
      });

      // Set initial marker if location provided
      if (initialLocation) {
        const initialMarker = new window.google.maps.Marker({
          position: { lat: initialLocation.lat, lng: initialLocation.lng },
          map: mapInstance,
          title: initialLocation.formattedAddress
        });
        setMarker(initialMarker);
      }
    };

    // Start initialization
    initMap();
  }, [initialLocation, onLocationSelect]);

  const clearLocation = () => {
    setSelectedLocation(null);
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onLocationSelect({
      lat: 0,
      lng: 0,
      address: '',
      formattedAddress: ''
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: '',
            formattedAddress: ''
          };

          // Reverse geocoding
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results: any, status: any) => {
              setIsLoading(false);
              if (status === 'OK' && results && results[0]) {
                location.address = results[0].formatted_address;
                location.formattedAddress = results[0].formatted_address;
              }
              
              setSelectedLocation(location);
              onLocationSelect(location);
              
              if (map) {
                map.setCenter({ lat: location.lat, lng: location.lng });
                map.setZoom(16);
                
                if (marker) {
                  marker.setMap(null);
                }
                const newMarker = new window.google.maps.Marker({
                  position: { lat: location.lat, lng: location.lng },
                  map: map,
                  title: location.formattedAddress
                });
                setMarker(newMarker);
              }
            });
          }
        },
        (error) => {
          setIsLoading(false);
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  // Show loading state if Google Maps API is not loaded
  if (!window.google || !window.google.maps) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading Google Maps...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {selectedLocation && (
          <button
            onClick={clearLocation}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Map */}
      <div 
        ref={mapRef} 
        className="w-full h-64 border border-gray-300 rounded-md"
      />

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">✅ Location Selected:</p>
              <p className="text-sm text-green-800">{selectedLocation.formattedAddress}</p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker; 