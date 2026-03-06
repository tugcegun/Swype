import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, ShoppingBag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation } from '../contexts/LanguageContext'
import CartItem from '../components/cart/CartItem'
import CheckoutModal from '../components/cart/CheckoutModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LottieLoader from '../components/ui/LottieLoader'

export default function Cart() {
  const { currentUser } = useAuth()
  const { t, language } = useTranslation()
  const { documents: cartItems, loading, updateDocument, deleteDocument, subscribeToQuery: subCart } = useFirestore('cart_items')
  const { documents: wallets, subscribeToQuery: subWallets } = useFirestore('wallets')
  const { addDocument: addTransaction } = useFirestore('transactions')
  const { updateDocument: updateWallet } = useFirestore('wallets')
  const { addDocument: addWardrobe } = useFirestore('wardrobe_items')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  useEffect(() => {
    if (!currentUser) return
    const userFilter = [{ field: 'userId', operator: '==', value: currentUser.uid }]
    const unsub1 = subCart(userFilter)
    const unsub2 = subWallets(userFilter)
    return () => { unsub1(); unsub2() }
  }, [currentUser])

  const handleWalletChange = async (itemId, walletId) => {
    await updateDocument(itemId, { walletId })
  }

  const handleRemove = async (item) => {
    if (window.confirm(t('cart.removeConfirm', { name: item.productName }))) {
      await deleteDocument(item.id)
    }
  }

  const handleAddToWardrobe = async (item) => {
    await addWardrobe({
      userId: currentUser.uid,
      name: item.productName,
      category: 'Diger',
      color: '',
      season: 'Tum Mevsimler',
      brand: item.brand || '',
      imageUrl: item.imageUrl || '',
      price: item.price || 0,
      wearCount: 0,
      styleTags: [],
    })
    await deleteDocument(item.id)
  }

  const handleClearCart = async () => {
    if (!window.confirm(t('cart.clearConfirm'))) return
    for (const item of cartItems) {
      await deleteDocument(item.id)
    }
  }

  const handleCheckout = async (walletGroups) => {
    for (const [walletId, group] of Object.entries(walletGroups)) {
      const wallet = group.wallet
      if (!wallet) continue

      const newBalance = wallet.balance - group.total
      await updateWallet(walletId, { balance: newBalance })

      await addTransaction({
        userId: currentUser.uid,
        walletId,
        type: 'purchase',
        amount: group.total,
        description: t('cart.purchase', { count: group.items.length }),
        items: group.items.map((i) => ({ productName: i.productName, price: i.price })),
      })

      for (const item of group.items) {
        await addWardrobe({
          userId: currentUser.uid,
          name: item.productName,
          category: 'Diger',
          color: '',
          season: 'Tum Mevsimler',
          brand: item.brand || '',
          imageUrl: item.imageUrl || '',
          price: item.price || 0,
          wearCount: 0,
          styleTags: [],
        })
      }
    }

    for (const item of cartItems) {
      await deleteDocument(item.id)
    }
  }

  const totalAmount = cartItems.reduce((sum, i) => sum + (i.price || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('cart.title')}</h1>
          <p className="text-gray-500 dark:text-swype-silver mt-1">
            {cartItems.length > 0 ? t('cart.itemCount', { count: cartItems.length }) : t('cart.empty')}
          </p>
        </div>
        {cartItems.length > 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClearCart}>
              <Trash2 size={14} className="mr-1" />
              {t('cart.clear')}
            </Button>
            <Button variant="success" size="md" onClick={() => setCheckoutOpen(true)}>
              <ShoppingCart size={16} className="mr-1.5" />
              {t('cart.buy')} ({totalAmount.toLocaleString(locale)} TL)
            </Button>
          </div>
        )}
      </div>

      {/* Cart Items */}
      {loading ? (
        <div className="text-center py-20">
          <LottieLoader size={40} text={t('common.loading')} />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('cart.empty')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1">
            {t('cart.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              wallets={wallets}
              onWalletChange={handleWalletChange}
              onRemove={handleRemove}
              onAddToWardrobe={handleAddToWardrobe}
            />
          ))}

          {/* Total */}
          <Card className="p-4 mt-4 animate-in">
            <div className="flex items-center justify-between">
              <span className="font-medium text-swype-dark dark:text-swype-cream">{t('cart.total')}</span>
              <span className="text-xl font-bold text-swype-dark dark:text-swype-cream">
                {totalAmount.toLocaleString(locale)} TL
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        wallets={wallets}
        onCheckout={handleCheckout}
      />
    </div>
  )
}
