/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useEffect, useState } from "react";
import { FONTS } from "../../constants/constants";
import ServiceBookingPanel from "../../components/Booking/BookingCom";

import History from "../../components/Booking/BookingHistroy/BookingHistroy";

// API call
import { getAllBookings } from "./services";


const Bookings = () => {
   const [showHistory, setShowHistory] = useState(false);
  // const showHistory = false;
  const [bookings, setBookings] = useState<any[]>([]); 
  

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response: any = await getAllBookings('');
        setBookings(response.data.data)
        console.log(response.data.data);
      } catch (error) {
        console.log("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);
 

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 m-5">
        {/* Header Row */}
        <h2
          className="text-2xl font-semibold text-[#9b111e] ml-4"
          style={{ ...FONTS.header}}
        >
            {showHistory ? "Completed Bookings" : "Services Booking"}
        </h2>

         <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-8 bg-[#7812A4] !text-white px-6 py-3 rounded-full  transition  flex items-center gap-2"style={{ ...FONTS.cardSubHeader,fontWeight:600 }}
          >
          {showHistory ? "Bookings" : "History"}
          </button>
    

      </div>

      {showHistory ? (
        <History bkings={bookings} />
      ) : (
        <div className="w-full h-screen flex justify-left">
          <div className="w-full py-2 ">
            {/* Booking Panel */}
            <div className="mb-6 bg-[E8d6f0] rounded-xl mx-4 justify-center items-center px-1">
              <ServiceBookingPanel services={bookings} setServices={setBookings}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

