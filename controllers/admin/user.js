const User = require("../../models/User");
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('name email mobile picture company title');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUser = async (req, res) => {
    try{
        const {
            name,
            mobile,
            company,
            title,
            id
        } = req.body;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const getCompanyData = (company) => {
          const companies = [
            {
              name: "Ausrealty (Riverwood) Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "166 Belmore Road, Riverwood NSW 2210",
              licenseNumber: "10044297",
      abn: "ABN 97 610 838 643",
        conjunctionAgent:"No"
            },
            {
              name: "KK Property Services Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "7 Padstow Parade, Padstow NSW 2211",
              licenseNumber: "10074701",
      abn:"ABN 32 626 591 642",
        conjunctionAgent:"No"
      
            },
            {
              name: "I.M Group Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress:
                "Shop AG08, 52 Soldiers Parade, Edmondson Park NSW 2174",
              licenseNumber: "10128898",
      abn:"ABN 58 634 408 610",
        conjunctionAgent:"No"
            },
            {
              name: "MRL Property Group Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "51-53 Princes Highway, Sylvania NSW 2224",
              licenseNumber: "10138644",
      abn:"ABN 66 648 514 498",
        conjunctionAgent:"No"
            },
            {
              name: "Hani Property Services Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "166 Belmore Road, Riverwood NSW 2210",
              licenseNumber: "10128535",
      abn:"ABN 93 660 016 517",
        conjunctionAgent:"Yes"
            },
            {
              name: "Suti Investments Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "166 Belmore Road, Riverwood NSW 2210",
              licenseNumber: "10094072",
      abn:"ABN 45 620 049 292",
        conjunctionAgent:"Yes"
            },
            {
              name: "Anodos Enterprises Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "848 King Georges Road, South Hurstville NSW 2221",
              licenseNumber: "10089089",
      abn:"ABN 19 635 299 526",
        conjunctionAgent:"Yes"
            },
            {
              name: "I Sayed Investments Pty Ltd (Licenced user of Ausrealty)",
              gst: "Yes",
              companyAddress: "848 King Georges Road, South Hurstville NSW 2221",
              licenseNumber: "10119295",
      abn:"ABN 53 647 496 222",
        conjunctionAgent:"Yes"
            },
          ];
          return companies.find((item) => item.name === company);
        }
        const data = getCompanyData(company);
        console.log(data)
        user.name = name;
        user.mobile = mobile;
        user.gst=data?.gst;
        user.companyAddress=data?.companyAddress;
        user.licenseNumber=data?.licenseNumber;
        user.company = company;
        user.title = title;
        user.conjunctionAgent = data?.conjunctionAgent;
        user.abn = data?.abn;
        await user.save();
        res.status(200).json({success: true, data: user});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
};