import CircularProgress from "@mui/material/CircularProgress"

const Loading = () => {
  return (
    <div className='w-full max-w-[430px] min-h-screen overflow-y-auto mx-auto bg-white'>
      <span className=" absolute -translate-y-1/2 -translate-x-1/2 text-xl top-1/2 left-1/2"><CircularProgress /></span>
    </div>
  )
}

export default Loading
