
import Client from '../../../api/index'

 export const getBillingHistory = async() => {
    try {
        
        const response:any =  await Client.partner.billing.gethistory()
        return response.data
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const getPdfData = async(params:string) => {
    try {
        const response:any =  await Client.partner.billing.getById(params)
        return response.data
    } catch (error) {
        console.log(error);
    }
}