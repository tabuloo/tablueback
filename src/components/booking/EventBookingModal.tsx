import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, Clock, Users, PartyPopper, CreditCard, Plus, Trash2, CheckCircle, Wallet, Banknote, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateIndianPhoneNumber, formatPhoneNumber } from '../../utils/validation';
import EventPlanningChat from '../chat/EventPlanningChat';
import paymentService from '../../services/paymentService';

interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurantId?: string;
}

const EventBookingModal: React.FC<EventBookingModalProps> = ({ isOpen, onClose, selectedRestaurantId }) => {
  const { user, updateWalletBalance } = useAuth();
  const { restaurants, addBooking } = useApp();
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay' | 'cod'>('razorpay');
  const [showChat, setShowChat] = useState(false);

     const [formData, setFormData] = useState({
     restaurantId: selectedRestaurantId || '',
     occasion: '',
     date: '',
     time: '',
     customers: '1',
     customerNames: [''],
     customerPhones: [user?.phone || ''],
     phone: user?.phone || '',
     placeForEvent: '',
     description: '',
     specialRequests: ''
   });

  const paymentMethods = [
    { id: 'wallet', name: 'Tabuloo Wallet', icon: Wallet, description: `Balance: ₹${(user?.walletBalance || 0).toFixed(2)}` },
    { id: 'razorpay', name: 'Secure Payment', icon: CreditCard, description: 'Credit/Debit Card, UPI, Net Banking via Razorpay' },
    { id: 'cod', name: 'Cash on Arrival', icon: Banknote, description: 'Pay when you arrive for the event' }
  ];

  const selectedRestaurant = restaurants.find(r => r.id === formData.restaurantId);

  const occasions = [
    'Birthday Party', 'Anniversary', 'Wedding Reception', 'Corporate Event',
    'Baby Shower', 'Graduation Party', 'Holiday Celebration', 'Reunion',
    'Business Meeting', 'Product Launch', 'Engagement Party', 'Retirement Party',
    'Housewarming', 'Festival Celebration', 'Other'
  ];

     const handleCustomerCountChange = (count: string) => {
     const numCount = parseInt(count) || 1;
     let names;
     let phones;
     
     if (numCount <= 3) {
       // For 1-3 persons: create array with exact number of names and phones
       names = Array(numCount).fill('').map((_, index) => formData.customerNames[index] || '');
       phones = Array(numCount).fill('').map((_, index) => formData.customerPhones[index] || '');
     } else {
       // For 4+ persons: only ask for 3 names and phones (first 2 required, 3rd optional)
       names = Array(3).fill('').map((_, index) => formData.customerNames[index] || '');
       phones = Array(3).fill('').map((_, index) => formData.customerPhones[index] || '');
     }
     
     setFormData(prev => ({ ...prev, customers: count, customerNames: names, customerPhones: phones }));
   };

     const handleNameChange = (index: number, name: string) => {
     const updatedNames = [...formData.customerNames];
     updatedNames[index] = name;
     setFormData(prev => ({ ...prev, customerNames: updatedNames }));
   };

   const handlePhoneChange = (index: number, phone: string) => {
     const updatedPhones = [...formData.customerPhones];
     updatedPhones[index] = phone;
     setFormData(prev => ({ ...prev, customerPhones: updatedPhones }));
   };

     const addCustomerField = () => {
     setFormData(prev => ({
       ...prev,
       customerNames: [...prev.customerNames, ''],
       customerPhones: [...prev.customerPhones, '']
     }));
   };

     const removeCustomerField = (index: number) => {
     if (formData.customerNames.length > 1) {
       const updatedNames = formData.customerNames.filter((_, i) => i !== index);
       const updatedPhones = formData.customerPhones.filter((_, i) => i !== index);
       setFormData(prev => ({
         ...prev,
         customerNames: updatedNames,
         customerPhones: updatedPhones,
         customers: updatedNames.length.toString()
       }));
     }
   };

  const validateForm = () => {
    if (!selectedRestaurant) {
      toast.error('Please select a venue');
      return false;
    }

    if (!formData.occasion || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!formData.phone) {
      toast.error('Phone number is required');
      return false;
    }
    
    if (!validateIndianPhoneNumber(formData.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    const customerCount = parseInt(formData.customers);
    if (customerCount > selectedRestaurant.crowdCapacity) {
      toast.error(`Venue capacity is limited to ${selectedRestaurant.crowdCapacity} people`);
      return false;
    }

    // Validation logic for customer names
    if (customerCount === 1) {
      // For 1 person: only first name required
      if (!formData.customerNames[0]?.trim()) {
        toast.error('Please provide the customer name');
        return false;
      }
         } else if (customerCount === 2) {
       // For 2 people: both names and phones required
       if (!formData.customerNames[0]?.trim() || !formData.customerNames[1]?.trim()) {
         toast.error('Please provide names for both attendees');
         return false;
       }
       if (!formData.customerPhones[0]?.trim() || !formData.customerPhones[1]?.trim()) {
         toast.error('Please provide phone numbers for both attendees');
         return false;
       }
       // Validate phone numbers
       if (!validateIndianPhoneNumber(formData.customerPhones[0]) || !validateIndianPhoneNumber(formData.customerPhones[1])) {
         toast.error('Please enter valid 10-digit Indian phone numbers for both attendees');
         return false;
       }
     } else if (customerCount === 3) {
       // For 3 people: first 2 names and phones mandatory, 3rd optional
       if (!formData.customerNames[0]?.trim() || !formData.customerNames[1]?.trim()) {
         toast.error('Please provide names for at least the first two attendees');
         return false;
       }
       if (!formData.customerPhones[0]?.trim() || !formData.customerPhones[1]?.trim()) {
         toast.error('Please provide phone numbers for at least the first two attendees');
         return false;
       }
       // Validate phone numbers for first 2
       if (!validateIndianPhoneNumber(formData.customerPhones[0]) || !validateIndianPhoneNumber(formData.customerPhones[1])) {
         toast.error('Please enter valid 10-digit Indian phone numbers for the first two attendees');
         return false;
       }
       // Note: 3rd name and phone are optional, so no validation needed
     } else if (customerCount > 3) {
       // For 4+ people: first 2 names and phones mandatory, 3rd optional (only 3 fields shown)
       if (!formData.customerNames[0]?.trim() || !formData.customerNames[1]?.trim()) {
         toast.error('Please provide names for at least the first two attendees');
         return false;
       }
       if (!formData.customerPhones[0]?.trim() || !formData.customerPhones[1]?.trim()) {
         toast.error('Please provide phone numbers for at least the first two attendees');
         return false;
       }
       // Validate phone numbers for first 2
       if (!validateIndianPhoneNumber(formData.customerPhones[0]) || !validateIndianPhoneNumber(formData.customerPhones[1])) {
         toast.error('Please enter valid 10-digit Indian phone numbers for the first two attendees');
         return false;
       }
       // Note: 3rd name and phone are optional, so no validation needed
     }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedRestaurant || !user) return;

    const baseAmount = selectedRestaurant.price * parseInt(formData.customers);
    const eventSurcharge = baseAmount * 0.5; // 50% surcharge for events
    const totalAmount = baseAmount + eventSurcharge;
    const advanceAmount = totalAmount * 0.2; // 20% advance

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      if ((user.walletBalance || 0) < advanceAmount) {
        toast.error('Insufficient wallet balance');
        return;
      }
      updateWalletBalance((user.walletBalance || 0) - advanceAmount);
      
      // Create booking directly for wallet payment
      const booking = {
        userId: user.id,
        restaurantId: formData.restaurantId,
        type: 'event' as const,
        date: formData.date,
        time: formData.time,
        customers: parseInt(formData.customers),
        customerNames: formData.customerNames.filter(name => name.trim() !== ''),
        customerPhones: formData.customerPhones.filter(phone => phone.trim() !== ''),
        phone: formData.phone,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        amount: advanceAmount,
        createdAt: new Date(),
        occasion: formData.occasion,
        placeForEvent: formData.placeForEvent,
        description: formData.description,
        specialRequests: formData.specialRequests,
        paymentMethod: paymentMethod
      };

      try {
        await addBooking(booking);
        await sendEventEmails(booking, selectedRestaurant, user);
        setStep('confirmation');
      } catch (error) {
        console.error('Event booking error:', error);
        toast.error('Failed to create event booking');
      }
      return;
    }

    // Handle COD payment
    if (paymentMethod === 'cod') {
      const booking = {
        userId: user.id,
        restaurantId: formData.restaurantId,
        type: 'event' as const,
        date: formData.date,
        time: formData.time,
        customers: parseInt(formData.customers),
        customerNames: formData.customerNames.filter(name => name.trim() !== ''),
        customerPhones: formData.customerPhones.filter(phone => phone.trim() !== ''),
        phone: formData.phone,
        status: 'confirmed' as const,
        paymentStatus: 'pending' as const,
        amount: advanceAmount,
        createdAt: new Date(),
        occasion: formData.occasion,
        placeForEvent: formData.placeForEvent,
        description: formData.description,
        specialRequests: formData.specialRequests,
        paymentMethod: paymentMethod
      };

      try {
        await addBooking(booking);
        await sendEventEmails(booking, selectedRestaurant, user);
        setStep('confirmation');
      } catch (error) {
        console.error('Event booking error:', error);
        toast.error('Failed to create event booking');
      }
      return;
    }

    // For Razorpay payment
    try {
      const bookingData = {
        amount: advanceAmount,
        phone: formData.phone,
        venueName: selectedRestaurant.name,
        occasion: formData.occasion,
        date: formData.date,
        time: formData.time,
        attendees: formData.customers,
        customerNames: formData.customerNames.filter(name => name.trim() !== ''),
        customerPhones: formData.customerPhones.filter(phone => phone.trim() !== ''),
        placeForEvent: formData.placeForEvent,
        description: formData.description,
        specialRequests: formData.specialRequests
      };

      await paymentService.initializeEventBookingPayment(
        bookingData,
        user,
        async (paymentResponse: any) => {
          try {
            console.log('Payment successful:', paymentResponse);
            
            // Verify payment
            const verificationResponse = await paymentService.verifyPayment(
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_order_id
            );
            
            if (verificationResponse.success) {
              // Create booking
              const booking = {
                userId: user.id,
                restaurantId: formData.restaurantId,
                type: 'event' as const,
                date: formData.date,
                time: formData.time,
                customers: parseInt(formData.customers),
                customerNames: formData.customerNames.filter(name => name.trim() !== ''),
                customerPhones: formData.customerPhones.filter(phone => phone.trim() !== ''),
                phone: formData.phone,
                status: 'confirmed' as const,
                paymentStatus: 'paid' as const,
                amount: advanceAmount,
                createdAt: new Date(),
                occasion: formData.occasion,
                placeForEvent: formData.placeForEvent,
                description: formData.description,
                specialRequests: formData.specialRequests,
                paymentMethod: 'razorpay' as const,
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id
              };

              await addBooking(booking);
              await sendEventEmails(booking, selectedRestaurant, user);
              toast.success('Payment successful! Event booked.');
              setStep('confirmation');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        (error: any) => {
          console.error('Payment error:', error);
          toast.error(`Payment failed: ${error.message}`);
        }
      );
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const sendEventEmails = async (booking: any, restaurant: any, user: any) => {
    // Simulate email sending to user and restaurant
    console.log('Sending event booking emails:', {
      userEmail: user.email || user.phone,
      restaurantEmail: restaurant.ownerCredentials.username,
      eventDetails: booking
    });
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center p-4 sm:p-6 border-b">
           <div>
             <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
               <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-red-800" />
               Event Management & Booking
             </h2>
             <p className="text-xs text-red-600 mt-1 flex items-center">
               <HelpCircle className="h-3 w-3 mr-1" />
               Need help? Click the help button for instant support!
             </p>
           </div>
                     <div className="flex items-center space-x-2">
             <div className="relative">
               <button 
                 onClick={() => setShowChat(true)}
                 className="text-red-600 hover:text-red-700 p-2 transition-colors bg-red-50 rounded-full animate-pulse hover:animate-none"
                 title="Get Help with Event Planning"
               >
                 <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
               </button>
               {/* Blinking dot indicator */}
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
               <X className="h-5 w-5 sm:h-6 sm:w-6" />
             </button>
           </div>
        </div>

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue/Restaurant *
                </label>
                <select
                  value={formData.restaurantId}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  required
                >
                  <option value="">Select a venue</option>
                  {restaurants.filter(r => r.isOpen).map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - Capacity: {restaurant.crowdCapacity} people
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion *
                </label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  required
                >
                  <option value="">Select occasion</option>
                  {occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {occasion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Persons Attending *
              </label>
              <input
                type="number"
                min="1"
                max={selectedRestaurant?.crowdCapacity || 100}
                required
                value={formData.customers}
                onChange={(e) => handleCustomerCountChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
              />
              {selectedRestaurant && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum capacity: {selectedRestaurant.crowdCapacity} people
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
              {formData.phone && !validateIndianPhoneNumber(formData.phone) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit Indian phone number</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place for the Event
              </label>
              <input
                type="text"
                value={formData.placeForEvent}
                onChange={(e) => setFormData(prev => ({ ...prev, placeForEvent: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                placeholder="Specific area or hall within the venue (optional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Event Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                />
              </div>
            </div>

                         <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-medium text-gray-700">
                   <Users className="h-4 w-4 inline mr-1" />
                   Customer Details - Name of the Customers
                   {parseInt(formData.customers) === 1 && (
                     <span className="text-xs sm:text-sm text-gray-500 ml-1">
                       (Required)
                     </span>
                   )}
                   {parseInt(formData.customers) === 2 && (
                     <span className="text-xs sm:text-sm text-gray-500 ml-1">
                       (Both required)
                     </span>
                   )}
                   {parseInt(formData.customers) === 3 && (
                     <span className="text-xs sm:text-sm text-gray-500 ml-1">
                       (First 2 required, 3rd optional)
                     </span>
                   )}
                   {parseInt(formData.customers) > 3 && (
                     <span className="text-xs sm:text-sm text-gray-500 ml-1">
                       (First 2 required, 3rd optional - Only 3 names needed)
                     </span>
                   )}
                 </label>
                {parseInt(formData.customers) <= 3 && (
                  <button
                    type="button"
                    onClick={addCustomerField}
                    className="flex items-center space-x-1 text-red-800 hover:text-red-900 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Attendee</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {formData.customerNames.map((name, index) => {
                  const customerCount = parseInt(formData.customers);
                  let isRequired = false;
                  let placeholder = '';
                  
                                     if (customerCount === 1) {
                     isRequired = index === 0;
                     placeholder = 'Attendee name (required)';
                   } else if (customerCount === 2) {
                     isRequired = true;
                     placeholder = `Attendee ${index + 1} name (required)`;
                   } else if (customerCount === 3) {
                     // For 3 persons: first 2 required, 3rd optional
                     if (index === 0 || index === 1) {
                       isRequired = true;
                       placeholder = `Attendee ${index + 1} name (required)`;
                     } else if (index === 2) {
                       isRequired = false;
                       placeholder = `Attendee ${index + 1} name (optional)`;
                     }
                   } else if (customerCount > 3) {
                     // For 4+ persons: only show 3 fields, first 2 required, 3rd optional
                     if (index === 0 || index === 1) {
                       isRequired = true;
                       placeholder = `Attendee ${index + 1} name (required)`;
                     } else if (index === 2) {
                       isRequired = false;
                       placeholder = `Attendee ${index + 1} name (optional)`;
                     }
                   }
                  
                                     return (
                     <div key={index} className="space-y-2">
                       <div className="flex items-center space-x-2">
                         <input
                           type="text"
                           placeholder={placeholder}
                           value={name}
                           onChange={(e) => handleNameChange(index, e.target.value)}
                           className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                           required={isRequired}
                         />
                         {formData.customerNames.length > 1 && (
                           <button
                             type="button"
                             onClick={() => removeCustomerField(index)}
                             className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         )}
                       </div>
                       {/* Phone number field */}
                       <div className="flex items-center space-x-2">
                         <input
                           type="tel"
                           placeholder={`Attendee ${index + 1} phone number ${isRequired ? '(required)' : '(optional)'}`}
                           value={formData.customerPhones[index] || ''}
                           onChange={(e) => {
                             const formatted = formatPhoneNumber(e.target.value);
                             handlePhoneChange(index, formatted);
                           }}
                           className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                           required={isRequired}
                           maxLength={10}
                         />
                         {formData.customerPhones[index] && !validateIndianPhoneNumber(formData.customerPhones[index]) && (
                           <p className="text-red-500 text-sm">Invalid phone number</p>
                         )}
                       </div>
                     </div>
                   );
                })}
              </div>
              
              {/* Help text for events with more than 3 attendees */}
              {parseInt(formData.customers) > 3 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Note:</p>
                    <p>For events with more than 3 attendees, we only need the names of the first 3 people (first 2 required, 3rd optional). This helps us prepare the venue and manage the booking efficiently.</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                rows={4}
                placeholder="Brief description of your event, theme, or special requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests & Additional Details
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                rows={4}
                placeholder="Any special decorations, catering preferences, equipment needs, entertainment requirements, etc..."
              />
            </div>

            {selectedRestaurant && parseInt(formData.customers) > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Event Booking Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Venue: {selectedRestaurant.name}</p>
                  <p>Occasion: {formData.occasion}</p>
                  <p>Date: {formData.date} at {formData.time}</p>
                  <p>Attendees: {formData.customers}</p>
                  <p>Base Cost: ₹{(selectedRestaurant.price * parseInt(formData.customers)).toFixed(2)}</p>
                  <p>Event Surcharge (50%): ₹{(selectedRestaurant.price * parseInt(formData.customers) * 0.5).toFixed(2)}</p>
                  <p>Total Amount: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5).toFixed(2)}</p>
                  <p className="font-medium text-red-600">
                    Advance Payment (20%): ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 transition-colors flex items-center justify-center space-x-2 font-medium text-base"
            >
              <span>Book Event</span>
            </button>
          </form>
        )}

        {step === 'payment' && selectedRestaurant && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-red-800 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Event Payment</h3>
              <p className="text-sm sm:text-base text-gray-600">
               Advance payment of ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)} required
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 sm:mb-6">
              <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">Select Payment Method</h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const advanceAmount = selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2;
                  const isWalletInsufficient = method.id === 'wallet' && (user?.walletBalance || 0) < advanceAmount;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      disabled={isWalletInsufficient}
                      className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-red-500 bg-red-50'
                          : isWalletInsufficient
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mr-3" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm sm:text-base">{method.name}</h5>
                          <p className={`text-xs sm:text-sm ${isWalletInsufficient ? 'text-red-500' : 'text-gray-600'}`}>
                            {isWalletInsufficient ? 'Insufficient balance' : method.description}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 sm:mb-6">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Event Summary</h4>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>Venue: {selectedRestaurant.name}</p>
                <p>Occasion: {formData.occasion}</p>
                <p>Date & Time: {formData.date} at {formData.time}</p>
                <p>Attendees: {formData.customers}</p>
                <p>Contact: {formData.phone}</p>
                <p>Total: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5).toFixed(2)}</p>
                <p className="font-medium text-red-600">
                  Advance: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Razorpay Payment Info */}
            {paymentMethod === 'razorpay' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm sm:text-base">Secure Payment via Razorpay</p>
                    <p className="text-xs sm:text-sm text-blue-700">
                      You'll be redirected to a secure payment gateway where you can pay using Credit/Debit Card, UPI, Net Banking, or other payment methods.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="bg-green-50 p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900 text-sm sm:text-base">Payment via Tabuloo Wallet</p>
                    <p className="text-xs sm:text-sm text-green-700">
                      ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)} will be deducted from your wallet
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center">
                  <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-orange-900 text-sm sm:text-base">Cash on Arrival</p>
                    <p className="text-xs sm:text-sm text-orange-700">
                      Pay ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)} when you arrive for the event
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-base"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 font-medium text-base"
              >
                Pay ₹{(selectedRestaurant.price * parseInt(formData.customers || '0') * 1.5 * 0.2).toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmation' && selectedRestaurant && (
          <div className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Event Booked Successfully!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Your event has been confirmed. Booking details have been sent to both you and the venue via email.
            </p>
            
                         <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
               <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Event Details</h4>
               <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                 <p>Venue: {selectedRestaurant.name}</p>
                 <p>Occasion: {formData.occasion}</p>
                 <p>Date & Time: {formData.date} at {formData.time}</p>
                 <p>Attendees: {formData.customers}</p>
                 <p>Contact: {formData.phone}</p>
                 <p>Advance Paid: ₹{(selectedRestaurant.price * parseInt(formData.customers) * 1.5 * 0.2).toFixed(2)}</p>
                 
                 {/* Customer Details */}
                 <div className="mt-3 pt-3 border-t border-red-200">
                   <p className="font-medium text-red-800">Attendee Details:</p>
                   {formData.customerNames.map((name, index) => {
                     if (name.trim()) {
                       return (
                         <p key={index} className="text-xs">
                           {name} - {formData.customerPhones[index] || 'No phone'}
                         </p>
                       );
                     }
                     return null;
                   })}
                 </div>
               </div>
             </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg hover:from-red-900 hover:to-red-950 font-medium text-base"
            >
              Done
            </button>
          </div>
        )}

        {/* Event Planning Chat */}
        <EventPlanningChat 
          isOpen={showChat} 
          onClose={() => setShowChat(false)} 
        />
      </div>
    </div>
  );
};

export default EventBookingModal;