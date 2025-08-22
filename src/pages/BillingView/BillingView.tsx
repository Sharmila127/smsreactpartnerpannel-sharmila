import { useCallback, useEffect, useState } from "react";
import {  ArrowLeft } from "lucide-react";
import { FONTS } from "../../constants/constants";
// import toast from "react-hot-toast";
// import { postBilling } from "../Billing/service";
import { getBillingHistory, getPdfData } from "./service";
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
    model: string;
  };
  status: string;
}

const BillingView = () => {
  const [billingData, setBillingData] = useState<JobData[]>([]);
  const [showGst] = useState(true);
  const [productItems] = useState<ProductItem[]>([]);
  const [serviceItems] = useState<ServiceItem[]>([]);
  const [, setProductTotalAmount] = useState("0");
  const [, setServiceTotalAmount] = useState("0");
  const [, setSubTotalAmount] = useState("0");
  const [gstRate, ] = useState("18");
  const [, setGstAmount] = useState("0");
  const [, setTotalAmount] = useState("0");
  const [receivedAmount] = useState(0);
  const [, setBalanceAmount] = useState("0");
  const [] = useState(`INV-${Math.floor(Math.random() * 10000)}`);
  const [] = useState(new Date().toLocaleDateString());
  const navigate = useNavigate();

  const getBillingHistoryData = async () => {
    try {
      const result = await getBillingHistory();
      setBillingData(result?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBillingHistoryData();
  }, []);
 



  const handleDownload = async(data:string) => {
    const response = await getPdfData(data);
        const url = window.URL.createObjectURL(response);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${data}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
  }

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

  useEffect(() => {
    calculateTotalAmount();
  }, [calculateTotalAmount]);


  const handleBack = () => {
    navigate(-1)
  };

  return (
    <div className="p-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
                <button onClick={handleBack} className="p-2 rounded-3xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
              <h2 className="!text-[#7812A4]" style={{ ...FONTS.cardheader }}>
                Billing History
              </h2>
            </div>
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
                  <th className="text-left py-3 px-6">Service Name</th>
                  <th className="text-left py-3 px-6">Status</th>
                  <th className="text-left py-3 px-6 sticky right-0 bg-[#7812A4] z-10">Actions</th>
                </tr>
              </thead>

              <tbody className="whitespace-nowrap">
                {billingData?.map((item) => (
                  <tr
                    key={item.uuid}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="py-4 px-6 sticky left-0 bg-white z-10">
                      <span className="font-medium !text-blue-600" style={{ ...FONTS.paragraph }}>
                        {item.uuid}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-normal flex !text-gray-900" style={{ ...FONTS.paragraph }}>
                        {item.jobInfo.customerName}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium flex !text-gray-900" style={{ ...FONTS.paragraph }}>
                        {item.jobInfo.ContactNo}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="!text-gray-900" style={{ ...FONTS.paragraph }}>
                        {item.jobInfo.VehicleNo}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="!text-gray-900" style={{ ...FONTS.paragraph }}>
                        {item.vehicleInfo.model}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="!text-gray-900" style={{ ...FONTS.paragraph }}>
                        {item.serviceInfo.services.length > 1
                          ? `${item.serviceInfo.services[0].description}...`
                          : item.serviceInfo.services[0].description}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="!text-gray-900 flex items-center" style={{ ...FONTS.paragraph }}>
                        {item.status}
                      </p>
                    </td>
                    <td className="py-4 px-6 sticky right-0 bg-white z-10">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Download Bill"
                        onClick={()=>handleDownload(item._id)}
                      >
                        Download
                      </button>
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
    </div>
  );
};

export default BillingView;