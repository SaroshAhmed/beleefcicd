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
        const assignABN = (company) => {
            const companyABNMap = {
              "Ausrealty (Riverwood) Pty Ltd (Licenced user of Ausrealty)":
                "ABN 97 610 838 643",
              "KK Property Services Pty Ltd (Licenced user of Ausrealty)":
                "ABN 32 626 591 642",
              "I.M Group Pty Ltd (Licenced user of Ausrealty)": "ABN 58 634 408 610",
              "MRL Property Group Pty Ltd (Licenced user of Ausrealty)":
                "ABN 66 648 514 498",
              "Anodos Enterprises Pty Ltd (Licenced user of Ausrealty)":
                "ABN 19 635 299 526",
              "I Sayed Investments Pty Ltd (Licenced user of Ausrealty)":
                "ABN 53 647 496 222",
              "Suti Investments Pty Ltd (Licenced user of Ausrealty)":
                "ABN 45 620 049 292",
              "Hani Property Services Pty Ltd (Licenced user of Ausrealty)":
                "ABN 93 660 016 517",
            };
          
            return companyABNMap[company] || null;
          };
          const isConjunctionAgent = (company) => {
            const conjunctionAgents = [
              "Anodos Enterprises Pty Ltd (Licenced user of Ausrealty)",
              "I Sayed Investments Pty Ltd (Licenced user of Ausrealty)",
              "Suti Investments Pty Ltd (Licenced user of Ausrealty)",
              "Hani Property Services Pty Ltd (Licenced user of Ausrealty)",        
            ];
            return conjunctionAgents.includes(company)?'Yes':'No';
          }          
        user.name = name;
        user.mobile = mobile;
        user.company = company;
        user.title = title;
        user.conjunctionAgent = isConjunctionAgent(company);
        user.abn = assignABN(company);
        await user.save();
        res.status(200).json({success: true, data: user});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
};