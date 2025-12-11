
import { NextResponse } from "next/server";

import flexCampaign from "@/components/flexMessage/flexCampaign";

export async function POST(req: Request) {

  const { data, id, thumbnail } = await req.json();

  const UsersArray = data.users.map((obj: { userId: any; }) => obj.userId);

  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${process.env.LINE_ACCESS_TOKEN}`);

  //return NextResponse.json({ userId: userId, qty: qty });

  const raw = JSON.stringify({
    "to": UsersArray,
    "messages": [
      flexCampaign(data, id, thumbnail)
    ]
  });


  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow", // Specify the correct type for redirect
  };

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/multicast", requestOptions);
    const data = await response.json();


    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" });
  }



}
