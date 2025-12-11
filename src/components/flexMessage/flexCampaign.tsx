const flexCampaign = (data: any, id: string, thumbnail: string) => {

  return (
    {
      type: 'flex',
      altText: `${data.title}`,
      contents: {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": `${thumbnail}`,
          "size": "full",
          "aspectRatio": "1:1",
          "aspectMode": "cover"
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "contents": [
            {
              "type": "text",
              "text": `${data.title}`,
              "weight": "bold",
              "size": "lg",
              "wrap": true,
              "contents": []
            },
            {
              "type": "text",
              "text": `${data.detail}`,
              "margin": "md",
              "wrap": true,
              "contents": []
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "flex": 1,
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "ลิงค์สร้างรายได้",
                "uri": `${process.env.LIFF_URL}?campaign=${id}`
              },
              "color": "#069C00FF",
              "style": "primary",
              "gravity": "bottom"
            }
          ]
        }
      }


    }
  )
}

export default flexCampaign

