# Customer Details Feature Implementation

## Overview
This update implements dynamic customer details forms for both event management and table booking based on the number of customers. The system now intelligently requests customer information based on the booking size, ensuring efficient data collection while maintaining user experience.

## Problem Description
Previously, the booking forms had inconsistent customer information collection:
- **Event Management**: Had phone numbers but validation was complex
- **Table Booking**: Only collected names, missing phone numbers
- **No Dynamic Logic**: Forms didn't adapt based on customer count
- **Inconsistent Requirements**: Different validation rules for different scenarios

## Solution Implementation

### 1. **Dynamic Customer Details Collection**
The system now intelligently adapts based on customer count:
- **1 Customer**: Name and phone number required
- **2 Customers**: Both names and phone numbers required
- **3 Customers**: All three names and phone numbers required
- **4+ Customers**: Only first 3 names and phone numbers (first 2 required, 3rd optional)

### 2. **Unified Phone Number Collection**
Both forms now collect phone numbers for customers:
- **Event Management**: Enhanced existing phone collection
- **Table Booking**: Added phone number fields for all customers
- **Validation**: Indian phone number format validation
- **Formatting**: Automatic phone number formatting

### 3. **Smart Form Adaptation**
Forms dynamically adjust based on customer count:
- **Field Generation**: Automatically creates required input fields
- **Validation Rules**: Applies appropriate validation based on count
- **User Guidance**: Clear labels and help text for each scenario

## New Features

### **Dynamic Customer Count Handling**
```typescript
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
```

### **Enhanced Validation Logic**
```typescript
// Validation logic for customer names and phones
if (customerCount === 1) {
  // For 1 person: only first name and phone required
  if (!formData.customerNames[0]?.trim()) {
    toast.error('Please provide the customer name');
    return false;
  }
  if (!formData.customerPhones[0]?.trim()) {
    toast.error('Please provide the customer phone number');
    return false;
  }
  if (!validateIndianPhoneNumber(formData.customerPhones[0])) {
    toast.error('Please enter a valid 10-digit Indian phone number for the customer');
    return false;
  }
} else if (customerCount === 2) {
  // For 2 people: both names and phones required
  if (!formData.customerNames[0]?.trim() || !formData.customerNames[1]?.trim()) {
    toast.error('Please provide names for both customers');
    return false;
  }
  if (!formData.customerPhones[0]?.trim() || !formData.customerPhones[1]?.trim()) {
    toast.error('Please provide phone numbers for both customers');
    return false;
  }
  // Validate phone numbers
  if (!validateIndianPhoneNumber(formData.customerPhones[0]) || !validateIndianPhoneNumber(formData.customerPhones[1])) {
    toast.error('Please enter valid 10-digit Indian phone numbers for both customers');
    return false;
  }
} else if (customerCount === 3) {
  // For 3 people: all names and phones required
  const filledNames = formData.customerNames.filter(name => name.trim() !== '');
  const filledPhones = formData.customerPhones.filter(phone => phone.trim() !== '');
  if (filledNames.length !== customerCount) {
    toast.error('Please provide names for all customers');
    return false;
  }
  if (filledPhones.length !== customerCount) {
    toast.error('Please provide phone numbers for all customers');
    return false;
  }
  // Validate phone numbers
  for (let i = 0; i < customerCount; i++) {
    if (!validateIndianPhoneNumber(formData.customerPhones[i])) {
      toast.error(`Please enter a valid 10-digit Indian phone number for customer ${i + 1}`);
      return false;
    }
  }
} else if (customerCount > 3) {
  // For 4+ people: first 2 names and phones mandatory, 3rd optional (only 3 fields shown)
  if (!formData.customerNames[0]?.trim() || !formData.customerNames[1]?.trim()) {
    toast.error('Please provide names for at least the first two customers');
    return false;
  }
  if (!formData.customerPhones[0]?.trim() || !formData.customerPhones[1]?.trim()) {
    toast.error('Please provide phone numbers for at least the first two customers');
    return false;
  }
  // Validate phone numbers for first 2
  if (!validateIndianPhoneNumber(formData.customerPhones[0]) || !validateIndianPhoneNumber(formData.customerPhones[1])) {
    toast.error('Please enter valid 10-digit Indian phone numbers for the first two customers');
    return false;
  }
  // Note: 3rd name and phone are optional, so no validation needed
}
```

### **Dynamic Form Fields**
```typescript
{formData.customerNames.map((name, index) => {
  const customerCount = parseInt(formData.customers);
  let isRequired = false;
  let placeholder = '';
  
  if (customerCount === 1) {
    isRequired = index === 0;
    placeholder = 'Customer name (required)';
  } else if (customerCount === 2) {
    isRequired = true;
    placeholder = `Customer ${index + 1} name (required)`;
  } else if (customerCount === 3) {
    isRequired = true;
    placeholder = `Customer ${index + 1} name (required)`;
  } else if (customerCount > 3) {
    if (index === 0 || index === 1) {
      isRequired = true;
      placeholder = `Customer ${index + 1} name (required)`;
    } else if (index === 2) {
      isRequired = false;
      placeholder = `Customer ${index + 1} name (optional)`;
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
          placeholder={`Customer ${index + 1} phone number ${isRequired ? '(required)' : '(optional)'}`}
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
```

### **Helpful User Guidance**
```typescript
{/* Help text for events with more than 3 attendees */}
{parseInt(formData.customers) > 3 && (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="text-sm text-blue-800">
      <p className="font-medium">Note:</p>
      <p>For bookings with more than 3 customers, we only need the names and phone numbers of the first 3 people (first 2 required, 3rd optional). This helps us prepare the table and manage the booking efficiently.</p>
    </div>
  </div>
)}
```

## Code Changes Summary

### **BookTableModal Updates**
1. **New State**: Added `customerPhones` array to form data
2. **Enhanced Functions**: Updated `handleCustomerCountChange`, `addCustomerField`, `removeCustomerField`
3. **New Function**: Added `handlePhoneChange` for phone number management
4. **Validation**: Enhanced validation logic to include phone numbers
5. **UI Updates**: Added phone number input fields for each customer
6. **Help Text**: Added guidance for bookings with more than 3 customers
7. **Confirmation**: Display customer phone numbers in booking summary

### **EventBookingModal Updates**
1. **Validation**: Enhanced existing validation logic
2. **Consistency**: Aligned with new customer details requirements
3. **User Experience**: Improved form guidance and validation messages

### **New State Variables**
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  customerPhones: [user?.phone || ''], // New field
  // ... other fields
});
```

### **New Functions**
1. **`handlePhoneChange`**: Manages customer phone number updates
2. **Enhanced Validation**: Comprehensive validation for all customer scenarios

## User Experience Benefits

### **For Users**
- **Clear Requirements**: Know exactly what information is needed
- **Efficient Forms**: Only fill required fields based on group size
- **Phone Validation**: Real-time phone number validation
- **Helpful Guidance**: Clear instructions for each scenario

### **For Business**
- **Better Data Collection**: Complete customer information
- **Efficient Operations**: Know who to contact for each booking
- **Reduced Errors**: Validation prevents incomplete submissions
- **Professional Service**: Better customer management capabilities

### **For Developers**
- **Consistent Logic**: Unified approach across both forms
- **Maintainable Code**: Clear validation rules and state management
- **Scalable Design**: Easy to extend for additional customer types
- **Type Safety**: Proper TypeScript interfaces and validation

## Technical Implementation

### **State Management**
- **Dynamic Arrays**: Customer names and phones arrays that adapt to count
- **Synchronized Updates**: Names and phones stay in sync when adding/removing
- **Validation State**: Real-time validation feedback for users

### **Form Validation**
- **Conditional Logic**: Different validation rules based on customer count
- **Phone Validation**: Indian phone number format validation
- **Required Fields**: Dynamic required field determination
- **Error Messages**: Clear, specific error messages for each scenario

### **User Interface**
- **Dynamic Fields**: Form fields that appear/disappear based on count
- **Smart Labels**: Context-aware placeholders and labels
- **Visual Feedback**: Clear indication of required vs optional fields
- **Help Text**: Contextual guidance for complex scenarios

## User Workflow

### **Single Customer Booking**
1. Select customer count: 1
2. Fill in customer name (required)
3. Fill in customer phone number (required)
4. Complete other booking details
5. Submit with validation

### **Multiple Customer Booking (2-3)**
1. Select customer count: 2 or 3
2. Fill in all customer names (required)
3. Fill in all customer phone numbers (required)
4. Complete other booking details
5. Submit with comprehensive validation

### **Large Group Booking (4+)**
1. Select customer count: 4 or more
2. Fill in first 2 customer names (required)
3. Fill in first 2 customer phone numbers (required)
4. Optionally fill in 3rd customer details
5. Complete other booking details
6. Submit with appropriate validation

## Validation Rules

### **Customer Count: 1**
- **Name**: Required
- **Phone**: Required, must be valid Indian format

### **Customer Count: 2**
- **Names**: Both required
- **Phones**: Both required, must be valid Indian format

### **Customer Count: 3**
- **Names**: All three required
- **Phones**: All three required, must be valid Indian format

### **Customer Count: 4+**
- **Names**: First 2 required, 3rd optional (only 3 fields shown)
- **Phones**: First 2 required, 3rd optional (only 3 fields shown)

## Error Handling

### **Validation Errors**
- **Missing Names**: Clear error messages for required names
- **Missing Phones**: Clear error messages for required phone numbers
- **Invalid Phones**: Real-time validation with helpful error messages
- **Count Mismatch**: Validation ensures data consistency

### **User Feedback**
- **Real-time Validation**: Immediate feedback on input errors
- **Clear Messages**: Specific error messages for each validation failure
- **Visual Indicators**: Required fields clearly marked
- **Help Text**: Contextual guidance for complex scenarios

## Future Enhancements

### **Planned Features**
- **Customer Profiles**: Save frequently used customer information
- **Bulk Import**: Import customer lists from external sources
- **Contact Preferences**: Preferred contact method for each customer
- **Special Requirements**: Dietary restrictions, accessibility needs

### **Advanced Features**
- **Customer History**: Track booking history for repeat customers
- **Loyalty Program**: Customer rewards and special offers
- **Communication Tools**: Automated notifications and reminders
- **Analytics**: Customer behavior and preference analysis

## Testing Considerations

### **Functionality Tests**
1. **Single Customer**: Verify name and phone validation
2. **Multiple Customers**: Test 2-3 customer scenarios
3. **Large Groups**: Validate 4+ customer logic
4. **Field Management**: Test add/remove customer functionality
5. **Validation**: Verify all validation rules work correctly

### **User Experience Tests**
1. **Form Adaptation**: Test dynamic field generation
2. **Validation Feedback**: Verify error messages are clear
3. **Phone Formatting**: Test automatic phone number formatting
4. **Help Text**: Verify guidance appears for appropriate scenarios
5. **Confirmation**: Test booking summary displays correctly

### **Edge Cases**
1. **Rapid Changes**: Test customer count changes during form filling
2. **Partial Data**: Test validation with incomplete information
3. **Phone Formats**: Test various phone number input formats
4. **Large Numbers**: Test with maximum customer counts
5. **Data Persistence**: Test form state during navigation

## Dependencies

### **Required Components**
- **BookTableModal**: Table booking interface
- **EventBookingModal**: Event management interface
- **Validation Utils**: Phone number and format validation
- **State Management**: React state for form data

### **External Dependencies**
- **Phone Validation**: Indian phone number format validation
- **Format Utils**: Phone number formatting utilities
- **Toast Notifications**: User feedback system

## Conclusion

The customer details feature significantly improves both event management and table booking by:

1. **Providing Dynamic Forms**: Adapts to different group sizes automatically
2. **Ensuring Complete Data**: Collects necessary information for all scenarios
3. **Maintaining User Experience**: Clear guidance and validation throughout
4. **Improving Business Operations**: Better customer management capabilities
5. **Ensuring Data Quality**: Comprehensive validation prevents incomplete submissions

This implementation creates a professional and efficient booking experience that scales from individual customers to large groups while maintaining data quality and user satisfaction.
