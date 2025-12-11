const flexReward = (data: any) => {

  const currentDate = new Date();

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const thaiMonth = thaiMonths[currentDate.getMonth()];
  const thaiYear = currentDate.getFullYear() + 543;
  const thaiDay = currentDate.getDate();
  const thaiHours = currentDate.getHours();
  const thaiMinutes = currentDate.getMinutes();

  const formattedDateTime = `${thaiDay} ${thaiMonth} ${thaiYear} เวลา ${thaiHours}.${thaiMinutes}`;

  const giftImage = '/images/message/gift-star.png'

  return (
    {
      type: 'flex',
      altText: `คุณได้แลก Point ${data.title} `,
      contents: {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "position": "relative",
          "height": "50px",
          "contents": [
            {
              "type": "image",
              "url": `${process.env.NEXT_PUBLIC_APP_URL}/${giftImage}`,
              "size": "lg",
              "aspectRatio": "16:9",
              "position": "absolute",
              "offsetTop": "none",
              "offsetEnd": "none"
            },
            {
              "type": "text",
              "text": "GET REWARD",
              "weight": "bold",
              "color": "#FFFFFFFF",
              "wrap": false,
              "style": "normal",
              "decoration": "underline",
              "position": "absolute",
              "offsetTop": "15px",
              "offsetStart": "15px",
              "contents": []
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": `${data.thumbnail}`,
              "size": "full"
            },
            {
              "type": "text",
              "text": "ขอแสดงความยินดี",
              "weight": "bold",
              "align": "center",
              "contents": []
            },
            {
              "type": "text",
              "text": `ยูสเซอร์ : ${data.tel}`,
              "weight": "bold",
              "align": "center",
              "contents": []
            },
            {
              "type": "text",
              "text": `แลก Point : ${data.title}`,
              "weight": "bold",
              "align": "center",
              "contents": []
            },
            {
              "type": "text",
              "text": formattedDateTime,
              "weight": "regular",
              "size": "xs",
              "color": "#B3B3B3FF",
              "align": "center",
              "contents": []
            },
            {
              "type": "text",
              "text": "กรุณาติดต่อแอดมินเพื่อรับของรางวัล",
              "weight": "regular",
              "size": "xs",
              "color": "#B3B3B3FF",
              "align": "center",
              "wrap": true,
              "offsetTop": "10px",
              "contents": []
            }
          ]
        },
        "styles": {
          "header": {
            "backgroundColor": "#3EB982"
          }
        }
      }
    }
  )
}

export default flexReward

