import type { Metadata } from "next";

import serverRead from "@/action/crud/serverRead";
import ContentPage from "@/components/liff/marketing/ContentPage";

type PropsParams = {
  params: {
    slug: string;
  }
}

export async function generateMetadata({
  params: { slug }
}: PropsParams): Promise<Metadata> {
  const meta = await serverRead('tbl_online_marketings', slug)

  if (!meta) return {}

  return {
    title: meta.title,
    description: meta.excerpt,
    openGraph: {
      images: meta.thumbnail
    }
  }
}


export default async function Page({ params: { slug } }: PropsParams) {

  const data = await serverRead('tbl_online_marketings', slug)

  return (
    <ContentPage data={data} />
  )

}



