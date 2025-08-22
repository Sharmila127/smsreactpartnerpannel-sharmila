  import React, { useCallback, useEffect, useState, type ReactNode } from "react";
  import {
    // Eye,
    // Edit,
    Trash2,
    // Search,
    // Phone,
    Plus,
    Save,
  } from "lucide-react";
  import { FONTS } from "../../constants/constants";
  import toast from "react-hot-toast";
  import { getAllBilling, postBilling } from "./service";
import { useNavigate } from "react-router-dom";

  interface ProductItem {
    id: string;
    description: string;
    quantity: string;
    rate: string;
    amount: string;
  }

  interface ServiceItem {
    id: string;
    description: string;
    rate: string;
    amount: string;
  }

  interface JobData {
    _id: string;
    uuid: string;
    customerId: {
      contact_info: any;
      lastName: string;
      firstName: ReactNode;
      _id: string;
    };
    customerInfo: {
      address: string;
      _id: string;
    };
    jobInfo: {
      customerName: string;
      ContactNo: string;
      VehicleNo: string;
      model: string;
      serviceName: string;
      _id: string;
    };
    partnerId: {
      _id: string;
    };
    serviceInfo: {
      customerComplaint: string;
      products: Array<{
        description: string;
        quantity: string;
        rate: string;
        productAmount: number;
      }>;
      services: Array<{
        description: string;
        rate: string;
        serviceAmount: number;
      }>;
      totalAmount: number;
    };
    vehicleInfo: {
      registrationNo: ReactNode;
      model: string;
    };
    status: string;
  }

  const Billing = () => {
    // State for controlling estimation visibility
    const [showEstimation, setShowEstimation] = useState(false);
    const [billingData, setBillingData] = useState<JobData[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
    const [showGst, setShowGst] = useState(true); // Default to showing GST
    const navigate = useNavigate();

    // Fetch billing data
    const getAllBillingData = async () => {
      try {
        const response: any = await getAllBilling({});
        setBillingData(response.data?.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch billing data");
      }
    };

    useEffect(() => {
      getAllBillingData();
    }, []);

    // State for service items
    const [productItems, setProductItems] = useState<ProductItem[]>([]);
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

    // State for totals and payments
    const [, setProductTotalAmount] = useState("0");
    const [, setServiceTotalAmount] = useState("0");
    const [subTotalAmount, setSubTotalAmount] = useState("0");
    const [gstRate, setGstRate] = useState("18");
    const [gstAmount, setGstAmount] = useState("0");
    const [totalAmount, setTotalAmount] = useState("0");
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [balanceAmount, setBalanceAmount] = useState("0");

    // Invoice details
    const [invoiceNumber] = useState(`INV-${Math.floor(Math.random() * 10000)}`);
    const [invoiceDate] = useState(new Date().toLocaleDateString());

    // Toggle estimation visibility and set selected job
    const toggleEstimation = (job: JobData) => {
      setSelectedJob(job);

      // Initialize product items
      const products =
        job.serviceInfo.products?.length > 0
          ? job.serviceInfo.products.map((product) => ({
              id: Date.now().toString(),
              description: product.description,
              quantity: product.quantity,
              rate: product.rate,
              amount: product.productAmount.toString(),
            }))
          : [{ id: "1", description: "", quantity: "", rate: "", amount: "" }];

      setProductItems(products);

      // Initialize service items
      const services =
        job.serviceInfo.services?.length > 0
          ? job.serviceInfo.services.map((service) => ({
              id: Date.now().toString(),
              description: service.description,
              rate: service.rate,
              amount: service.serviceAmount.toString(),
            }))
          : [{ id: "1", description: "", rate: "", amount: "" }];

      setServiceItems(services);

      // Calculate initial totals from existing data if available
      const initialProductTotal =
        job.serviceInfo.products?.reduce(
          (sum, item) => sum + (item.productAmount || 0),
          0
        ) || 0;

      const initialServiceTotal =
        job.serviceInfo.services?.reduce(
          (sum, item) => sum + (item.serviceAmount || 0),
          0
        ) || 0;

      const initialSubTotal = initialProductTotal + initialServiceTotal;
      const initialGst = initialSubTotal * (parseFloat(gstRate) / 100);
      const initialTotal = initialSubTotal + initialGst;

      setProductTotalAmount(initialProductTotal.toFixed(2));
      setServiceTotalAmount(initialServiceTotal.toFixed(2));
      setSubTotalAmount(initialSubTotal.toFixed(2));
      setGstAmount(initialGst.toFixed(2));
      setTotalAmount(initialTotal.toFixed(2));
      setBalanceAmount(initialTotal.toFixed(2)); // Initially balance = total

      setShowEstimation(!showEstimation);
    };

    // Add new product item
    const onAddProductItem = () => {
      const newItem: ProductItem = {
        id: Date.now().toString(),
        description: "",
        quantity: "",
        rate: "",
        amount: "",
      };
      setProductItems([...productItems, newItem]);
    };

    // Remove product item
    const onRemoveProductItem = (id: string) => {
      if (productItems.length > 1) {
        setProductItems(productItems.filter((item) => item.id !== id));
        calculateTotalAmount();
      }
    };

    // Update product item
    const onUpdateProductItem = (
      id: string,
      field: keyof ProductItem,
      value: string
    ) => {
      const updatedItems = productItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "quantity" || field === "rate") {
            const quantity =
              parseFloat(field === "quantity" ? value : updatedItem.quantity) ||
              0;
            const rate =
              parseFloat(field === "rate" ? value : updatedItem.rate) || 0;
            updatedItem.amount = (quantity * rate).toFixed(2);
          }

          return updatedItem;
        }
        return item;
      });

      setProductItems(updatedItems);
      calculateTotalAmount();
    };

    // Add new service item
    const onAddServiceItem = () => {
      const newItem: ServiceItem = {
        id: Date.now().toString(),
        description: "",
        rate: "",
        amount: "",
      };
      setServiceItems([...serviceItems, newItem]);
    };

    // Remove service item
    const onRemoveServiceItem = (id: string) => {
      if (serviceItems.length > 1) {
        setServiceItems(serviceItems.filter((item) => item.id !== id));
        calculateTotalAmount();
      }
    };

    // Update service item
    const onUpdateServiceItem = (
      id: string,
      field: keyof ServiceItem,
      value: string
    ) => {
      const updatedItems = serviceItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "rate") {
            const rate = parseFloat(value) || 0;
            updatedItem.amount = rate.toFixed(2);
          }

          return updatedItem;
        }
        return item;
      });

      setServiceItems(updatedItems);
      calculateTotalAmount();
    };

    // Calculate all amounts
    const calculateTotalAmount = useCallback(() => {
      const productTotal = productItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      const serviceTotal = serviceItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      const subTotal = productTotal + serviceTotal;

      // Calculate GST only if showGst is true
      const gst = showGst ? subTotal * (parseFloat(gstRate) / 100) : 0;
      const total = subTotal + gst;
      const balance = total - receivedAmount || 0;

      setProductTotalAmount(productTotal.toFixed(2));
      setServiceTotalAmount(serviceTotal.toFixed(2));
      setSubTotalAmount(subTotal.toFixed(2));
      setGstAmount(gst.toFixed(2));
      setTotalAmount(total.toFixed(2));
      setBalanceAmount(balance.toFixed(2));
    }, [productItems, serviceItems, gstRate, receivedAmount, showGst]);

    // Handle GST rate change

    // Handle received amount change
   const handleReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const received = parseFloat(value);

  if (isNaN(received)) {
    setReceivedAmount(0);
  } else {
    setReceivedAmount(received);
  }
};

    useEffect(() => {
      calculateTotalAmount();
    }, [
      productItems,
      serviceItems,
      gstRate,
      receivedAmount,
      showGst,
      calculateTotalAmount,
    ]);

    

    // Save invoice
    const handleSave = async () => {
      try {
        if (!selectedJob) {
          toast.error("No job selected");
          return;
        }

        // Validate required fields exist
        // if (!selectedJob.jobInfo?._id) {
        //   toast.error('Missing required customer  information');
        //   return;
        // }
        //  if (!selectedJob.customerInfo?._id ) {
        //   toast.error('Missing required customer or job information');
        //   return;

        // }

        // Prepare the billing data according to schema
        const billingData = {
          uuid: selectedJob.uuid || `BILL-${Date.now()}`,
          customerId: selectedJob.customerId._id, // Already validated
          partnerId: selectedJob.partnerId._id, // From selectedJob
          JobCardId: selectedJob._id, // Already validated
          amountStatus:
            parseFloat(balanceAmount) === 0
              ? "completed"
              : parseFloat(receivedAmount.toString()) > 0
              ? "halfpay"
              : "pending",
          listOfitems: [
            ...productItems.map((item) => ({
              name: item.description,
              quantity: item.quantity,
              unitPrice: item.rate,
              totalPrice: item.amount,
            })),
            ...serviceItems.map((item) => ({
              name: item.description,
              quantity: "1", // Services typically have quantity 1
              unitPrice: item.rate,
              totalPrice: item.amount,
            })),
          ],
          gstMethod: true,
          gstPercent: showGst? parseFloat(gstRate) : 0,
          subTotal: parseFloat(subTotalAmount),
          revicedAmount: parseFloat(receivedAmount.toString() || "0"), // Default to 0 if empty
          balanceAmount: parseFloat(balanceAmount),
          TotalAmount: parseFloat(totalAmount),
          // invoiceDate will be automatically added by the schema
        };

        console.log("Final billing data:", billingData);

        const response = (await postBilling(billingData)) as { data?: any; message?: string };

        if (response?.data) {
          toast.success("Invoice saved successfully!");
          setShowEstimation(false);
          await getAllBillingData(); // Refresh the billing list
        } else {
          toast.error(response?.message || "Failed to save invoice");
        }
      } catch (error: any) {
        console.error("Billing error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to save invoice");
      }
    };
  
    const handleHistory = () =>{
         navigate('/billing-view')
    }
    return (
      <div className="p-4">
        <div className=" rounded-lg  ">
          <div className=" p-6 ">
            <div className="flex items-center justify-between ">
              <div >
                <h2 className="!text-[#7812A4]" style={{ ...FONTS.header }}>
                  Billing
                </h2>
              </div>
              <button className="border bg-[#7812AA] p-3 rounded-2xl text-white" onClick={handleHistory}>View History</button>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead
  className="bg-[#7812A4] border-b !text-white border-gray-200 whitespace-nowrap"
  style={{ ...FONTS.tableHeader }}
>
  <tr>
    <th className="text-left py-3 px-6 sticky left-0 bg-[#7812A4] z-10">Job ID</th>
    <th className="text-left py-3 px-6">Customer Name</th>
    <th className="text-left py-3 px-6">Phone No</th>
    <th className="text-left py-3 px-6">Vehicle No</th>
    <th className="text-left py-3 px-6">Vehicle Model</th>
    {/* <th className="text-left py-3 px-6">Location</th> */}
    <th className="text-left py-3 px-6">Service Name</th>
    <th className="text-left py-3 px-6">Status</th>
    <th className="text-left py-3 px-6 sticky right-0 bg-[#7812A4] z-10">Actions</th>
  </tr>
</thead>

                <tbody className="whitespace-nowrap">
                  {billingData.map((item) => (
                    <tr
                      key={item.uuid}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <td className="py-4 px-6 sticky left-0 bg-white z-10">
                        <span
                          className="font-medium !text-blue-600"
                          style={{ ...FONTS.paragraph }}
                        >
                          {item.uuid}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p
                            className="font-normal flex !text-gray-900"
                            style={{ ...FONTS.paragraph }}
                          >
                            {item?.customerId?.firstName+' '+item?.customerId?.lastName}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p
                            className="font-medium flex !text-gray-900"
                            style={{ ...FONTS.paragraph }}
                          >
                           
                            {item?.customerId?.contact_info?.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span
                            className="!text-gray-900"
                            style={{ ...FONTS.paragraph }}
                          >
                            {item?.vehicleInfo?.registrationNo}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span
                            className="!text-gray-900"
                            style={{ ...FONTS.paragraph }}
                          >
                            {item?.vehicleInfo?.model}
                          </span>
                        </div>
                      </td>
                      {/* <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span
                            className="!text-gray-900"
                            style={{ ...FONTS.paragraph }}
                          >
                            {item.customerInfo.address}
                          </span>
                        </div>
                      </td> */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-wrap">
                          <span
                            className="!text-gray-900"
                            style={{ ...FONTS.paragraph }}
                          >
                            {item.serviceInfo.services.length > 1
                              ? `${item.serviceInfo.services[0].description}...`
                              : item.serviceInfo.services[0].description}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 ">
                        <div className="text-sm">
                          <p
                            className="!text-gray-900 flex items-center"
                            style={{ ...FONTS.paragraph }}
                          >
                            {item.status}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 sticky right-0 bg-white z-10 ">
                        <div className="flex space-x-2 ">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Generate Bill"
                            onClick={() => toggleEstimation(item)}
                          >
                            Generate Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {billingData.length === 0 && (
            <div className="p-6 text-center">
              <p>No job cards found</p>
            </div>
          )}
        </div>

        {/* Estimation Modal */}
        {showEstimation && selectedJob && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-4xl">
                <div className="bg-[#7812A4] rounded-t-2xl p-2 ">
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg !text-white font-semibold ml-4"
                      style={{ ...FONTS.cardSubHeader }}
                    >
                      Invoice
                    </h2>
                    <button
                      onClick={() => setShowEstimation(false)}
                      className="text-white hover:text-gray-200 p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h4 className="font-semibold">
                        Invoice Number: {invoiceNumber}
                      </h4>
                      <h4 className="font-semibold">
                        Invoice Date: {invoiceDate}
                      </h4>
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold">
                        Customer Name: {selectedJob.customerId.firstName+' '+selectedJob?.customerId.lastName}
                      </h4>
                      <h4 className="font-semibold">
                        Vehicle No: {selectedJob?.vehicleInfo?.registrationNo}
                      </h4>
                      <h4 className="font-semibold">
                        Vehicle model: {selectedJob?.vehicleInfo?.model}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {/* Products Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label
                          className="text-sm font-medium !text-gray-700"
                          style={{ ...FONTS.paragraph }}
                        >
                          Products
                        </label>
                        <button
                          type="button"
                          onClick={onAddProductItem}
                          className=" !text-[#7812A4] flex items-center gap-2"
                          style={{ ...FONTS.paragraph }}
                        >
                          <Plus className="w-4 h-4" />
                          Add Product
                        </button>
                      </div>

                      <div className="space-y-3">
                        {productItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className="text-sm font-medium !text-gray-700"
                                style={{ ...FONTS.subParagraph }}
                              >
                                Product #{index + 1}
                              </span>
                              {productItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveProductItem(item.id)}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-all"
                                  style={{ ...FONTS.subParagraph }}
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
                                    onUpdateProductItem(
                                      item.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                                  style={{ ...FONTS.subParagraph }}
                                  placeholder="Product description"
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
                                    onUpdateProductItem(
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
                                  Rate{" "}
                                  <span className="!font-sans">(&#8377;)</span>
                                </label>
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) =>
                                    onUpdateProductItem(
                                      item.id,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
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
                                Amount:{" "}
                              </span>
                              <span
                                className="text-lg !font-bold text-[#9b111e]"
                                style={{ ...FONTS.paragraph }}
                              >
                                <span className="!font-sans">&#8377;</span>{" "}
                                {item.amount || "0.00"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label
                          className="text-sm font-medium !text-gray-700"
                          style={{ ...FONTS.paragraph }}
                        >
                          Services
                        </label>
                        <button
                          type="button"
                          onClick={onAddServiceItem}
                          className="  !text-[#7812A4] flex items-center gap-2"
                          style={{ ...FONTS.paragraph }}
                        >
                          <Plus className="w-4 h-4" />
                          Add Service
                        </button>
                      </div>

                      <div className="space-y-3">
                        {serviceItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className="text-sm font-medium !text-gray-700"
                                style={{ ...FONTS.subParagraph }}
                              >
                                Service #{index + 1}
                              </span>
                              {serviceItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveServiceItem(item.id)}
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
                                    onUpdateServiceItem(
                                      item.id,
                                      "description",
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
                                  className="block text-xs font-medium !text-gray-600 mb-1 ml-50"
                                  style={{ ...FONTS.paragraph }}
                                >
                                  Rate{" "}
                                  <span className="!font-sans">(&#8377;)</span>
                                </label>
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) =>
                                    onUpdateServiceItem(
                                      item.id,
                                      "rate",
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
                                Amount:{" "}
                              </span>
                              <span
                                className="text-lg !font-bold"
                                style={{ ...FONTS.paragraph }}
                              >
                                <span className="!font-sans">&#8377;</span>{" "}
                                {item.amount || "0.00"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      <h3 className="font-semibold text-lg mb-4">
                        Payment Summary
                      </h3>

                      <div className="space-y-3">
                        {/* Subtotal */}
                        <div className="flex justify-end gap-3">
                          <span className="font-medium">Subtotal:</span>
                          <span>₹{subTotalAmount}</span>
                        </div>
                        <hr />

                        {/* Add GST Toggle Switch */}
                        <div className="flex justify-between">
                        <div className="flex justify-start gap-3 items-center mb-4">
                          <span className="font-medium">Include GST:</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showGst}
                              onChange={() => setShowGst(!showGst)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7812A4]"></div>
                          </label>
                        </div>

                        {/* GST */}
                        {showGst && (
                          <div className=" justify-end gap-4 items-center">
                            <div className="flex items-center mb-3 space-x-2">
                              <span className="font-medium">GST @</span>
                              <select
                                value={gstRate}
                                onChange={(e) => setGstRate(e.target.value)}
                                className="p-1 border border-gray-300 rounded-md text-sm"
                              >
                              
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </div>
                            <span className="font-medium">GST Amount : ₹ {' '}{gstAmount}</span>
                          </div>
                        )}
                          </div>
                        {/* Total */}
                        <div className="flex justify-end gap-3 font-bold text-lg border-t pt-2 mt-2">
                          <span>Total:</span>
                          <span>₹{totalAmount}</span>
                        </div>

                        {/* Received Amount */}
                        <div className="pt-4">
                          <div className="flex justify-end gap-3 items-center mb-2">
                            <label className="font-medium">
                              Received Amount:
                            </label>
                            <div className="w-48">
                              <input
                                type="number"
                                value={receivedAmount === 0 ? "" : receivedAmount}
                                onChange={handleReceivedChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-right"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Balance */}
                          <div className="flex justify-end gap-64 font-bold text-lg border-t pt-2">
                            <span>Balance:</span>
                            <span>₹{Math.round(Number(balanceAmount))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Billing;
