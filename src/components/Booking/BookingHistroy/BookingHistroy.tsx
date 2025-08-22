import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { FONTS } from "../../../constants/constants";
import { getHistory } from "../../../pages/Bookings/services";
import { FONTS } from "../../../constants/constants";

interface PartnerInfo {
  firstName: string;
  lastName: string;
  companyName: string;
  contact_info: {
    phoneNumber: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface ServiceBooking {
  id: string;
  jobId: string;
  customerName: string;
  contactNo: string;
  email: string;
  carModel: string;
  vehicleNo: string;
  servicePurpose: string[];
  status: string;
  registrationNo: string;
  serviceInfo?: {
    customerComplaint: string;
    actionToBeTaken: string;
    products: Array<{
      description: string;
      quantity: string;
      rate: string;
      productAmount: number;
      _id: string;
    }>;
    services: Array<{
      description: string;
      rate: string;
      serviceAmount: number;
      comment?: string;
     
      _id: string;
    }>;
  };
  partnerInfo: PartnerInfo;
}

interface HistoryProps {
  bkings: ServiceBooking[];
}

const History: React.FC<HistoryProps> = ({ }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ServiceBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const loading = false;
  
  // Backspace handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        navigate(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory('') as any;
        const formattedData = response.data.data.map((item: any) => ({
          id: item._id,
          jobId: item.jobCardId.uuid,
          customerName: item.jobCardId.customerInfo.name,
          contactNo: item.jobCardId.customerInfo.contactNo,
          email: item.jobCardId.customerInfo.email,
          carModel: item.jobCardId.vehicleInfo.model,
          registrationNo: item.jobCardId.vehicleInfo.registrationNo,
          vehicleNo: item.jobCardId.vehicleInfo.registrationNo,
          servicePurpose: item.services.map((service: any) => service.name),
          status: item.status,
          serviceInfo: item.jobCardId.serviceInfo,
          partnerInfo: {
            firstName: item.partnerId.firstName,
            lastName: item.partnerId.lastName,
            companyName: item.partnerId.companyName,
            contact_info: {
              phoneNumber: item.partnerId.contact_info.phoneNumber,
              address1: item.partnerId.contact_info.address1,
              address2: item.partnerId.contact_info.address2,
              city: item.partnerId.contact_info.city,
              state: item.partnerId.contact_info.state,
              pincode: item.partnerId.contact_info.pincode
            }
          }
        }));
        setHistory(formattedData);
      } catch (error) {
        console.error("Failed to fetch history", error);
      }
    };
    fetchHistory();
  }, []);

  const completedBookings = history.filter(
    (booking) => booking.status === "completed"
  );

  const handleViewDetails = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7812A4]"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
     

      {completedBookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-[#7812A4] !text-white " style={{...FONTS.tableHeader}}>
              <tr>
                <th className="py-3 px-4 text-left" >Job ID</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Vehicle Model</th>
                <th className="py-3 px-4 text-left">Registration No</th>
                <th className="py-3 px-4 text-left">Services</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4" style={{ ...FONTS.paragraph, fontSize: '15px' }}>{booking.jobId}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium !text-black"style={{ ...FONTS.paragraph, fontSize: '15px' }}>{booking.customerName}</p>
                      <p className="text-sm !text-gray-500"style={{ ...FONTS.subParagraph }}>{booking.contactNo}</p>
                      <p className="text-sm !text-gray-500"style={{ ...FONTS.subParagraph}}>{booking.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4"style={{ ...FONTS.paragraph, fontSize: '15px' }}>
                    <div>
                      <p>{booking.carModel}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4"style={{ ...FONTS.paragraph, fontSize: '15px' }}>{booking.registrationNo}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs"style={{ ...FONTS.paragraph, fontSize: '15px' }}>
                      {booking.servicePurpose.map((purpose, index) => (
                        <span
                          key={index}
                          className="bg-[#f5f5f5] px-2 py-1 rounded text-xs text-gray-700"
                        >
                          {purpose}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-green-100 !text-green-800 rounded-full text-xs font-medium"style={{ ...FONTS.paragraph, fontSize: '15px' }}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="bg-[#7812A4] !text-white px-3 py-1 rounded text-sm hover:bg-[#5f0d83] transition"style={{ ...FONTS.paragraph, fontSize: '15px' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500"style={{ ...FONTS.paragraph, fontSize: '15px' }}>No completed bookings found</p>
        </div>
      )}

      {/* Modal for viewing booking details */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={closeModal} >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
          onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center rounded-t-lg ">
              <div>
                <h3 className="text-xl font-semibold !text-[#7812A4]"style={{ ...FONTS.header}}>Booking Details</h3>
                
                <p className="text-sm pt-2 !text-gray-500"style={{ ...FONTS.cardSubHeader}}>Job ID: {selectedBooking.jobId}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium !text-gray-700 border-b pb-2"style={{ ...FONTS.tableHeader}}>Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs !text-black"style={{ ...FONTS.cardheader,fontSize:'14px'}}>Name</p>
                      <p className="!text-gray-500"style={{ ...FONTS.cardSubHeader}}>{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs !text-black"style={{ ...FONTS.cardheader,fontSize:'14px'}}>Contact</p>
                      <p className="!text-gray-500"style={{ ...FONTS.cardSubHeader}}>{selectedBooking.contactNo}</p>
                    </div>
                    <div>
                      <p className="text-xs !text-black"style={{ ...FONTS.cardheader,fontSize:'14px'}}>Email</p>
                      <p className="break-all !text-gray-500"style={{ ...FONTS.cardSubHeader}}>{selectedBooking.email}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information Section */}
                <div className="space-y-3">
                  <h4 className="font-medium !text-gray-700 border-b pb-2"style={{ ...FONTS.tableHeader}}>Vehicle Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs !text-black"style={{ ...FONTS.cardheader,fontSize:'14px'}}>Model</p>
                      <p className="!text-gray-500"style={{ ...FONTS.cardSubHeader}}>{selectedBooking.carModel}</p>
                    </div>
                    <div>
                      <p className="text-xs !text-black"style={{ ...FONTS.cardheader,fontSize:'14px'}}>Registration No</p>
                      <p className="!text-gray-500"style={{ ...FONTS.cardSubHeader}}>{selectedBooking.registrationNo}</p>
                    </div>
                  </div>
                </div>
              </div>

             

              {/* Services Information Section */}
              <div className="space-y-4">
                <h4 className="font-medium !text-gray-700 border-b pb-2"style={{ ...FONTS.tableHeader}}>Services Requested</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                 
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium !text-blue-800 mb-1"style={{ ...FONTS.cardSubHeader}}>Customer Complaint</h5>
                    <p className="!text-gray-700"style={{ ...FONTS.cardheader,fontSize:'14px'}}>{selectedBooking.serviceInfo?.customerComplaint || "No complaint noted"}</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h5 className="font-medium !text-yellow-800 mb-1"style={{ ...FONTS.cardSubHeader}}>Action Required</h5>
                    <p className="!text-gray-700"style={{ ...FONTS.cardheader,fontSize:'14px'}}>{selectedBooking.serviceInfo?.actionToBeTaken || "No specific action noted"}</p>
                  </div>

                <div className="space-y-3">
  <h5 className="font-medium !text-gray-700"style={{ ...FONTS.tableHeader}}>Service Details</h5>
  {selectedBooking.serviceInfo?.services?.map((service, index) => (
    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="font-medium"style={{ ...FONTS.cardheader,fontSize:'14px'}}>{service.description}</span>
        <span className="px-3 py-1 bg-green-100 !text-green-800 rounded-full text-sm font-medium"style={{ ...FONTS.cardheader,fontSize:'14px'}}>
          {selectedBooking.status}
        </span>
      </div>

      {/* Comment below the description */}
      <div className="mt-1 text-sm !text-gray-600"style={{ ...FONTS.cardheader,fontSize:'14px'}}>
        {service.comment}
      </div>

      <div className="text-right text-sm !text-gray-500 mt-2"style={{ ...FONTS.cardheader,fontSize:'14px'}}>
        Total: ₹{service.serviceAmount}
      </div>
    </div>
  ))}
</div>



                  <div className="space-y-3 mt-4">
                    <h5 className="font-medium !text-gray-700"style={{ ...FONTS.tableHeader}}>Products Used</h5>
                    {selectedBooking.serviceInfo?.products?.map((product, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-medium"style={{ ...FONTS.cardheader,fontSize:'14px'}}>{product.description}</span>
                          {/* <span className="text-gray-600">₹{product.rate}</span> */}
                        </div>
                        <div className="flex justify-between text-sm !text-gray-500 mt-1"style={{ ...FONTS.cardheader,fontSize:'14px'}}>
                          <span>Qty: {product.quantity}</span>
                          <span>Total: ₹{product.productAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                <h4 className="font-medium !text-gray-700 border-b pb-2"style={{ ...FONTS.tableHeader}}>Status</h4>
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end rounded-b-lg">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#7812A4] !text-white rounded hover:bg-[#5f0d83] transition" style={{ ...FONTS.tableHeader, fontSize: '15px'}}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;