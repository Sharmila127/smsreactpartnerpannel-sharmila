import Client from '../../../api'

export const getAllBookings = async(params: string)=>{
    try{
        const response = await Client.partner.booking.getAll(params)
        console.log(response)
        return response;
    }catch(error){
        console.log("Error getting bookings:",error)
    }
}
export const getHistory = async(params: string)=>{
    try{
        const response = await Client.partner.booking.getAllHistory(params)
        console.log(response)
        return response;
    }catch(error){
        console.log("Error getting bookings:",error)
    }
}