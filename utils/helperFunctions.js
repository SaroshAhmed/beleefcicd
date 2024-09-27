const formatCurrency = (value) => {
  if (value === undefined || value === null) return "N/A";
  return "$" + new Intl.NumberFormat().format(value);
};

module.exports=formatCurrency