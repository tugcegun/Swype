import { useState, useEffect, useMemo } from 'react'
import { Plus, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Receipt, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation } from '../contexts/LanguageContext'
import WalletCard from '../components/wallet/WalletCard'
import AddWalletModal from '../components/wallet/AddWalletModal'
import AddFundsModal from '../components/wallet/AddFundsModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LordIcon from '../components/ui/LordIcon'
import LottieLoader from '../components/ui/LottieLoader'
import { LORDICON } from '../constants/icons'

export default function Wallet() {
  const { currentUser } = useAuth()
  const { t, language } = useTranslation()
  const { documents: wallets, loading, addDocument: addWallet, updateDocument: updateWallet, deleteDocument: deleteWallet, subscribeToQuery: subWallets } = useFirestore('wallets')
  const { documents: transactions, addDocument: addTransaction, subscribeToQuery: subTransactions } = useFirestore('transactions')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [fundsModal, setFundsModal] = useState({ open: false, wallet: null, type: 'deposit' })
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

  const handleAddWallet = async (data) => {
    await addWallet({ ...data, userId: currentUser.uid })
  }

  const handleDeleteWallet = async (wallet) => {
    if (window.confirm(t('wallet.deleteConfirm', { name: wallet.name }))) {
      await deleteWallet(wallet.id)
    }
  }

  const handleFundsSubmit = async (data) => {
    const wallet = wallets.find((w) => w.id === data.walletId)
    if (!wallet) return

    const newBalance = data.type === 'deposit'
      ? wallet.balance + data.amount
      : wallet.balance - data.amount

    await updateWallet(data.walletId, { balance: newBalance })
    await addTransaction({
      userId: currentUser.uid,
      walletId: data.walletId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      items: [],
    })
  }

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0)

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

  const changeMonth = (dir) => {
    const d = new Date(reportYear, reportMonth - 1 + dir, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const locale = language === 'en' ? 'en-US' : 'tr-TR'
  const monthName = new Date(reportYear, reportMonth - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('wallet.title')}</h1>
          <p className="text-gray-500 dark:text-swype-silver mt-1">{t('wallet.subtitle')}</p>
        </div>
        <Button variant="gold" size="md" onClick={() => setAddModalOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          {t('wallet.newWallet')}
        </Button>
      </div>

      {/* Total Balance */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-swype-gold/10 to-swype-terra/10 dark:from-swype-gold/5 dark:to-swype-terra/5 animate-in" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-swype-gold rounded-xl flex items-center justify-center">
            <LordIcon
              src={LORDICON.WALLET}
              trigger="loop"
              size={28}
              colors="primary:#ffffff,secondary:#ffffff"
              fallback={<WalletIcon size={24} className="text-white" />}
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('wallet.totalBalance')}</p>
            <p className="text-3xl font-bold text-swype-dark dark:text-swype-cream">
              {totalBalance.toLocaleString(locale, { minimumFractionDigits: 2 })} <span className="text-lg font-normal text-swype-silver">TL</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Wallets Grid */}
      {loading ? (
        <div className="text-center py-20">
          <LottieLoader size={40} text={t('common.loading')} />
        </div>
      ) : wallets.length === 0 ? (
        <div className="text-center py-16">
          <WalletIcon size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('wallet.noWallets')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1 mb-4">{t('wallet.noWalletsDesc')}</p>
          <Button variant="gold" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} className="mr-1.5" />
            {t('wallet.createFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 stagger">
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              onAddFunds={(wallet, type) => setFundsModal({ open: true, wallet, type })}
              onDelete={handleDeleteWallet}
            />
          ))}
        </div>
      )}

      {/* Monthly Report Summary */}
      {wallets.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-lg font-bold text-deep-navy dark:text-swype-cream flex items-center gap-2">
              <Receipt size={20} className="text-swype-gold" />
              {t('wallet.monthlyReport')}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-swype-mid/50 rounded-sm transition-colors cursor-pointer">
                <ChevronLeft size={16} className="text-gray-500 dark:text-swype-silver" />
              </button>
              <span className="text-sm font-medium text-swype-dark dark:text-swype-cream min-w-[120px] text-center capitalize">{monthName}</span>
              <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-swype-mid/50 rounded-sm transition-colors cursor-pointer">
                <ChevronRight size={16} className="text-gray-500 dark:text-swype-silver" />
              </button>
            </div>
          </div>

          {/* Report Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight size={16} className="text-danger" />
                <p className="text-xs text-gray-500 dark:text-swype-silver">{t('wallet.spending')}</p>
              </div>
              <p className="text-xl font-bold text-danger">
                {monthlySpending.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={16} className="text-success" />
                <p className="text-xs text-gray-500 dark:text-swype-silver">{t('wallet.income')}</p>
              </div>
              <p className="text-xl font-bold text-success">
                {monthlyIncome.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
              </p>
            </Card>
          </div>

          {/* Link to detailed reports */}
          <Link to="/reports">
            <Card className="p-4 mb-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-swype-gold" />
                  <span className="text-sm font-medium text-swype-dark dark:text-swype-cream">{t('wallet.detailedReport')}</span>
                </div>
                <ArrowRight size={16} className="text-swype-silver" />
              </div>
            </Card>
          </Link>
        </>
      )}

      {/* Modals */}
      <AddWalletModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddWallet} />
      <AddFundsModal
        isOpen={fundsModal.open}
        onClose={() => setFundsModal({ open: false, wallet: null, type: 'deposit' })}
        wallet={fundsModal.wallet}
        type={fundsModal.type}
        onSubmit={handleFundsSubmit}
      />
    </div>
  )
}
