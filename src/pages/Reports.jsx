import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, TrendingUp, Receipt, Wallet as WalletIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation } from '../contexts/LanguageContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Reports() {
  const { currentUser } = useAuth()
  const { t, language } = useTranslation()
  const { documents: wallets, subscribeToQuery: subWallets } = useFirestore('wallets')
  const { documents: transactions, subscribeToQuery: subTransactions } = useFirestore('transactions')

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    if (!currentUser) return
    const userFilter = [{ field: 'userId', operator: '==', value: currentUser.uid }]
    const unsub1 = subWallets(userFilter)
    const unsub2 = subTransactions(userFilter)
    return () => { unsub1(); unsub2() }
  }, [currentUser])

  const [reportYear, reportMonth] = selectedMonth.split('-').map(Number)

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.createdAt?.seconds) return false
      const d = new Date(tx.createdAt.seconds * 1000)
      return d.getFullYear() === reportYear && d.getMonth() + 1 === reportMonth
    })
  }, [transactions, reportYear, reportMonth])

  const monthlySpending = useMemo(() => {
    return monthlyTransactions
      .filter((tx) => tx.type === 'purchase' || tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [monthlyTransactions])

  const monthlyIncome = useMemo(() => {
    return monthlyTransactions
      .filter((tx) => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [monthlyTransactions])

  const netBalance = monthlyIncome - monthlySpending
  const daysInMonth = new Date(reportYear, reportMonth, 0).getDate()
  const dailyAvg = daysInMonth > 0 ? monthlySpending / daysInMonth : 0

  const categoryBreakdown = useMemo(() => {
    const cats = {}
    monthlyTransactions
      .filter((tx) => tx.type === 'purchase' || tx.type === 'withdrawal')
      .forEach((tx) => {
        const cat = tx.description || t('reports.other')
        cats[cat] = (cats[cat] || 0) + tx.amount
      })
    return Object.entries(cats).sort((a, b) => b[1] - a[1])
  }, [monthlyTransactions, t])

  // Last 6 months trend
  const trendData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(reportYear, reportMonth - 1 - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const spending = transactions
        .filter((tx) => {
          if (!tx.createdAt?.seconds) return false
          const td = new Date(tx.createdAt.seconds * 1000)
          return td.getFullYear() === y && td.getMonth() + 1 === m && (tx.type === 'purchase' || tx.type === 'withdrawal')
        })
        .reduce((sum, tx) => sum + tx.amount, 0)
      const income = transactions
        .filter((tx) => {
          if (!tx.createdAt?.seconds) return false
          const td = new Date(tx.createdAt.seconds * 1000)
          return td.getFullYear() === y && td.getMonth() + 1 === m && tx.type === 'deposit'
        })
        .reduce((sum, tx) => sum + tx.amount, 0)
      const locale = language === 'en' ? 'en-US' : 'tr-TR'
      months.push({
        label: d.toLocaleDateString(locale, { month: 'short' }),
        spending,
        income,
      })
    }
    return months
  }, [transactions, reportYear, reportMonth, language])

  const maxTrendValue = Math.max(...trendData.map((m) => Math.max(m.spending, m.income)), 1)

  const changeMonth = (dir) => {
    const d = new Date(reportYear, reportMonth - 1 + dir, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const locale = language === 'en' ? 'en-US' : 'tr-TR'
  const monthName = new Date(reportYear, reportMonth - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  if (wallets.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('reports.title')}</h1>
          <p className="text-gray-500 dark:text-swype-silver mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="text-center py-20">
          <Receipt size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('reports.noData')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1 mb-4">{t('reports.noDataDesc')}</p>
          <Link to="/wallet">
            <Button variant="gold">
              <WalletIcon size={16} className="mr-1.5" />
              {t('reports.goToWallet')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 animate-in">
        <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('reports.title')}</h1>
        <p className="text-gray-500 dark:text-swype-silver mt-1">{t('reports.subtitle')}</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-3 mb-6 animate-in">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-swype-mid/50 rounded-sm transition-colors cursor-pointer">
          <ChevronLeft size={18} className="text-gray-500 dark:text-swype-silver" />
        </button>
        <span className="text-sm font-semibold text-swype-dark dark:text-swype-cream min-w-[160px] text-center capitalize">{monthName}</span>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-swype-mid/50 rounded-sm transition-colors cursor-pointer">
          <ChevronRight size={18} className="text-gray-500 dark:text-swype-silver" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in stagger">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight size={16} className="text-danger" />
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reports.spending')}</p>
          </div>
          <p className="text-xl font-bold text-danger">
            {monthlySpending.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={16} className="text-success" />
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reports.income')}</p>
          </div>
          <p className="text-xl font-bold text-success">
            {monthlyIncome.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className={netBalance >= 0 ? 'text-success' : 'text-danger'} />
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reports.netBalance')}</p>
          </div>
          <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
            {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={16} className="text-swype-gold" />
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reports.dailyAvg')}</p>
          </div>
          <p className="text-xl font-bold text-swype-dark dark:text-swype-cream">
            {dailyAvg.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
          </p>
        </Card>
      </div>

      {/* 6-Month Trend Chart */}
      <Card className="p-5 mb-6 animate-in">
        <h3 className="font-semibold text-sm text-swype-dark dark:text-swype-cream mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-swype-gold" />
          {t('reports.trend')}
        </h3>
        <div className="flex items-end gap-3 h-40">
          {trendData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end h-28">
                <div
                  className="flex-1 bg-danger/70 rounded-t-sm transition-all"
                  style={{ height: `${maxTrendValue > 0 ? (m.spending / maxTrendValue) * 100 : 0}%`, minHeight: m.spending > 0 ? '4px' : '0' }}
                  title={`${t('reports.spending')}: ${m.spending.toLocaleString(locale)} TL`}
                />
                <div
                  className="flex-1 bg-success/70 rounded-t-sm transition-all"
                  style={{ height: `${maxTrendValue > 0 ? (m.income / maxTrendValue) * 100 : 0}%`, minHeight: m.income > 0 ? '4px' : '0' }}
                  title={`${t('reports.income')}: ${m.income.toLocaleString(locale)} TL`}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-swype-silver">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-danger/70 rounded-sm" />
            <span className="text-[10px] text-gray-500 dark:text-swype-silver">{t('reports.spending')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-success/70 rounded-sm" />
            <span className="text-[10px] text-gray-500 dark:text-swype-silver">{t('reports.income')}</span>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="p-5 mb-6 animate-in">
          <h3 className="font-semibold text-sm text-swype-dark dark:text-swype-cream mb-3">{t('reports.categoryBreakdown')}</h3>
          <div className="space-y-2">
            {categoryBreakdown.map(([cat, amount]) => {
              const pct = monthlySpending > 0 ? (amount / monthlySpending) * 100 : 0
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-swype-silver">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 dark:text-swype-silver/70">%{Math.round(pct)}</span>
                      <span className="font-medium text-swype-dark dark:text-swype-cream">{amount.toLocaleString(locale)} TL</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-swype-dark/50 rounded-full overflow-hidden">
                    <div className="h-full bg-swype-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* All Transactions */}
      <Card className="p-5 animate-in">
        <h3 className="font-semibold text-sm text-swype-dark dark:text-swype-cream mb-3">{t('reports.allTransactions')}</h3>
        {monthlyTransactions.length === 0 ? (
          <p className="text-center text-xs text-gray-400 dark:text-swype-silver/70 py-6">{t('reports.noTransactions')}</p>
        ) : (
          <div className="space-y-2">
            {monthlyTransactions
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
              .map((tx) => {
                const isIncome = tx.type === 'deposit'
                const date = tx.createdAt?.seconds
                  ? new Date(tx.createdAt.seconds * 1000).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
                  : ''
                return (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 bg-soft-gray dark:bg-swype-dark/30 rounded-sm">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isIncome ? 'bg-success/10' : 'bg-danger/10'}`}>
                        {isIncome ? <ArrowUpRight size={14} className="text-success" /> : <ArrowDownRight size={14} className="text-danger" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-swype-dark dark:text-swype-cream">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 dark:text-swype-silver/70">{date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString(locale)} TL
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </Card>
    </div>
  )
}
