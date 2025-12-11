
import { toZonedTime } from 'date-fns-tz';

type PropsDate = {
  isoDate: string | null;
}

const GetDateTimeOnly = ({ isoDate }: PropsDate) => {

  if (!isoDate) {
    return '-'
  }

  const timeZone = 'Asia/Bangkok';

  const date = toZonedTime(new Date(isoDate), timeZone);

  // Months array in Thai
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const day = date.getDate();

  const month = months[date.getMonth()];

  const year = date.getFullYear();

  const hours = date.getHours();

  let minutes = date.getMinutes();

  minutes = minutes < 10 ? parseInt("0" + minutes) : minutes;

  // Format the time in 24-hour format
  const time = `${hours}:${minutes}`;

  return (
    <>
      {day} {month} {year} / {time} น.
    </>

  )
    ;
}

export default GetDateTimeOnly
