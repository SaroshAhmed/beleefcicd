const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../../../middleware/auth");
const { addColumn, addRow, updateCell, updateColumnHeader, deleteColumn, deleteRow,getTable,addSalesRow,getSalesTable,updateSalesRow,deleteSalesRow} = require("../../../controllers/user/customTable");
router.post('/add-column/:propertyId',isAuthenticated,addColumn)
router.post('/add-row/:propertyId',isAuthenticated,addRow)
router.put('/update-cell/:propertyId',isAuthenticated,updateCell)
router.put('/update-header/:propertyId/:columnId',isAuthenticated,updateColumnHeader)
router.delete('/delete-column/:propertyId/:columnId',isAuthenticated,deleteColumn)
router.delete('/delete-row/:propertyId/:rowId',isAuthenticated,deleteRow)
router.get('/getTable/:propertyId',isAuthenticated,getTable)
router.post('/sales/:propertyId',isAuthenticated,addSalesRow)
router.get('/sales/:propertyId',isAuthenticated,getSalesTable)
router.put('/sales/:propertyId/:rowId',isAuthenticated,updateSalesRow)
router.delete('/sales/:propertyId/:rowId',isAuthenticated,deleteSalesRow)
module.exports = router;