/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Client from "../../api";
import toast from "react-hot-toast";
import { FONTS } from "../../constants/constants";

interface ServicesType {
  services: any[];
  setServices: React.Dispatch<React.SetStateAction<any[]>>;
}

const ServiceBookingPanel: React.FC<ServicesType> = ({ services, setServices }) => {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("In-Process");
  const [newComments, setNewComments] = useState("");

  const handleClick = (service: any) => {
    if (service.status === "completed") {
      setIsVisible(false);
      setSelectedService(null);
      toast.error("Completed services cannot be edited");
      return;
    }
    setSelectedService(service);
    console.log(selectedService,"checing servic")
    setIsVisible(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && selectedBooking) {
        setSelectedBooking(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBooking]);

  const handleSaveStatus = async () => {
    if (!selectedBooking || !selectedService) return;

    try {
      const bookingId = selectedBooking._id;
      const payload = { 
        status: newStatus, 
        id: bookingId, 
        index: selectedService._id,
        comment: newComments 
      };

      await Client.partner.booking.update({}, payload);

      setServices(prev => 
        prev.map(booking => 
          booking._id === bookingId
            ? {
                ...booking,
                services: booking.services.map((service:any) =>
                  service._id === selectedService._id
                    ? { ...service, status: newStatus, comment: newComments }
                    : service
                )
              }
            : booking
        )
      );

      setSelectedBooking((prev:any) => ({
        ...prev,
        services: prev.services.map((service:any) =>
          service._id === selectedService._id
            ? { ...service, status: newStatus, comment: newComments }
            : service
        )
      }));

      setSelectedService((prev:any) => ({
        ...prev,
        status: newStatus,
        comment: newComments
      }));

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update booking", error);
      toast.error("Failed to update booking status!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Solved":
        return "text-green-600";
      case "Viewed":
        return "text-yellow-600";
      case "Completed":
        return "text-green-600";
      default:
        return "text-red-500";
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="space-y-4">
        {/* Table View */}
        <div className="overflow-x-auto bg-white rounded-xl shadow scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#7812A4]">
              <tr>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Service ID
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Customer
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  RegistrationNo
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Vehicle
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Location
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Service Details
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Assigned Date & Time
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Status
                </th>
                <th scope="col" className="py-3 px-4 text-left !text-white" style={{...FONTS.tableHeader}}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length > 0 ? (
                services.map((booking: any) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                       <p className="font-semibold" style={{ ...FONTS.paragraph, fontSize: '15px' }}>
                          {booking?.jobCardId?.jobInfo?.jobId}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold !text-black" style={{...FONTS.paragraph, fontSize: '15px'}}>
                          {booking?.jobCardId?.customerInfo?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold !text-gray-500" style={{...FONTS.paragraph, fontSize: '15px'}}>
                          {booking?.jobCardId?.vehicleInfo?.registrationNo}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold !text-gray-500" style={{...FONTS.paragraph, fontSize: '15px'}}>
                          {booking?.jobCardId?.vehicleInfo?.model}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold !text-gray-500" style={{...FONTS.paragraph, fontSize: '15px'}}>
                          {booking?.partnerId?.contact_info?.city}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold !text-gray-500" style={{...FONTS.paragraph, fontSize: '15px'}}>{booking?.services?.[0]?.name}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-500">
                          <p className="!text-gray-900" style={{...FONTS.paragraph, fontSize: '15px'}}>
                            <span className="font-medium"></span> {booking?.createdAt?.split('T')[0]}
                          </p>
                          <p className="!text-gray-500" style={{...FONTS.subParagraph}}>
                            <span className="font-medium"></span> {booking?.createdAt?.split('T')[1].split('.')[0]}
                          </p>
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full !text-red-600 ${getStatusColor(booking?.status)}`} style={{...FONTS.paragraph, fontSize: '15px'}}>
                        {booking?.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="!text-white px-3 py-1 rounded bg-[#4e9bcd] hover:bg-[#55ACEE] transition text-sm" style={{...FONTS.paragraph, fontSize: '15px'}}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="mt-2 text-gray-600" style={{...FONTS.paragraph}}>No Job Card Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setSelectedBooking(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#7812A4] p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold !text-white" style={{ ...FONTS.header}}>Service Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-3">
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold !text-[#7812A4] mb-3" style={{ ...FONTS.cardheader}}>Customer Details</h4>
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-semibold !text-[#7812A4] mr-1" style={{ ...FONTS.tableHeader}}>Customer Name:</span>
                        <span className="!text-black" style={{ ...FONTS.cardSubHeader}}>{selectedBooking?.jobCardId?.customerInfo?.name}</span>
                      </p>
                      <p className="flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
  <path d="M18.92 6.01C18.72 5.42 18.15 5 17.5 5H6.5C5.85 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 6.5h11l1.5 4.5h-14l1.5-4.5zM7 16.5c-.83 0-1.5-.67-1.5-1.5S6.17 13.5 7 13.5s1.5.67 1.5 1.5S7.83 16.5 7 16.5zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5S18.5 14.17 18.5 15s-.67 1.5-1.5 1.5z" />
</svg>

                        <span className="font-semibold !text-[#7812A4] mr-1" style={{ ...FONTS.tableHeader}}>Vehicle Model:</span>
                        <span className="!text-black" style={{ ...FONTS.cardSubHeader}}>{selectedBooking?.jobCardId?.vehicleInfo?.model}</span>
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold !text-[#7812A4] mr-1" style={{ ...FONTS.tableHeader}}>Date:</span>
                        <span className="!text-black" style={{ ...FONTS.cardSubHeader}}>{selectedBooking?.jobCardId?.jobInfo?.Schedule}</span>
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold !text-[#7812A4] mr-1" style={{ ...FONTS.tableHeader}}>Time:</span>
                        <span className="!text-black" style={{ ...FONTS.cardSubHeader}}>{selectedBooking?.jobCardId?.jobInfo?.Time || "NA"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                <h4 className="font-semibold !text-[#7812A4] mb-4" style={{ ...FONTS.cardheader}}>Services</h4>
                <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
                  {selectedBooking.services.map((service: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => handleClick(service)}
                      className={`p-3 rounded-lg transition-colors ${
                        selectedService?._id === service._id
                          ? "bg-[#7812A4]/10 border border-[#7812A4]/20"
                          : "bg-gray-100 hover:bg-gray-200"
                      } ${
                        service.status === "completed" 
                          ? "cursor-not-allowed opacity-70" 
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium !text-black" style={{ ...FONTS.tableHeader, fontSize: '15px' }}>
                          {service?.name}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            service.status === "completed"
                              ? "!text-green-600"
                              : service.status === "in-process"
                              ? "!text-blue-600"
                              : "!text-[#7812A4]"
                          }`}
                          style={{ ...FONTS.cardSubHeader, fontSize: '13px' }}
                        >
                          {service?.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Details */}
              <div className="p-6">
                {selectedService && isVisible ? (
                  <div className="h-full flex flex-col">
                    <h4 className="text-xl font-bold !text-[#7812A4] mb-4" style={{ ...FONTS.cardheader}}>
                      {selectedService?.name}
                    </h4>

                    <div className="flex-1 space-y-6">
                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium mb-2 !text-[#7812A4]" style={{ ...FONTS.tableHeader}}
                        >
                          Update Status
                        </label>
                        <select
                          id="status"
                          value={selectedService.status}
                          onChange={(e) => {
                            setNewStatus(e.target.value);
                            setSelectedService({ ...selectedService, status: e.target.value });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#7812A4] focus:border-transparent outline-none transition" style={{ ...FONTS.tableHeader, fontSize: '15px'}}
                        >
                          <option value="pending">Pending</option>
                          <option value="started">Started</option>
                          <option value="in-process">In-Process</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 !text-[#7812A4]" style={{ ...FONTS.tableHeader}}>
                          Service Notes
                        </label>
                        <textarea
                          key={selectedService.name}
                          placeholder="Enter your notes..."
                          value={selectedService.comment}
                          onChange={(e) => {
                            setNewComments(e.target.value);
                            setSelectedService({ ...selectedService, comment: e.target.value })
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="w-full border border-gray-300 rounded-lg p-3 resize-none h-40 focus:ring-2 focus:ring-[#7812A4] focus:border-transparent outline-none transition"
                          style={{ ...FONTS.tableHeader, fontSize: '15px'}}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        style={{ ...FONTS.tableHeader, fontSize: '15px'}}
                      >
                        Close
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveStatus();
                          setSelectedBooking(null);
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium !text-white transition-colors ${newStatus === "completed" ? "bg-green-600 hover:bg-green-700" :
                          newStatus === "in-process" ? "bg-blue-600 hover:bg-blue-700" :
                            "bg-[#7812A4] hover:bg-[#5a0d7a]"
                          }`}
                        style={{ ...FONTS.tableHeader, fontSize: '15px'}}>
                        {newStatus === "completed" ? " Completed" :
                          newStatus === "in-process" ? " In-Process" : " Started"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-lg font-medium !text-gray-600 mb-2" style={{ ...FONTS.tableHeader, fontSize: '15px'}}>No Service Selected</h4>
                    <p className="text-sm !text-gray-500 max-w-xs" style={{ ...FONTS.tableHeader, fontSize: '13px'}}>Please select a service from the list to view details and update status</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceBookingPanel;