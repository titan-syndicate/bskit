import { useParams, Navigate } from 'react-router-dom'
import { Heading } from '../../components/heading'
import { Avatar } from '../../components/avatar'
import { getOrder } from '../../data'
import { useEffect, useState } from 'react'

interface Order {
  id: number
  url: string
  date: string
  amount: {
    usd: string
    cad: string
    fee: string
    net: string
  }
  payment: {
    transactionId: string
    card: {
      number: string
      type: string
      expiry: string
    }
  }
  customer: {
    name: string
    email: string
    address: string
    country: string
    countryFlagUrl: string
  }
  event: {
    id: string
    name: string
    status: string
    date: string
    time: string
    location: string
    imgUrl: string
  }
}

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getOrder(id).then((data) => {
        setOrder(data)
        setLoading(false)
      })
    }
  }, [id])

  if (!id) {
    return <Navigate to="/orders" replace />
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!order) {
    return <Navigate to="/orders" replace />
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Order #{order.id}</Heading>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Customer</h2>
          <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{order.customer.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Address</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{order.customer.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Country</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{order.customer.country}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Event</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar src={order.event.imgUrl} className="size-16" />
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">{order.event.name}</div>
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {order.event.date} at {order.event.time}
              </div>
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{order.event.location}</div>
            </div>
          </div>
          <h2 className="mt-8 text-base font-semibold text-zinc-900 dark:text-white">Payment</h2>
          <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Transaction ID</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{order.payment.transactionId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Card</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">
                {order.payment.card.type} ending in {order.payment.card.number.slice(-4)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Expiry</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{order.payment.card.expiry}</dd>
            </div>
          </dl>
          <h2 className="mt-8 text-base font-semibold text-zinc-900 dark:text-white">Amount</h2>
          <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">US{order.amount.usd}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Fee</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">US{order.amount.fee}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Net</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">US{order.amount.net}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}