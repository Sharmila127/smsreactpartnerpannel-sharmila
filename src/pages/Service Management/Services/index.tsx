/* eslint-disable @typescript-eslint/no-explicit-any */

// import { log } from 'console';
import Client from '../../../api';

export const getAllServiceRequests = async (params: string) => {
    try{
        const response = await Client.partner.service_requets.getAll(params)
        console.log(response);
        return response;
    }catch(error){
        console.error('Error fetching service by ID:',error)
    }
}

export const getAllJobCards = async () =>{
    try{
        const response = await Client.partner.job_card.getAll();
        console.log(response);
        return response;
    }
    catch(error){
        console.error("Error fetching job cards:", error);
    }
}

export const createJobCards = async(data:any)=>{
    try{
        const response = await Client.partner.job_card.create(data);
        console.log(response);
        return response;
    }
    catch(error){
        console.error("Error fetching job Cards:", error)
    }
}


export const deleteJobCards = async( params:string)=>{
    try {
        const response = await Client.partner.job_card.delete(params);
        console.log(response);
        return response;
    } catch (error) {
        console.log("Error Deleting Job Cards",error)
    }
    
}


export const updateJobCards = async (data:any)=>{
    try{
     const response = await Client.partner.job_card.update(data)
      console.log("updatejobcards",response)
      return response;
    }
    catch(error){
       console.log("updating error ",error)
        throw error
    }
}

export const getServiceDetailsById = async(params : string ) => {
    console.log("uuid",params);
    
    try{
    const response = await Client.partner.services.getById(params);
    console.log('uuid response : ',response);
    return response;
    }
    catch(err){
        console.log('service id error',err);
    }
}