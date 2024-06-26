import { AreaChart, Badge, BadgeDelta, Card, Flex } from '@tremor/react'
import { badgeType, chartColor, formatDataToChart } from '../utils'
import { useFetchRates } from '../hooks/useFetchRates'
import { Loader } from './Loader'
import { useTranslation } from 'react-i18next'

export const Chart = (props: { address: string; userId: number }) => {
  const { t } = useTranslation()
  const { data, isLoading } = useFetchRates(props)

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" className="h-screen">
        <Loader />
      </Flex>
    )
  }
  if (!data?.length) {
    return (
      <Flex justifyContent="center" alignItems="center" className="h-screen">
        <h2 className="text-2xl text-slate-600">{t('label.noJettons')}</h2>
      </Flex>
    )
  }

  if (data) {
    return (
      <div>
        <h1 className="w-full text-3xl text-slate-700 text-center">
          {t('label.yourJettons')}
        </h1>
        {data
          ? data.map(obj => (
              <Card className="max-w-[550px] mt-4">
                <Flex justifyContent="between" alignItems="center">
                  <Flex
                    justifyContent="start"
                    alignItems="center"
                    className="w-6/12"
                  >
                    <div className="w-[2rem]">
                      <img
                        src={obj.image}
                        alt={obj.symbol}
                        className="shadow rounded-full max-w-full h-auto align-middle border-none"
                      />
                    </div>
                    <h1 className="text-2xl text-slate-500 pl-2">
                      {obj.symbol}
                    </h1>
                  </Flex>
                  {obj.pnlPercentage !== 0 ? (
                    <div className="flex">
                      <h3 className="text-xl text-slate-500 pr-2">{}</h3>
                      <BadgeDelta
                        size="lg"
                        deltaType={badgeType(obj.pnlPercentage)}
                      >
                        {obj.pnlPercentage > 0
                          ? t('label.profit', { percent: obj.pnlPercentage })
                          : t('label.loss', { percent: obj.pnlPercentage })}
                      </BadgeDelta>
                    </div>
                  ) : (
                    <Badge size="lg" color="cyan">
                      {t('label.withoutChanges')}
                    </Badge>
                  )}
                </Flex>
                <AreaChart
                  className="mt-1 h-40"
                  data={formatDataToChart(obj)}
                  colors={
                    obj.symbol == 'USD₮'
                      ? ['cyan']
                      : chartColor(formatDataToChart(obj))
                  }
                  index="date"
                  categories={['Price']}
                  // valueFormatter={valueFormatter}
                  yAxisWidth={30}
                  showXAxis={false}
                  showYAxis={false}
                  showLegend={false}
                />
              </Card>
            ))
          : null}
      </div>
    )
  }
}
