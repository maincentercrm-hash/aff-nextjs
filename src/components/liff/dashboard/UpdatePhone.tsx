import React from "react";

import PhoneInput from "./PhoneInput";

type PropsCampaign = {
  campaign: string | null;
  activeId: string;
}

const UpdatePhone = ({ campaign, activeId }: PropsCampaign) => {
  // Assuming you have campaign and activeId values here


  return <PhoneInput campaign={campaign} activeId={activeId} />;
};

export default UpdatePhone;
