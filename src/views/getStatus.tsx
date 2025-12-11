import Chip from "@mui/material/Chip";

type DataStatus = {
  label?: string;
  icon?: string;
  color?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success";
  variant?: "filled" | "outlined";
}

type PropsStatus = {
  status: string;
}

const GetStatus = ({ status }: PropsStatus) => {

  const chipProps: DataStatus = {}

  switch (status) {

    case "pending":
      chipProps.label = "รอตรวจสอบ";
      chipProps.icon = "tabler-alert-circle";
      chipProps.color = "warning";
      break;

    case "confirm":
      chipProps.label = "ยืนยัน";
      chipProps.icon = "tabler-circle-check"
      chipProps.color = "success";
      break;

    case "approved":
      chipProps.label = "สำเร็จ";
      chipProps.icon = "tabler-circle-check"
      chipProps.color = "success";
      break;

    case "rejected":
      chipProps.label = "ไม่สำเร็จ";
      chipProps.icon = "tabler-circle-x"
      chipProps.color = "error";
      break;


    case "publish":
      chipProps.label = "เปิดใช้งาน";
      chipProps.icon = "tabler-circle-check"
      chipProps.color = "success";
      break;

    case "expire":
      chipProps.label = "หมดอายุ";
      chipProps.icon = "tabler-circle-x"
      chipProps.color = "error";
      break;

    default:
      chipProps.label = "ไม่พบสถานะ";
      chipProps.icon = "tabler-circle-x";
      chipProps.color = "error";
      break;
  }

  return (
    <>
      <Chip
        label={chipProps.label}
        icon={<i className={chipProps.icon} />}
        color={chipProps.color}
        variant="tonal" // Assuming you want outlined variant by default
      />
    </>
  )
}

export default GetStatus;
