const ListingAppointment = require("../../models/ListingAppointment");

exports.createListingAppointment=async(req,res)=>{
    try {
        const {weeks}=req.body;
        const anyListingAppointment = await ListingAppointment.find();
        if(anyListingAppointment.length>0){
            await ListingAppointment.findByIdAndDelete(anyListingAppointment[0]._id);
        }
        const listingAppointment = new ListingAppointment({
            priceProcess:weeks
        });
        await listingAppointment.save();
        res.status(201).send({listingAppointment});
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.getListingAppointment=async(req,res)=>{
    try {
        const listingAppointment = await ListingAppointment.find();
        res.status(200).send({ 
            priceProcess : listingAppointment[0]?.priceProcess
        });
    } catch (error) {   
        res.status(400 ).send(error);
    }
}