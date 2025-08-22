/* eslint-disable @typescript-eslint/no-explicit-any */
import Client from '../../../api'
export const createEnquiry = async (data:any)=>{
    try{
        const response:any=await Client.partner.Enquiry.create(data)
        return response
    }
    catch(error){
        console.log('created successfully ',error)
    }
}

export const getEnquiry = async()=>{
    try{
        const response:any=await Client.partner.Enquiry.get()
        return response ;
    }
    catch(error){
       console.log('recived all fetched data',error);
    }
}
