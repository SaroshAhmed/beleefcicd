const UserProperty = require("../../models/UserProperty");
  
exports.addColumn=async(req,res)=>{
    const {propertyId}=req.params;
    const {headerName,tempId}=req.body;
    try{
        const userProperty=await UserProperty.findOneAndUpdate(
            {_id:propertyId},
            {$push:{'customTable.columns':{headerName}}},
            {new:true}
        );
        if(!userProperty){
            return res.status(404).json({success:false,message:"User Property not found"});
        }
        return res.status(200).json({success:true,data:{
            headerName,
            tempId,
            _id:userProperty.customTable.columns[userProperty.customTable.columns.length-1]._id
        }});
    }
    catch(error){
        console.error("Error adding column: ",error.message);
        return res.status(500).json({success:false,message:error.message});
    }
}
exports.addRow=async(req,res)=>{
    const {propertyId}=req.params;
    const {data,tempId}=req.body;
    try{
        const userProperty=await UserProperty.findOneAndUpdate(
            {_id:propertyId},
            {$push:{'customTable.rows':{data}}},
            {new:true}
        );
        if(!userProperty){
            return res.status(404).json({success:false,message:"User Property not found"});
        }
        return res.status(200).json({success:true,data:{
            data,
            tempId,
            _id:userProperty.customTable.rows[userProperty.customTable.rows.length-1]._id
        }});
    }
    catch(error){
        console.error("Error adding row: ",error.message);
        return res.status(500).json({success:false,message:error.message});
    }
}
// update a specific cell in a row
exports.updateCell=async(req,res)=>{
    const {propertyId}=req.params;
    const {
        rowId, columnId, value
    }=req.body;
    try{

    const table = await UserProperty.findById(propertyId);
    
    if (!table) {
      return res.status(404).json({success:false,message:'Not found'});
    }

    const row = table.customTable.rows.id(rowId);
    
    if (!row) {
      return res.status(404).json({
        success:false,
        message: 'Row not found',
      });
    }


    const column = table.customTable.columns.id(columnId);
    
    if (!column) {
      return res.status(404).json(
        {success:false,message:'Column not found'}
      );
    }

    row.data.set(column._id.toString(), value);

    await table.save();
    return res.status(200).json({success:true,data:table});
    }
    catch(error){
        return res.status(500).json({success:false,message:error.message});
    }
}
// update a specific column header name
exports.updateColumnHeader=async(req,res)=>{
    const {propertyId,columnId}=req.params;
    const {headerName}=req.body;
    try{
        const userProperty=await UserProperty.findOneAndUpdate(
            {_id:propertyId,'customTable.columns._id':columnId},
            {$set:{'customTable.columns.$.headerName':headerName}},
            {new:true}
        );
        if(!userProperty){
            return res.status(404).json({success:false,message:"User Property not found"});
        }
        return res.status(200).json({success:true,data:userProperty});
    }
    catch(error){
        console.error("Error updating column header: ",error.message);
        return res.status(500).json({success:false,message:error.message});
    }
}
// delete a specific column
exports.deleteColumn=async(req,res)=>{
    const {propertyId,columnId}=req.params;
    try{
        const userProperty = await UserProperty.findById(propertyId);
        if(!userProperty){
            return res.status(404).json({success:false,message:"User Property not found"});
        }
        userProperty.customTable.columns = userProperty.customTable.columns.filter(
            (col) => col._id.toString() !== columnId
          );
          userProperty.customTable.rows.forEach((row) => {
            row.data.delete(columnId); 
          });
          await userProperty.save()
        return res.status(200).json({success:true,data:userProperty});
    }
    catch(error){
        console.error("Error deleting column: ",error.message);
        return res.status(500).json({success:false,message:error.message});
    }
}
// delete a specific row
exports.deleteRow=async(req,res)=>{
    const {propertyId,rowId}=req.params;
    try{
        const userProperty=await UserProperty.findOneAndUpdate(
            {_id:propertyId},
            {$pull:{'customTable.rows':{_id:rowId}}},
            {new:true}
        );
        if(!userProperty){
            return res.status(404).json({success:false,message:"User Property not found"});
        }
        return res.status(200).json({success:true,data:userProperty});
    }
    catch(error){
        console.error("Error deleting row: ",error.message);
        return res.status(500).json({success:false,message:error.message});
    }
}

// get whole table
exports.getTable = async (req, res) => {
    const { propertyId } = req.params;
    try {
        const userProperty = await UserProperty.findById(propertyId);
        if (!userProperty) {
            return res.status(404).json({ success: false, message: "User Property not found" });
        }

        // Check if customTable exists, if not, add it with default columns
        if (!userProperty?.customTable || userProperty?.customTable?.columns?.length === 0) {
            userProperty.customTable = {
                columns: [
                    { headerName: 'Buyer' },
                    { headerName: 'Contract Requests' },
                    { headerName: 'Strata Report' },
                    { headerName: 'Re-inspection' },
                    { headerName: 'Pre-offers' },
                    { headerName: 'Still engaged after increased price' },
                    { headerName: 'Point' }
                ],
                rows: []  // Empty rows initially
            };

            // Save the updated record with customTable
            await userProperty.save();
        }

        // Prepare the columns and rows for the response
        const columns = userProperty.customTable.columns;
        const rows = userProperty.customTable.rows.map((row) => ({
            _id: row._id,
            data: Object.fromEntries(row.data)  // Format the rows properly
        }));
        return res.status(200).json({
            success: true,
            data: {
                columns,
                rows
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};