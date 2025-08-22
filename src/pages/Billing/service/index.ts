import Client from '../../../api'

export const getAllBilling = async(data: any)=>{
    try{
        const response = await Client.partner.billing.get(data);
        console.log(response)
        return response;
    }catch(error){
        console.log("Error getting bookings:",error)
    }
}

export const postBilling = async(data: any) => {
    try{
        const response = await Client.partner.billing.create(data);
        console.log('post billing ;', response)
        return response;
    }
    catch(error){
        console.log(error)
    }
}