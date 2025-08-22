import React, { useState } from 'react';
import { Lock, Car, Wrench, Edit3, Plus, Trash2 } from 'lucide-react';
import { FaRegAddressCard } from "react-icons/fa";
import { createJobCards } from './Services';
import { FONTS } from '../../constants/constants';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/partnerSocket';
import { FaXmark } from "react-icons/fa6";
import { FaBusinessTime } from "react-icons/fa";

interface VehicleInventory {
  jackAndTommy: boolean;
  mirrors: boolean;
  stepney: boolean;
  mudFlaps: boolean;
  toolKit: boolean;
  freshner: boolean;
  keyChain: boolean;
  mats: boolean;
  tapeRecorder: boolean;
  cdPlayer: boolean;
  serviceBooklet: boolean;
  battery: boolean;
  bodyDamages: boolean;
  wheelCovers: boolean;
  others: boolean;
  othersDescription: string;
  images: {
    [key: string]: File[];
  };
}

interface ServiceItem {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
}

interface servicesmain {
  id: string;
  descriptions: string;
  rates: string;
  amounts: string;
}

interface FormData {
  inventory: VehicleInventory;
  fuelLevel: 'Empty' | '1/4' | '1/2' | '3/4' | 'Full';
  fuelLevelImages: File[];
  registrationNo: string;
  model: string;
  engineNo: string;
  mileage: string;
  color: string;
  chassisNo: string;
  insuranceCompany: string;
  insuranceRenewalDate: string;
  customerComplaint: string;
  actionToBeTaken: string;
  workDone: 'pending' | 'in-progress' | 'completed';
  serviceItems: ServiceItem[];
  servicesmain: servicesmain[];
  productTotalAmount: string;
  serviceTotalAmount: string;
  totalAmount: string;
  name: string;
  address: string;
  officeaddress: string;
  contactno: string;
  email: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  contactno?: string;
  email?: string;
  registrationNo?: string;
  model?: string;
  engineNo?: string;
  mileage?: string;
  color?: string;
  chassisNo?: string;
  insuranceCompany?: string;
  insuranceRenewalDate?: string;
  // customerComplaint?: string;
  actionToBeTaken?: string;
  serviceItems?: {
    id: string;
    description?: string;
    quantity?: string;
    rate?: string;
  }[];
  servicesmain?: {
    id: string;
    descriptions?: string;
    rates?: string;
  }[];
  general?: string;
  [key: string]: any;
}

interface InventoryItem {
  key: keyof Omit<VehicleInventory, 'images'>;
  label: string;
  isSpecial?: boolean;
}

interface JobCardDetailsPageProps {
  handleBack: () => void;
  request: any;
}

const JobCardDetailsPage: React.FC<JobCardDetailsPageProps> = ({
  handleBack, request
}) => {
  const socket = useSocket();
  const apiData = {
    jobId: request?.requestId || 'N/A',
    customerName: request?.customerId?.firstName + ' ' + request?.customerId?.lastName || 'N/A',
    contact: request?.customerId?.contact_info?.phoneNumber || 'N/A',
    vehicleModel: request?.customerId?.vehicleInfo[0]?.model + "-" + request?.customerId?.vehicleInfo[0]?.year  || 'N/A',
    complaint : request?.service.map((item: any) => item.service_name),
    vehicle: request?.customerId?.vehicleInfo[0]?.registerNumber || 'N/A',
    schedule: request?.assigned_date?.split("T")[0] || 'N/A',
    time: request?.assigned_date?.split("T")[1]?.split('.')[0] || 'N/A',
    priority: request?.priority || 'N/A',
  };

  const [formData, setFormData] = useState<FormData>({
    inventory: {
      jackAndTommy: false,
      mirrors: false,
      stepney: false,
      mudFlaps: false,
      toolKit: false,
      freshner: false,
      keyChain: false,
      mats: false,
      tapeRecorder: false,
      cdPlayer: false,
      serviceBooklet: false,
      battery: false,
      bodyDamages: false,
      wheelCovers: false,
      others: false,
      othersDescription: '',
      images: {}
    },
    fuelLevel: 'Empty',
    fuelLevelImages: [],
    name: '',
    address: '',
    officeaddress: '',
    contactno: '',
    email: '',
    registrationNo: '',
    model: '',
    engineNo: '',
    mileage: '',
    color: '',
    chassisNo: '',
    insuranceCompany: '',
    insuranceRenewalDate: '',
    customerComplaint: request?.serviceInfo?.customerComplaint,
    actionToBeTaken: '',
    workDone: 'pending',
    serviceItems: [
      { id: '1', description: '', quantity: '', rate: '', amount: '' }
    ],
    servicesmain: [
      { id: '1', descriptions: '', rates: '', amounts: '' }
    ],
    productTotalAmount: '0',
    serviceTotalAmount: '0',
    totalAmount: '0',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const validateField = (field: string, value: string): string | undefined => {
    if (!value.trim()) return `${field} is required`;
    
    switch (field) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        break;
      case 'contactno':
        if (!/^\d{10}$/.test(value)) return 'Phone number must be 10 digits';
        break;
      case 'mileage':
        if (!/^\d+$/.test(value)) return 'Mileage must be a number';
        break;
      case 'insuranceRenewalDate':
        if (new Date(value) < new Date()) return 'Insurance date cannot be in the past';
        break;
    }
    return undefined;
  };

  const validateServiceItems = (items: ServiceItem[]) => {
    const itemErrors: {id: string, description?: string, quantity?: string, rate?: string}[] = [];
    let hasErrors = false;

    items.forEach(item => {
      const itemError: {id: string, description?: string, quantity?: string, rate?: string} = { id: item.id };
      
      if (!item.description.trim()) {
        itemError.description = 'Description is required';
        hasErrors = true;
      }
      if (!item.quantity.trim() || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        itemError.quantity = 'Valid quantity is required';
        hasErrors = true;
      }
      if (!item.rate.trim() || isNaN(Number(item.rate)) || Number(item.rate) <= 0) {
        itemError.rate = 'Valid rate is required';
        hasErrors = true;
      }

      itemErrors.push(itemError);
    });

    return hasErrors ? itemErrors : undefined;
  };

  const validateServiceMainItems = (items: servicesmain[]) => {
    const itemErrors: {id: string, descriptions?: string, rates?: string}[] = [];
    let hasErrors = false;

    items.forEach(item => {
      const itemError: {id: string, descriptions?: string, rates?: string} = { id: item.id };
      
      if (!item.descriptions.trim()) {
        itemError.descriptions = 'Description is required';
        hasErrors = true;
      }
      if (!item.rates.trim() || isNaN(Number(item.rates)) || Number(item.rates) <= 0) {
        itemError.rates = 'Valid rate is required';
        hasErrors = true;
      }

      itemErrors.push(itemError);
    });

    return hasErrors ? itemErrors : undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Customer Info Validation
    const requiredCustomerFields: (keyof FormData)[] = ['name', 'address', 'contactno', 'email'];
    requiredCustomerFields.forEach(field => {
      const error = validateField(field, formData[field] as string);
      if (error) {
        newErrors[field as string] = error;
        isValid = false;
      }
    });

    // Vehicle Info Validation
    const requiredVehicleFields: (keyof FormData)[] = [
      'registrationNo', 'model', 'engineNo', 'mileage', 
      'color', 'chassisNo', 'insuranceCompany', 'insuranceRenewalDate'
    ];
    requiredVehicleFields.forEach(field => {
      const error = validateField(field, formData[field] as string);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Service Info Validation
    // if (!formData.customerComplaint.trim()) {
    //   newErrors.customerComplaint = 'Customer complaint is required';
    //   isValid = false;
    // }
    if (!formData.actionToBeTaken.trim()) {
      newErrors.actionToBeTaken = 'Action to be taken is required';
      isValid = false;
    }

    // Service Items Validation
    const serviceItemErrors = validateServiceItems(formData.serviceItems);
    if (serviceItemErrors) {
      newErrors.serviceItems = serviceItemErrors;
      isValid = false;
    }

    // Services Main Validation
    const serviceMainErrors = validateServiceMainItems(formData.servicesmain);
    if (serviceMainErrors) {
      newErrors.servicesmain = serviceMainErrors;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleInventoryChange = (key: keyof Omit<VehicleInventory, 'images'>) => {
  setFormData(prev => ({
    ...prev,
    inventory: {
      ...prev.inventory,
      [key]: !prev.inventory[key],
      ...(key === 'others' && !prev.inventory[key] ? { othersDescription: '' } : {}),
      images: {
        ...prev.inventory.images,
        ...(prev.inventory[key] ? { [key]: [] } : {})
      }
    }
  }));
};

  const handleImageUpload = (key: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          images: {
            ...prev.inventory.images,
            [key]: [...(prev.inventory.images[key] || []), ...fileArray]
          }
        }
      }));
    }
  };

  const removeImage = (key: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        images: {
          ...prev.inventory.images,
          [key]: prev.inventory.images[key]?.filter((_, i) => i !== index) || []
        }
      }
    }));
  };

  const handleFuelLevelImageUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        fuelLevelImages: [...prev.fuelLevelImages, ...fileArray]
      }));
    }
  };

  const removeFuelLevelImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fuelLevelImages: prev.fuelLevelImages.filter((_, i) => i !== index)
    }));
  };

  const addServiceItem = (): void => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: '',
      rate: '',
      amount: ''
    };
    setFormData(prev => ({
      ...prev,
      serviceItems: [...prev.serviceItems, newItem]
    }));
  };

  const removeServiceItem = (id: string): void => {
    if (formData.serviceItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        serviceItems: prev.serviceItems.filter(item => item.id !== id)
      }));
      calculateTotalAmount();
      
      // Clear any errors for this item
      if (errors.serviceItems) {
        setErrors(prev => ({
          ...prev,
          serviceItems: prev.serviceItems?.filter(item => item.id !== id)
        }));
      }
    }
  };

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: string): void => {
    setFormData(prev => {
      const updatedItems = prev.serviceItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === 'quantity' || field === 'rate') {
            const quantity = parseFloat(field === 'quantity' ? value : updatedItem.quantity) || 0;
            const rate = parseFloat(field === 'rate' ? value : updatedItem.rate) || 0;
            updatedItem.amount = (quantity * rate).toFixed(2);
          }
          return updatedItem;
        }
        return item;
      });

      const newFormData = {
        ...prev,
        serviceItems: updatedItems
      };

      setTimeout(calculateTotalAmount, 0);
      
      // Clear error for this field if it exists
      if (errors.serviceItems) {
        const itemIndex = errors.serviceItems.findIndex(item => item.id === id);
        if (
          itemIndex !== -1 &&
          ['description', 'quantity', 'rate'].includes(field) &&
          errors.serviceItems[itemIndex][field as 'description' | 'quantity' | 'rate']
        ) {
          const updatedErrors = [...errors.serviceItems];
          updatedErrors[itemIndex] = { ...updatedErrors[itemIndex], [field]: undefined };
          setErrors(prev => ({
            ...prev,
            serviceItems: updatedErrors
          }));
        }
      }

      return newFormData;
    });
  };

  const calculateTotalAmount = (): void => {
    setFormData(prev => {
      const productTotal = prev.serviceItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      const serviceTotal = prev.servicesmain.reduce(
        (sum, item) => sum + (parseFloat(item.amounts) || 0),
        0
      );

      const total = productTotal + serviceTotal;

      return {
        ...prev,
        productTotalAmount: productTotal.toFixed(2),
        serviceTotalAmount: serviceTotal.toFixed(2),
        totalAmount: total.toFixed(2)
      };
    });
  };

  const addServices = (): void => {
    const newItems: servicesmain = {
      id: Date.now().toString(),
      descriptions: '',
      rates: '',
      amounts: ''
    };
    setFormData(prev => ({
      ...prev,
      servicesmain: [...prev.servicesmain, newItems]
    }));
  };

  const removeServiceItems = (id: string): void => {
    if (formData.servicesmain.length > 1) {
      setFormData(prev => {
        const updatedItems = prev.servicesmain.filter(items => items.id !== id);
        return {
          ...prev,
          servicesmain: updatedItems
        };
      });
      calculateTotalAmount();
      
      // Clear any errors for this item
      if (errors.servicesmain) {
        setErrors(prev => ({
          ...prev,
          servicesmain: prev.servicesmain?.filter(item => item.id !== id)
        }));
      }
    }
  };

  const updateServiceItems = (id: string, field: keyof servicesmain, value: string): void => {
    setFormData(prev => {
      const updatedItems = prev.servicesmain.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === 'rates') {
            const rate = parseFloat(value) || 0;
            updatedItem.amounts = rate.toFixed(2);
          }

          return updatedItem;
        }
        return item;
      });

      const newFormData = {
        ...prev,
        servicesmain: updatedItems
      };

      setTimeout(calculateTotalAmount, 0);
      
      // Clear error for this field if it exists
      if (errors.servicesmain) {
        const itemIndex = errors.servicesmain.findIndex(item => item.id === id);
        if (
          itemIndex !== -1 &&
          (field === 'descriptions' || field === 'rates') &&
          errors.servicesmain[itemIndex][field as 'descriptions' | 'rates']
        ) {
          const updatedErrors = [...errors.servicesmain];
          updatedErrors[itemIndex] = { ...updatedErrors[itemIndex], [field]: undefined };
          setErrors(prev => ({
            ...prev,
            servicesmain: updatedErrors
          }));
        }
      }

      return newFormData;
    });
  };

  const handleFuelLevelChange = (level: 'Empty' | '1/4' | '1/2' | '3/4' | 'Full'): void => {
    setFormData(prev => ({
      ...prev,
      fuelLevel: level
    }));
  };

  const handleSave = async (): Promise<void> => {
      if (!validateForm()) {
    // Collect all error messages
    const errorMessages = [];
    
    // Customer Info errors
    if (errors.name) errorMessages.push(`Customer Name: ${errors.name}`);
    if (errors.address) errorMessages.push(`Address: ${errors.address}`);
    if (errors.contactno) errorMessages.push(`Contact No: ${errors.contactno}`);
    if (errors.email) errorMessages.push(`Email: ${errors.email}`);
    
    // Vehicle Info errors
    if (errors.registrationNo) errorMessages.push(`Registration No: ${errors.registrationNo}`);
    if (errors.model) errorMessages.push(`Model: ${errors.model}`);
    if (errors.engineNo) errorMessages.push(`Engine No: ${errors.engineNo}`);
    if (errors.mileage) errorMessages.push(`Mileage: ${errors.mileage}`);
    if (errors.color) errorMessages.push(`Color: ${errors.color}`);
    if (errors.chassisNo) errorMessages.push(`Chassis No: ${errors.chassisNo}`);
    if (errors.insuranceCompany) errorMessages.push(`Insurance Company: ${errors.insuranceCompany}`);
    if (errors.insuranceRenewalDate) errorMessages.push(`Insurance Renewal Date: ${errors.insuranceRenewalDate}`);
    
    // Service Info errors
    if (errors.actionToBeTaken) errorMessages.push(`Action To Be Taken: ${errors.actionToBeTaken}`);
    
    // Service Items errors
    if (errors.serviceItems) {
      errors.serviceItems.forEach((item, index) => {
        if (item.description) errorMessages.push(`Service Item ${index + 1}: Description required`);
        if (item.quantity) errorMessages.push(`Service Item ${index + 1}: Valid quantity required`);
        if (item.rate) errorMessages.push(`Service Item ${index + 1}: Valid rate required`);
      });
    }
    
    // Services Main errors
    if (errors.servicesmain) {
      errors.servicesmain.forEach((item, index) => {
        if (item.descriptions) errorMessages.push(`Service ${index + 1}: Description required`);
        if (item.rates) errorMessages.push(`Service ${index + 1}: Valid rate required`);
      });
    }
    
    // Show error messages based on count
    if (errorMessages.length <= 5) {
      // Show specific errors if 5 or fewer
      toast.error(
        <div>
          <div className="font-bold mb-2">Please check all the fields</div>
          <ul className="list-disc pl-5">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>,
        { duration: 5000 }
      );
    } else {
      // Show generic message if more than 5 errors
      toast.error(
        <div>
          <div className="font-bold">Please check all form fields</div>
          <div>{errorMessages.length} fields need to be fill</div>
        </div>,
        { duration: 2000 }
      );
    }
    return;
  }

    try {
      const payload = {
        serviceRequestId: request._id,
        customerId:request?.customerId ?? request?.customerId?._id,
        jobInfo: {
          customerName: formData.name,
          ContactNo: formData.contactno,
          jobId: apiData.jobId,
          VehicleNo: formData.registrationNo,
          Schedule: apiData.schedule,
        },
        customerInfo: {
          name: formData.name,
          address: formData.address,
          officeAddress: formData.officeaddress,
          contactNo: formData.contactno,
          email: formData.email,
        },
        vehicleInfo: {
          registrationNo: formData.registrationNo,
          model: formData.model,
          engineNo: formData.engineNo,
          mileage: formData.mileage,
          color: formData.color,
          chassisNo: formData.chassisNo,
          insuranceCompany: formData.insuranceCompany,
          insuranceRenewalDate: formData.insuranceRenewalDate,
        },
        serviceInfo: {
          customerComplaint: formData.customerComplaint,
          actionToBeTaken: formData.actionToBeTaken,
          products: formData.serviceItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            productAmount: parseFloat(item.amount)
          })),
          services: formData.servicesmain.map(item => ({
            description: item.descriptions,
            rate: item.rates,
            serviceAmount: parseFloat(item.amounts)
          })),
          productTotalAmount: parseFloat(formData.productTotalAmount),
          serviceTotalAmount: parseFloat(formData.serviceTotalAmount),
          totalAmount: parseFloat(formData.totalAmount),
        },
    //     vehicleInventory: {
    // currentState: {
    //   ...formData.inventory,
    //   othersDescription: formData.inventory.others ? formData.inventory.othersDescription : ''
    // },
    //       fuelLevel: formData.fuelLevel,
    //       fuelLevelImages: formData.fuelLevelImages,
    //       items: Object.entries(formData.inventory)
    //         .filter(([key, value]) => key !== 'images' && value === true)
    //         .map(([key]) => key),
    //     },
      };

      const response: any = await createJobCards(payload);
      if (response?.data) {
        const partnerNotification = {
          title: "Your Service has Started",
          message: `Your vehicle service (Job ID: ${request?.requestId}) has started. Our team is now working on it. You will be notified upon completion.`,
          type: "jobCard",
          priority: "medium",
          recipient_type: "customer",
          recipient_id: request?.customerId?._id,
          is_read: false,
          is_active: true,
          is_sent: false,
          created_at: new Date().toISOString(),
        };

        if (socket) {
          socket.emit("newNotification", partnerNotification);
        }

        toast.success("Job Card Created Successfully!");
        setTimeout(() => handleBack(), 0);
      } else {
        handleBack();
      }
    } catch (err) {
      console.error("Failed to create job card:", err);
      toast.error("Failed to create job card. Please try again.");
    }
  };

  const inventoryItems: InventoryItem[] = [
    { key: 'jackAndTommy', label: 'JACK & TOMMY' },
    { key: 'mirrors', label: 'MIRRORS' },
    { key: 'stepney', label: 'STEPNEY' },
    { key: 'mudFlaps', label: 'MUD FLAPS' },
    { key: 'toolKit', label: 'TOOL KIT' },
    { key: 'freshner', label: 'FRESHNER' },
    { key: 'keyChain', label: 'KEY CHAIN' },
    { key: 'mats', label: 'MATS' },
    { key: 'tapeRecorder', label: 'TAPE RECORDER' },
    { key: 'cdPlayer', label: 'CD PLAYER' },
    { key: 'serviceBooklet', label: 'SERVICE BOOKLET' },
    { key: 'battery', label: 'BATTERY' },
    { key: 'bodyDamages', label: 'BODY DAMAGES' },
    { key: 'wheelCovers', label: 'WHEEL COVERS' },
    { key: 'others', label: 'OTHERS', isSpecial: true }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-2">
      <div className="mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="bg-clip-text text-transparent mb-2" style={{ ...FONTS.header }}>
            Job Card Details
          </h1>
          <div className="w-24 h-1 bg-[#7812A4] mx-auto rounded-full"></div>
          <div
            onClick={handleBack}
            className="absolute top-3 right-5 cursor-pointer rounded border border-[#7812A4] p-1 bg-[#7812A4]"
          >
            <FaXmark className="text-white text-2xl " />
          </div>
        </div>

        <div className="space-y-8">
          {/* Job Information Section - Read Only */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 !text-white">
                <Lock className="w-5 h-5" />
                <h2 className="text-lg !text-white font-semibold" style={{ ...FONTS.cardSubHeader }}>Job Information (Read Only)</h2>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Req ID</label>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600 font-mono" style={{ ...FONTS.subParagraph }}>
                    {apiData.jobId}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Customer Name</label>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600" style={{ ...FONTS.subParagraph }}>
                    {apiData.customerName}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Contact No</label>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600" style={{ ...FONTS.subParagraph }}>
                    {apiData.contact}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Model & Year</label>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600 font-mono" style={{ ...FONTS.subParagraph }}>
                    {apiData.vehicleModel}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Vehicle No</label>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600 font-mono" style={{ ...FONTS.subParagraph }}>
                    {apiData.vehicle}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Schedule</label>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600" style={{ ...FONTS.subParagraph }}>
                    {apiData.schedule}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 !text-white">
                <FaRegAddressCard />
                <h2 className="text-lg !text-white font-semibold" style={{ ...FONTS.cardSubHeader }}>Customer Information</h2>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full p-3 border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all`}
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Customer name"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Address 1</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full p-3 border-2 ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all`}
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Address"
                  />
                  {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Address 2</label>
                  <input
                    type="text"
                    value={formData.officeaddress}
                    onChange={(e) => handleInputChange('officeaddress', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Address 2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Contact No</label>
                  <input
                    type="text"
                    value={formData.contactno}
                    onChange={(e) => handleInputChange('contactno', e.target.value)}
                    className={`w-full p-3 border-2 ${errors.contactno ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all`}
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Contact No"
                  />
                  {errors.contactno && <p className="text-red-500 text-xs">{errors.contactno}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Email</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full p-3 border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all`}
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Email"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Inventory Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 text-white">
                <Car className="w-5 h-5" />
                <h2 className="text-lg !text-white font-semibold" style={{ ...FONTS.cardSubHeader }}>Vehicle Inventory</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
                {inventoryItems.map((item) => (
  <React.Fragment key={item.key}>
    <div className="flex flex-col">
      {/* First row - Checkbox label and optional input */}
      <div className="flex items-center gap-2">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={!!formData.inventory[item.key]}
            onChange={() => handleInventoryChange(item.key)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-sm font-semibold !text-gray-700 group-hover:text-[#9b111e]" style={{ ...FONTS.subParagraph }}>
            {item.label}
          </span>
        </label>

        {/* Special input for OTHERS */}
        {item.key === 'others' && formData.inventory.others && (
          <input
            type="text"
            value={formData.inventory.othersDescription}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              inventory: {
                ...prev.inventory,
                othersDescription: e.target.value
              }
            }))}
            className="flex-1 max-w-xs p-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
            placeholder="Specify other items"
          />
        )}
      </div>

      {/* Second row - File upload (shown when checked) */}
      {formData.inventory[item.key] && item.key !== 'others' && (
        <div className="flex items-center gap-2 mt-1 ml-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(item.key, e.target.files)}
            className="text-xs file:text-black file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-white file:hover:text-white file:hover:bg-gradient-to-r file:hover:from-red-600 file:hover:to-red-800"
            style={{ ...FONTS.subParagraph }}
          />
        </div>
      )}

      {/* Image previews (shown when images exist) */}
      {formData.inventory.images[item.key]?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 ml-6">
          {formData.inventory.images[item.key].map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`${item.label} ${index + 1}`}
                className="w-16 h-16 object-cover rounded border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(item.key, index)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </React.Fragment>
))}
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium !text-gray-700 mb-2" style={{ ...FONTS.paragraph }}>Fuel Level</label>
                <div className="space-y-6">
                  <select
                    value={formData.fuelLevel}
                    onChange={(e) => handleFuelLevelChange(e.target.value as FormData['fuelLevel'])}
                    className="w-full md:w-48 p-3 border-2 border-gray-300 rounded-full !text-black transition-all"
                    style={{ ...FONTS.subParagraph }}
                  >
                    <option value="Empty">Empty</option>
                    <option value="1/4">1/4</option>
                    <option value="1/2">1/2</option>
                    <option value="3/4">3/4</option>
                    <option value="Full">Full</option>
                  </select>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Upload Fuel Level Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFuelLevelImageUpload(e.target.files)}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:hover:text-white file:hover:bg-[#7812A4]"
                    />

                    {formData.fuelLevelImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.fuelLevelImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Fuel Level ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFuelLevelImage(index)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Vehicle Information Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 text-white">
                <Edit3 className="w-5 h-5" />
                <h2 className="text-lg !text-white font-semibold" style={{ ...FONTS.cardSubHeader }}>Vehicle Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Registration No</label>
                  <input
                    type="text"
                    value={formData.registrationNo}
                    onChange={(e) => handleInputChange('registrationNo', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter registration number"
                  />
                  {errors.registrationNo && <p className="text-red-500 text-xs">{errors.registrationNo}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter vehicle model"
                  />
                {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Engine No</label>
                  <input
                    type="text"
                    value={formData.engineNo}
                    onChange={(e) => handleInputChange('engineNo', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter engine number"
                  />
                  {errors.engineNo && <p className="text-red-500 text-xs">{errors.engineNo}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Mileage</label>
                  <input
                    type="text"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter mileage"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter vehicle color"
                  />
                  {errors.color && <p className="text-red-500 text-xs">{errors.color}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Chassis No</label>
                  <input
                    type="text"
                    value={formData.chassisNo}
                    onChange={(e) => handleInputChange('chassisNo', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter chassis number"
                  />
                  {errors.chassisNo && <p className="text-red-500 text-xs">{errors.chassisNo}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Insurance Company</label>
                  <input
                    required
                    type="text"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                    placeholder="Enter insurance company"
                  />
                  {errors.insuranceCompany && <p className="text-red-500 text-xs">{errors.insuranceCompany}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Insurance Renewal Date</label>
                  <input
                  required
                    type="date"
                    value={formData.insuranceRenewalDate}
                    onChange={(e) => handleInputChange('insuranceRenewalDate', e.target.value)}
                    className="w-full p-3 border-2 !text-gray-400 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" style={{ ...FONTS.subParagraph }}
                  />
                  {errors.insuranceRenewalDate && <p className="text-red-500 text-xs">{errors.insuranceRenewalDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Service Information Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 text-white">
                <Wrench className="w-5 h-5" />
                <h2 className="text-lg !text-white font-semibold" style={{ ...FONTS.cardSubHeader }}>Service Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Customer Complaint</label>
                <textarea
                  value={apiData.complaint.join(', ')}
                  onChange={(e) => handleInputChange('customerComplaint', e.target.value)}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none" style={{ ...FONTS.subParagraph }}
                  placeholder="Describe the customer's complaint..."
                />
                {/* {errors.customerComplaint && <p className="text-red-500 text-xs">{errors.customerComplaint}</p>} */}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Action to be Taken</label>
                <textarea
                  value={formData.actionToBeTaken}
                  onChange={(e) => handleInputChange('actionToBeTaken', e.target.value)}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none" style={{ ...FONTS.subParagraph }}
                  placeholder="Describe the action to be taken..."
                />
                {errors.actionToBeTaken && <p className="text-red-500 text-xs">{errors.actionToBeTaken}</p>}
              </div>
            </div>
            </div>

               {/* Dynamic Service Items */}
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 text-white">
                <FaBusinessTime className="w-5 h-5" />
                <h2 className="text-lg !text-white font-semibold" style={{ ...FONTS.cardSubHeader }}>Estimation</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Spare </label>
                  <button
                    type="button"
                    onClick={addServiceItem}
                    className="bg-[#7812A4] !text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2" style={{ ...FONTS.paragraph }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.serviceItems.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium !text-gray-700" style={{ ...FONTS.subParagraph }}>Item #{index + 1}</span>
                        {formData.serviceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-all" style={{ ...FONTS.subParagraph }}
                          >

                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium !text-gray-600 mb-1" style={{ ...FONTS.paragraph }}>Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateServiceItem(item.id, 'description', e.target.value)}
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" style={{ ...FONTS.subParagraph }}
                            placeholder="Spare description"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium !text-gray-600 mb-1" style={{ ...FONTS.paragraph }}>Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateServiceItem(item.id, 'quantity', e.target.value)}
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" style={{ ...FONTS.subParagraph }}
                            placeholder="Qty"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium !text-gray-600 mb-1" style={{ ...FONTS.paragraph }}>
                            Rate <span className="!font-sans" >(&#8377;)</span> 
                          </label> <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateServiceItem(item.id, 'rate', e.target.value)}
                            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" style={{ ...FONTS.subParagraph }}
                            placeholder="Rate"
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <span className="text-sm font-medium !text-gray-600" style={{ ...FONTS.paragraph }}>Amount: </span>
                        <span className="text-lg !font-bold text-[#9b111e]" style={{ ...FONTS.paragraph }}><span className="!font-sans" >&#8377;</span> {item.amount || '0.00'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                  </div>
              </div>

              {/* Service Items Section */}
              <div className="p-6 space-y-6">
              <div className="space-y-4">
                {/* Header and Add Button */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium !text-gray-700" style={{ ...FONTS.paragraph }}>Service</label>
                  <button
                    type="button"
                    onClick={addServices}
                    className="bg-[#7812A4] !text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2" style={{ ...FONTS.paragraph }}
                  >
                    <Plus className="w-4 h-4" />
                    Add services
                  </button>
                </div>

                {/* List of Service Inputs */}
                <div className="space-y-3">
                  {formData.servicesmain.map((items, index) => (
                    <div
                      key={items.id}
                      className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                    >
                      {/* Header with Item Number and Remove Button */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium !text-gray-700" style={{ ...FONTS.subParagraph }}>
                          Item {index + 1}
                        </span>
                        {formData.servicesmain.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceItems(items.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium !text-gray-600 mb-1" style={{ ...FONTS.paragraph }}>
                            Description
                          </label>
                          <input
                            type="text"
                            value={items.descriptions}
                            onChange={(e) =>
                              updateServiceItems(items.id, "descriptions", e.target.value)
                            }
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" style={{ ...FONTS.subParagraph }}
                            placeholder="Service description"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium !text-gray-600 mb-1 ml-50" style={{ ...FONTS.paragraph }}>
                            Rate <span className="!font-sans" >(&#8377;)</span> 
                          </label>
                          <input
                            type="number"
                            value={items.rates}
                            onChange={(e) =>
                              updateServiceItems(items.id, "rates", e.target.value)
                            }
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all" style={{ ...FONTS.subParagraph }}
                            placeholder="Rate"
                          />
                        </div>
                      </div>

                      {/* Calculated Amount */}
                      <div className="mt-3 text-right">
                        <span className="text-sm font-medium !text-gray-600" style={{ ...FONTS.paragraph }}>Amount: </span>
                        <span className="text-lg !font-bold " style={{ ...FONTS.paragraph }}>
                          <span className="!font-sans" >&#8377;</span> {items.amounts || "0.00"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount Summary */}
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold " style={{ ...FONTS.paragraph }}>
                      Total Amount:
                    </span>
                    <span className="text-2xl !font-bold " style={{ ...FONTS.paragraph }}>
                      <span className="!font-sans" >&#8377;</span> {formData.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
              </div>
              </div>
          

          {/* Action Button */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#7812A4] !text-white px-4 h-[40px]  rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 " style={{ ...FONTS.paragraph }}
            >
              {/* <Save className="w-5 h-5" /> */}
              Save
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="bg-[#7812A4] !text-white px-4 h-[40px] rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2" style={{ ...FONTS.paragraph }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCardDetailsPage;