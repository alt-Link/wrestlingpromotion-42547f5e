
export const getBrandColor = (brand: string) => {
  switch (brand) {
    case "Raw": return "bg-red-500 text-white";
    case "SmackDown": return "bg-blue-500 text-white";
    case "NXT": return "bg-yellow-500 text-black";
    case "PPV": return "bg-purple-500 text-white";
    case "Special": return "bg-green-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

export const getFrequencyIcon = (frequency: string) => {
  switch (frequency) {
    case "weekly": return "🗓️";
    case "monthly": return "📅";
    case "one-time": return "⭐";
    default: return "📝";
  }
};
