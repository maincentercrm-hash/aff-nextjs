
import { NextResponse } from "next/server";

import flexReward from "@/components/flexMessage/flexReward";

export async function POST(req: Request) {

  const { userId, data } = await req.json();

  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${process.env.LINE_ACCESS_TOKEN}`);

  //return NextResponse.json({ userId: userId, qty: qty });

  const raw = JSON.stringify({
    "to": userId,
    "messages": [
      flexReward(data)
    ]
  });


  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow", // Specify the correct type for redirect
  };

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", requestOptions);
    const data = await response.json();


    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" });
  }



}
