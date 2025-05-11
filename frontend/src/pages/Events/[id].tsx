import { useParams, Navigate } from 'react-router-dom'
import { Heading } from '../../components/heading'
import { getEvent, getEventOrders } from '../../data'

export default function EventDetails() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to="/events" replace />
  }

  const event = getEvent(id)
  if (!event) {
    return <Navigate to="/events" replace />
  }

  const orders = getEventOrders(id)

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>{event.name}</Heading>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <img
            src={event.imgUrl}
            alt=""
            className="aspect-[3/2] w-full rounded-xl bg-zinc-100 object-cover dark:bg-zinc-800"
          />
          <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Date</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{event.date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Time</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{event.time}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{event.location}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{event.status}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Orders</h2>
          <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((order) => (
              <li key={order.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {order.customer.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{order.date}</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    US{order.amount.usd}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}