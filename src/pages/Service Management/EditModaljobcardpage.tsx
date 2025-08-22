import React from "react";
import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Car,
  Wrench,
  Lock,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import { FaRegAddressCard } from "react-icons/fa";
import { updateJobCards } from "./Services/index";
import toast from "react-hot-toast";

// FONTS constant - replace with your actual FONTS import
const FONTS = {
  header: { fontSize: "24px", fontWeight: "bold" },
  cardSubHeader: { fontSize: "16px", fontWeight: "600" },
  paragraph: { fontSize: "14px" },
  subParagraph: { fontSize: "12px" },
  cardheader: { fontSize: "20px", fontWeight: "bold" },
  tableHeader: { fontSize: "14px", fontWeight: "600" },
};

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

interface ServiceMain {
  id: string;
  descriptions: string;
  rates: string;
  amounts: string;
}

interface JobCardData {
  _id: string;
  cutomerInfo?: any;
  customerName?: string;
  phone?: string;
  jobNumber?: string;
  isEditing?: boolean;
  customerInfo: {
    officeAddress: string;
    email: string;
    name: string;
    address: string;
    contactNo: string;
  };
  jobInfo: {
    ContactNo: string;
    VehicleNo: string;
    jobId: string;
    customerName: string;
  };
  vehicleInfo: {
    insuranceRenewalDate: string;
    mileage: string;
    chassisNo: string;
    color: string;
    engineNo: string;
    insuranceCompany: string;
    model: string;
    registrationNo: string;
  };
  vehicleInventory: {
    fuelLevel: string;
    currentState?: VehicleInventory;
    items?: string[];
  };
  serviceInfo?: {
    customerComplaint: string;
    actionToBeTaken: string;
    products: any[];
    services: any[];
    productTotalAmount: number;
    serviceTotalAmount: number;
    totalAmount: number;
  };
  // Additional optional fields
  address?: string;
  officeAddress?: string;
  email?: string;
  dob?: string;
  vehicleNumber?: string;
  engineNumber?: string;
  chassisNumber?: string;
  makeModel?: string;
  color?: string;
  fuelLevel?: string;
  complaint?: string;
  estimateLabour?: string;
  estimateParts?: string;
  totalEstimate?: string;
  technicianName?: string;
  serviceAdvisor?: string;
  promisedDeliveryDate?: string;
  contactNumber?: string;
  createdDate?: string;
}

interface EditFormData {
  _id: string;
  // Customer Information
  name: string;
  address: string;
  officeAddress: string;
  contactno: string;
  email: string;
  // Vehicle Information
  registrationNo: string;
  model: string;
  engineNo: string;
  mileage: string;
  color: string;
  chassisNo: string;
  insuranceCompany: string;
  insuranceRenewalDate: string;
  // Vehicle Inventory
  inventory: VehicleInventory;
  fuelLevel: "Empty" | "1/4" | "1/2" | "3/4" | "Full";
  fuelLevelImages: File[];
  // Service Information
  customerComplaint: string;
  actionToBeTaken: string;
  workDone: "pending" | "in-progress" | "completed";
  serviceItems: ServiceItem[];
  servicesmain: ServiceMain[];
  productTotalAmount: string;
  serviceTotalAmount: string;
  totalAmount: string;
  // Job Info (read-only)
  jobInfo: {
    ContactNo: string;
    VehicleNo: string;
    jobId: string;
    customerName: string;
  };
}

interface InventoryItem {
  key: keyof Omit<VehicleInventory, "images">;
  label: string;
}

interface EditJobCardModalProps {
  isOpen: boolean;
  jobCard: JobCardData | null;
  onClose: () => void;
  onSave: (updatedJobCard: JobCardData) => void;
}

const EditJobCardModal: React.FC<EditJobCardModalProps> = ({
  isOpen,
  jobCard,
  onClose,
  onSave,
}): ReactElement | null => {
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(editFormData, 'edit form data')

  const inventoryItems: InventoryItem[] = [
    { key: "jackAndTommy", label: "JACK & TOMMY" },
    { key: "mirrors", label: "MIRRORS" },
    { key: "stepney", label: "STEPNEY" },
    { key: "mudFlaps", label: "MUD FLAPS" },
    { key: "toolKit", label: "TOOL KIT" },
    { key: "freshner", label: "FRESHNER" },
    { key: "keyChain", label: "KEY CHAIN" },
    { key: "mats", label: "MATS" },
    { key: "tapeRecorder", label: "TAPE RECORDER" },
    { key: "cdPlayer", label: "CD PLAYER" },
    { key: "serviceBooklet", label: "SERVICE BOOKLET" },
    { key: "battery", label: "BATTERY" },
    { key: "bodyDamages", label: "BODY DAMAGES" },
    { key: "wheelCovers", label: "WHEEL COVERS" },
    { key: "others", label: "OTHERS" },
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && jobCard) {
      const defaultInventory: VehicleInventory = {
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
        images: {},
      };

       const inventoryFromItems = {
      ...defaultInventory,
      ...Object.fromEntries(
        (jobCard.vehicleInventory?.items || []).map((key: string) => [key, true])
      ),
    };

      setEditFormData({
        _id: jobCard._id,
        // Customer Information
        name: jobCard.customerInfo?.name || "",
        address: jobCard.customerInfo?.address || "",
        officeAddress: jobCard.customerInfo?.officeAddress || "", 
        contactno: jobCard.customerInfo?.contactNo || "",
        email: jobCard.customerInfo?.email || "",
        // Vehicle Information
        registrationNo: jobCard.vehicleInfo?.registrationNo || "",
        model: jobCard.vehicleInfo?.model || "",
        engineNo: jobCard.vehicleInfo?.engineNo || "",
        mileage: jobCard.vehicleInfo?.mileage || "", 
        color: jobCard.vehicleInfo?.color || "",
        chassisNo: jobCard.vehicleInfo?.chassisNo || "",
        insuranceCompany: jobCard.vehicleInfo?.insuranceCompany || "", // Add if available in jobCard
        insuranceRenewalDate: jobCard.vehicleInfo?.insuranceRenewalDate || "", // Add if available in jobCard
        // Vehicle Inventory
        inventory: inventoryFromItems || defaultInventory,
        fuelLevel: (jobCard.vehicleInventory?.fuelLevel as any) || "Empty",
        fuelLevelImages: [],
        // Service Information
        customerComplaint:
          jobCard.serviceInfo?.customerComplaint || jobCard.complaint || "",
        actionToBeTaken: jobCard.serviceInfo?.actionToBeTaken || "",
        workDone: "pending",
        serviceItems: jobCard.serviceInfo?.products?.map(
  (item: any, index: number) => ({
    id: (index + 1).toString(),
    description: item.description || "",
    quantity: item.quantity?.toString() || "1", // Default to "1" if empty
    rate: item.rate?.toString() || "0", // Default to "0" if empty
    amount: (parseFloat(item.quantity || "1") * parseFloat(item.rate || "0")).toFixed(2),
  })
) || [{ id: "1", description: "", quantity: "1", rate: "0", amount: "0.00" }],
        servicesmain: jobCard.serviceInfo?.services?.map(
          (item: any, index: number) => ({
            id: (index + 1).toString(),
            descriptions: item.description || "",
            rates: item.rate?.toString() || "",
            amounts: item.serviceAmount?.toString() || "",
          })
        ) || [{ id: "1", descriptions: "", rates: "", amounts: "" }],
        productTotalAmount:
          jobCard.serviceInfo?.productTotalAmount?.toString() || "0",
        serviceTotalAmount:
          jobCard.serviceInfo?.serviceTotalAmount?.toString() || "0",
        totalAmount: jobCard.serviceInfo?.totalAmount?.toString() || "0",
        // Job Info (read-only)
        jobInfo: jobCard.jobInfo,
      });
      setError(null);
    }
  }, [isOpen, jobCard]);

  const handleInputChange = (field: keyof EditFormData, value: any) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  const handleInventoryChange = (
    key: keyof Omit<VehicleInventory, "images">
  ) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        inventory: {
          ...editFormData.inventory,
          [key]: !editFormData.inventory[key],
          images: {
            ...editFormData.inventory.images,
            ...(editFormData.inventory[key] ? { [key]: [] } : {}),
          },
        },
      });
    }
  };


  const handleImageUpload = (key: string, files: FileList | null) => {
    if (files && editFormData) {
      const fileArray = Array.from(files);
      setEditFormData({
        ...editFormData,
        inventory: {
          ...editFormData.inventory,
          images: {
            ...editFormData.inventory.images,
            [key]: [
              ...(editFormData.inventory.images[key] || []),
              ...fileArray,
            ],
          },
        },
      });
    }
  };

  const removeImage = (key: string, index: number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        inventory: {
          ...editFormData.inventory,
          images: {
            ...editFormData.inventory.images,
            [key]:
              editFormData.inventory.images[key]?.filter(
                (_, i) => i !== index
              ) || [],
          },
        },
      });
    }
  };

  const handleFuelLevelImageUpload = (files: FileList | null) => {
    if (files && editFormData) {
      const fileArray = Array.from(files);
      setEditFormData({
        ...editFormData,
        fuelLevelImages: [...editFormData.fuelLevelImages, ...fileArray],
      });
    }
  };

  const removeFuelLevelImage = (index: number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        fuelLevelImages: editFormData.fuelLevelImages.filter(
          (_, i) => i !== index
        ),
      });
    }
  };

  const handleFuelLevelChange = (
    level: "Empty" | "1/4" | "1/2" | "3/4" | "Full"
  ): void => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        fuelLevel: level,
      });
    }
  };

  // Service Items Functions
  const addServiceItem = (): void => {
    if (editFormData) {
      const newItem: ServiceItem = {
        id: Date.now().toString(),
        description: "",
        quantity: "",
        rate: "",
        amount: "",
      };
      setEditFormData({
        ...editFormData,
        serviceItems: [...editFormData.serviceItems, newItem],
      });
    }
  };

  const removeServiceItem = (id: string): void => {
    if (editFormData && editFormData.serviceItems.length > 1) {
      setEditFormData({
        ...editFormData,
        serviceItems: editFormData.serviceItems.filter(
          (item) => item.id !== id
        ),
      });
      setTimeout(calculateTotalAmount, 0);
    }
  };

  const updateServiceItem = (
  id: string,
  field: keyof ServiceItem,
  value: string
): void => {
  if (editFormData) {
    const updatedItems = editFormData.serviceItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          const quantity = parseFloat(updatedItem.quantity) || 0;
          const rate = parseFloat(updatedItem.rate) || 0;
          updatedItem.amount = (quantity * rate).toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setEditFormData({
      ...editFormData,
      serviceItems: updatedItems,
    });
    calculateTotalAmount(); // Call this directly instead of setTimeout
  }
};

  // Service Main Functions
  const addServices = (): void => {
    if (editFormData) {
      const newItems: ServiceMain = {
        id: Date.now().toString(),
        descriptions: "",
        rates: "",
        amounts: "",
      };
      setEditFormData({
        ...editFormData,
        servicesmain: [...editFormData.servicesmain, newItems],
      });
    }
  };

  const removeServiceItems = (id: string): void => {
    if (editFormData && editFormData.servicesmain.length > 1) {
      setEditFormData({
        ...editFormData,
        servicesmain: editFormData.servicesmain.filter(
          (items) => items.id !== id
        ),
      });
      setTimeout(calculateTotalAmount, 0);
    }
  };

 const updateServiceItems = (
  id: string,
  field: keyof ServiceMain,
  value: string
): void => {
  if (editFormData) {
    const updatedItems = editFormData.servicesmain.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when rate changes
        if (field === 'rates') {
          const rate = parseFloat(value) || 0;
          updatedItem.amounts = rate.toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setEditFormData({
      ...editFormData,
      servicesmain: updatedItems,
    });
    calculateTotalAmount(); // Call this directly
  }
};
  const calculateTotalAmount = (): void => {
  if (editFormData) {
    const productTotal = editFormData.serviceItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
    const serviceTotal = editFormData.servicesmain.reduce(
      (sum, item) => sum + (parseFloat(item.amounts) || 0),
      0
    );
    const total = productTotal + serviceTotal;
    
    setEditFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        productTotalAmount: productTotal.toFixed(2),
        serviceTotalAmount: serviceTotal.toFixed(2),
        totalAmount: total.toFixed(2),
      };
    });
  }
};
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EditFormData, string>>>({});


 const validateFormData = (data: EditFormData): Partial<Record<keyof EditFormData, string>> => {
  const errors: Partial<Record<keyof EditFormData, string>> = {};

  // Customer Info
  if (!data.name.trim()) errors.name = "Customer name is required";
  if (!data.contactno.trim()) errors.contactno = "Contact number is required";
  if (!data.address.trim()) errors.address = "Address is required";
  if (!data.officeAddress.trim()) errors.officeAddress = "Office address is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Email format is invalid";
  }

  // Vehicle Info
  if (!data.registrationNo.trim()) errors.registrationNo = "Registration number is required";
  if (!data.model.trim()) errors.model = "Vehicle model is required";
  if (!data.engineNo.trim()) errors.engineNo = "Engine number is required";
  if (!data.mileage.trim()) errors.mileage = "Mileage is required";
  if (!data.color.trim()) errors.color = "Color is required";
  if (!data.chassisNo.trim()) errors.chassisNo = "Chassis number is required";

  // Service Info
  if (!data.customerComplaint.trim()) errors.customerComplaint = "Customer complaint is required";
  if (!data.actionToBeTaken.trim()) errors.actionToBeTaken = "Action to be taken is required";

  // Validate service items
  if (!data.serviceItems || data.serviceItems.length === 0) {
    errors.serviceItems = "At least one product must be added";
  } else {
    data.serviceItems.forEach((item, index) => {
      if (!item.description.trim() || !item.quantity.trim() || !item.rate.trim()) {
        errors.serviceItems = `Please complete all fields for product row ${index + 1}`;
      }
    });
  }

  // Validate service main
  if (!data.servicesmain || data.servicesmain.length === 0) {
    errors.servicesmain = "At least one service must be added";
  } else {
    data.servicesmain.forEach((item, index) => {
      if (!item.descriptions.trim() || !item.rates.trim()) {
        errors.servicesmain = `Please complete all fields for service row ${index + 1}`;
      }
    });
  }

  // Fuel level
  if (!data.fuelLevel) {
    errors.fuelLevel = "Fuel level is required";
  }

  return errors;
};



  const handleSaveEdit = async () => {
    if (!editFormData) {
      toast.error("No form data available");
      return;
    }

    // Validate form data
   const validationErrors = validateFormData(editFormData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    } else {
      setFieldErrors({});
    }



    setLoading(true);
    setError(null);

    try {
      const payload = {
        jobInfo: {
          customerName: editFormData.name,
          ContactNo: editFormData.contactno,
          jobId: editFormData.jobInfo.jobId,
          VehicleNo: editFormData.registrationNo,
        },
        customerInfo: {
          name: editFormData.name,
          address: editFormData.address,
          officeAddress: editFormData.officeAddress,
          contactNo: editFormData.contactno,
          email: editFormData.email,
        },
        vehicleInfo: {
          registrationNo: editFormData.registrationNo,
          model: editFormData.model,
          engineNo: editFormData.engineNo,
          mileage: editFormData.mileage,
          color: editFormData.color,
          chassisNo: editFormData.chassisNo,
        },
        serviceInfo: {
          customerComplaint: editFormData.customerComplaint,
          actionToBeTaken: editFormData.actionToBeTaken,
          products: editFormData.serviceItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            productAmount: Number(item.amount) || 0,
          })),
          services: editFormData.servicesmain.map((item) => ({
            description: item.descriptions,
            rate: item.rates,
            serviceAmount: Number(item.amounts) || 0,
          })),
          productTotalAmount: Number(editFormData.productTotalAmount) || 0,
          serviceTotalAmount: Number(editFormData.serviceTotalAmount) || 0,
          totalAmount: Number(editFormData.totalAmount) || 0,
        },
        vehicleInventory: {
          fuelLevel: editFormData.fuelLevel,
          currentState: editFormData.inventory,
        },
      };

      const loadingToast = toast.loading("Updating job card...");

      // Call API with correct parameter order (id first, then data)
      const data = {
        id: editFormData._id,
        payload
      }
      const response = await updateJobCards(data);

      if (!response) {
        throw new Error("No response received from server");
      }

      toast.dismiss(loadingToast);
      toast.success("Job Card Updated Successfully!");

      // Create the updated job card object
      const updatedJobCard: JobCardData = {
        _id: editFormData._id,
        customerInfo: {
          email: editFormData.email,
          name: editFormData.name,
          address: editFormData.address,
          contactNo: editFormData.contactno,
        },
        jobInfo: editFormData.jobInfo,
        vehicleInfo: {
          registrationNo: editFormData.registrationNo,
          model: editFormData.model,
          engineNo: editFormData.engineNo,
          color: editFormData.color,
          chassisNo: editFormData.chassisNo,
        },
        vehicleInventory: {
          fuelLevel: editFormData.fuelLevel,
          currentState: editFormData.inventory,
        },
        serviceInfo: {
          customerComplaint: editFormData.customerComplaint,
          actionToBeTaken: editFormData.actionToBeTaken,
          products: editFormData.serviceItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            productAmount: Number(item.amount) || 0,
          })),
          services: editFormData.servicesmain.map((item) => ({
            description: item.descriptions,
            rate: item.rates,
            serviceAmount: Number(item.amounts) || 0,
          })),
          productTotalAmount: Number(editFormData.productTotalAmount) || 0,
          serviceTotalAmount: Number(editFormData.serviceTotalAmount) || 0,
          totalAmount: Number(editFormData.totalAmount) || 0,
        },
        ...response, // Spread any additional data from the response
      };

      onSave(updatedJobCard);
      onClose();
    } catch (error: any) {
      console.error("Failed to update job card:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update job card";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setError(null);
    onClose();
  };

  useEffect(() => {
  if (editFormData) {
    calculateTotalAmount();
  }
}, [editFormData?.serviceItems, editFormData?.servicesmain]);

  if (!isOpen || !editFormData) return null;

  console.log(inventoryItems, 'inventory')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 ">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 style={{ ...FONTS.header, fontWeight: 22 }}>
              Edit Job Card Details
            </h2>
            <p className="!text-gray-600" style={{ ...FONTS.cardSubHeader }}>
              Job Number: {editFormData?.jobInfo?.jobId}
            </p>
            {error && (
              <p
                className="text-red-600 text-sm mt-2"
                style={{ ...FONTS.paragraph }}
              >
                {error}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 !bg-green-600 !text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ ...FONTS.paragraph }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 !bg-gray-500 !text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              style={{ ...FONTS.paragraph }}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Job Information Section - Read Only */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden ">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 !text-white">
                <Lock className="w-5 h-5" />
                <h2
                  className="text-lg !text-white font-semibold"
                  style={{ ...FONTS.cardSubHeader }}
                >
                  Job Information (Read Only)
                </h2>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    REQ ID
                  </label>
                  <div
                    className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600 font-mono"
                    style={{ ...FONTS.subParagraph }}
                  >
                    {editFormData.jobInfo?.jobId}
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Customer Name
                  </label>
                  <div
                    className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600"
                    style={{ ...FONTS.subParagraph }}
                  >
                    {editFormData.jobInfo?.customerName}
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Contact No
                  </label>
                  <div
                    className="bg-white p-3 rounded-lg border-2 border-gray-200 !text-gray-600"
                    style={{ ...FONTS.subParagraph }}
                  >
                    {editFormData.jobInfo?.ContactNo}
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
                <h2
                  className="text-lg !text-white font-semibold"
                  style={{ ...FONTS.cardSubHeader }}
                >
                  Customer Information
                </h2>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Customer name"
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Address"
                  />
                  {fieldErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Office Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.officeAddress}
                    onChange={(e) =>
                      handleInputChange("officeAddress", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Office Address"
                  />
                  {fieldErrors.officeAddress && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.officeAddress}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Contact No *
                  </label>
                  <input
                    type="text"
                    value={editFormData.contactno}
                    onChange={(e) =>
                      handleInputChange("contactno", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Contact No"
                    required
                  />
                  {fieldErrors.contactno && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.contactno}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Email"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Inventory Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 text-white">
                <Car className="w-5 h-5" />
                <h2
                  className="text-lg !text-white font-semibold"
                  style={{ ...FONTS.cardSubHeader }}
                >
                  Vehicle Inventory
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
                {inventoryItems.map((item) => (
                  <React.Fragment key={item.key}>
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={editFormData?.inventory?.[item.key] || false}
                        onChange={() => handleInventoryChange(item.key)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span
                        className="text-sm font-semibold !text-gray-700 group-hover:text-[#9b111e]"
                        style={{ ...FONTS.subParagraph }}
                      >
                        {item.label}
                      </span>
                    </label>
                    {editFormData.inventory[item.key] && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(item.key, e.target.files)
                            }
                            className="text-xs file:text-black file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-white file:hover:text-white file:hover:bg-gradient-to-r file:hover:from-red-600 file:hover:to-red-800"
                            style={{ ...FONTS.subParagraph }}
                          />
                        </div>
                        {editFormData.inventory.images[item.key] &&
                          editFormData.inventory.images[item.key].length >
                            0 && (
                            <div className="flex flex-wrap gap-2">
                              {editFormData.inventory.images[item.key].map(
                                (file, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={
                                        URL.createObjectURL(file) ||
                                        "/placeholder.svg"
                                      }
                                      alt={`${item.label} ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded border border-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeImage(item.key, index)
                                      }
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="border-t pt-4">
                <label
                  className="block text-sm font-medium !text-gray-700 mb-2"
                  style={{ ...FONTS.paragraph }}
                >
                  Fuel Level
                </label>
                <div className="space-y-6">
                  <select
                    value={editFormData.fuelLevel}
                    onChange={(e) =>
                      handleFuelLevelChange(
                        e.target.value as EditFormData["fuelLevel"]
                      )
                    }
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
                    <label
                      className="block text-sm font-medium !text-gray-700"
                      style={{ ...FONTS.paragraph }}
                    >
                      Upload Fuel Level Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleFuelLevelImageUpload(e.target.files)
                      }
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:hover:text-white file:hover:bg-[#7812A4]"
                    />
                    {editFormData.fuelLevelImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editFormData.fuelLevelImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={
                                URL.createObjectURL(file) || "/placeholder.svg"
                              }
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
                <h2
                  className="text-lg !text-white font-semibold"
                  style={{ ...FONTS.cardSubHeader }}
                >
                  Vehicle Information
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Registration No *
                  </label>
                  <input
                    type="text"
                    value={editFormData.registrationNo}
                    onChange={(e) =>
                      handleInputChange("registrationNo", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter registration number"
                    required
                  />
                  {fieldErrors.registrationNo && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.registrationNo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Model
                  </label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter vehicle model"
                  />
                  {fieldErrors.model && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.model}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Engine No
                  </label>
                  <input
                    type="text"
                    value={editFormData.engineNo}
                    onChange={(e) =>
                      handleInputChange("engineNo", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter engine number"
                  />
                  {fieldErrors.engineNo && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.engineNo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Mileage
                  </label>
                  <input
                    type="text"
                    value={editFormData.mileage}
                    onChange={(e) =>
                      handleInputChange("mileage", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter mileage"
                  />
                  {fieldErrors.mileage && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.mileage}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Color
                  </label>
                  <input
                    type="text"
                    value={editFormData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter vehicle color"
                  />
                  {fieldErrors.color && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.color}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Chassis No
                  </label>
                  <input
                    type="text"
                    value={editFormData.chassisNo}
                    onChange={(e) =>
                      handleInputChange("chassisNo", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter chassis number"
                  />
                  {fieldErrors.chassisNo && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.chassisNo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Insurance Company
                  </label>
                  <input
                    type="text"
                    value={editFormData.insuranceCompany}
                    onChange={(e) =>
                      handleInputChange("insuranceCompany", e.target.value)
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                    placeholder="Enter insurance company"
                  />
                  {fieldErrors.insuranceCompany && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.insuranceCompany}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Insurance Renewal Date
                  </label>
                  <input
                    type="text"
                    value={editFormData.insuranceRenewalDate.slice(0,10)}
                    onChange={(e) =>
                      handleInputChange("insuranceRenewalDate", e.target.value)
                    }
                    className="w-full p-3 border-2 !text-black border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    style={{ ...FONTS.subParagraph }}
                  />
                  {fieldErrors.insuranceRenewalDate && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.insuranceRenewalDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Information Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-[#7812A4] p-2">
              <div className="flex items-center gap-2 text-white">
                <Wrench className="w-5 h-5" />
                <h2
                  className="text-lg !text-white font-semibold"
                  style={{ ...FONTS.cardSubHeader }}
                >
                  Service Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium !text-gray-700"
                  style={{ ...FONTS.paragraph }}
                >
                  Customer Complaint
                </label>
                <textarea
                  value={editFormData.customerComplaint}
                  onChange={(e) =>
                    handleInputChange("customerComplaint", e.target.value)
                  }
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  style={{ ...FONTS.subParagraph }}
                  placeholder="Describe the customer's complaint..."
                />
                {fieldErrors.customerComplaint && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.customerComplaint}</p>
                  )}
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium !text-gray-700"
                  style={{ ...FONTS.paragraph }}
                >
                  Action to be Taken
                </label>
                <textarea
                  value={editFormData.actionToBeTaken}
                  onChange={(e) =>
                    handleInputChange("actionToBeTaken", e.target.value)
                  }
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  style={{ ...FONTS.subParagraph }}
                  placeholder="Describe the action to be taken..."
                />
                {fieldErrors.actionToBeTaken && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.actionToBeTaken}</p>
                  )}
              </div>

              {/* Dynamic Service Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Spare Items
                  </label>
                  <button
                    type="button"
                    onClick={addServiceItem}
                    className="bg-[#7812A4] !text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    style={{ ...FONTS.paragraph }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {editFormData.serviceItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-sm font-medium !text-gray-700"
                          style={{ ...FONTS.subParagraph }}
                        >
                          Item #{index + 1}
                        </span>
                        {editFormData.serviceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label
                            className="block text-xs font-medium !text-gray-600 mb-1"
                            style={{ ...FONTS.paragraph }}
                          >
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateServiceItem(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                            style={{ ...FONTS.subParagraph }}
                            placeholder="Spare description"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs font-medium !text-gray-600 mb-1"
                            style={{ ...FONTS.paragraph }}
                          >
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateServiceItem(
                                item.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                            style={{ ...FONTS.subParagraph }}
                            placeholder="Qty"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs font-medium !text-gray-600 mb-1"
                            style={{ ...FONTS.paragraph }}
                          >
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateServiceItem(item.id, "rate", e.target.value)
                            }
                            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                            style={{ ...FONTS.paragraph }}
                            placeholder="Rate"
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <span
                          className="text-sm font-medium !text-gray-600"
                          style={{ ...FONTS.paragraph }}
                        >
                          Amount:
                        </span>
                        <span
                          className="text-lg !font-bold text-[#9b111e]"
                          style={{ ...FONTS.paragraph }}
                        >
                          ₹{item.amount || "0.00"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium !text-gray-700"
                    style={{ ...FONTS.paragraph }}
                  >
                    Service Items
                  </label>
                  <button
                    type="button"
                    onClick={addServices}
                    className="bg-[#7812A4] !text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    style={{ ...FONTS.paragraph }}
                  >
                    <Plus className="w-4 h-4" />
                    Add services
                  </button>
                </div>
                <div className="space-y-3">
                  {editFormData.servicesmain.map((items, index) => (
                    <div
                      key={items.id}
                      className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-sm font-medium !text-gray-700"
                          style={{ ...FONTS.subParagraph }}
                        >
                          Item {index + 1}
                        </span>
                        {editFormData.servicesmain.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceItems(items.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label
                            className="block text-xs font-medium !text-gray-600 mb-1"
                            style={{ ...FONTS.paragraph }}
                          >
                            Description
                          </label>
                          <input
                            type="text"
                            value={items.descriptions}
                            onChange={(e) =>
                              updateServiceItems(
                                items.id,
                                "descriptions",
                                e.target.value
                              )
                            }
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                            style={{ ...FONTS.subParagraph }}
                            placeholder="Service description"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs font-medium !text-gray-600 mb-1"
                            style={{ ...FONTS.paragraph }}
                          >
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={items.rates}
                            onChange={(e) =>
                              updateServiceItems(
                                items.id,
                                "rates",
                                e.target.value
                              )
                            }
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                            style={{ ...FONTS.subParagraph }}
                            placeholder="Rate"
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <span
                          className="text-sm font-medium !text-gray-600"
                          style={{ ...FONTS.paragraph }}
                        >
                          Amount:
                        </span>
                        <span
                          className="text-lg !font-bold"
                          style={{ ...FONTS.paragraph }}
                        >
                          ₹{items.amounts || "0.00"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total Amount Summary */}
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-lg font-semibold"
                      style={{ ...FONTS.paragraph }}
                    >
                      Total Amount:
                    </span>
                    <span
                      className="text-2xl !font-bold"
                      style={{ ...FONTS.paragraph }}
                    >
                      ₹{editFormData.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobCardModal;
