import EarningReportsWithTabs from '@/components/liff/report/EarningReportsWithTabs'
import { getServerMode } from '@core/utils/serverHelpers'

const GraphData = () => {
  const serverMode = getServerMode()


  return <EarningReportsWithTabs serverMode={serverMode} />
}

export default GraphData
