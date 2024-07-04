import { AreaChart, Badge, BadgeDelta, Card, Flex } from '@tremor/react'
import { badgeType, chartColor, formatDataToChart } from '../../utils'
import { useFetchRates } from '../../hooks/useFetchRates'
import { Loader } from '..'
import { useTranslation } from 'react-i18next'
import s from './style.module.css'
import { useEffect, useRef } from 'react'
import { TGetWalletDataResponse } from '../../types'

export const Charts = (props: {
  walletsCount: number
  userId: number
  onUpdate?: (data: TGetWalletDataResponse) => void
}) => {
  const { t } = useTranslation()
  const walletsCountRef = useRef(0)
  const { data, isLoading } = useFetchRates({
    walletsCount: 0,
    userId: props.userId,
  })

  useEffect(() => {
    if (
      walletsCountRef.current !== 0 ||
      (walletsCountRef.current === 0 && props.walletsCount !== 0)
    ) {
      walletsCountRef.current = props.walletsCount
    }
  }, [props.walletsCount])

  useEffect(() => {
    if (props.onUpdate && data) {
      props.onUpdate(data)
    }
  }, [data])

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" className="h-screen">
        <Loader />
      </Flex>
    )
  }

  if (!data) {
    return (
      <Flex justifyContent="center" alignItems="center">
        <h2 className="text-2xl text-slate-600">{t('label.error')}</h2>
      </Flex>
    )
  }

  if (!data.jettons.length) {
    return (
      <Flex justifyContent="center" alignItems="center">
        <h2 className="text-2xl text-slate-600">{t('label.noJettons')}</h2>
      </Flex>
    )
  }

  if (data) {
    return (
      <div className={s.charts}>
        <h1 className="w-full text-3xl text-slate-700 text-center">
          {t('label.yourJettons')}
        </h1>
        {data
          ? data.jettons.map(obj => (
              <Card className="max-w-[550px] mt-4" key={obj.address}>
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
