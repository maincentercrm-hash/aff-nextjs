const affURL = (code: string) => {
  return `${process.env.NEXT_PUBLIC_AFF_URL}?ref=${code}&openExternalBrowser=1`
}

export default affURL
