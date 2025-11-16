import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample data (replace with API calls)
const SAMPLE_RESTAURANTS = [
  {
    id: 'r1',
    name: 'Spice Hub',
    city: 'Dehradun',
    address: 'Court Road, Dehradun',
    avg_rating: 4.6,
    votes: 420,
    cuisines: ['Indian', 'North Indian'],
    price: 2,
    img: 'https://images.unsplash.com/photo-1541544180-7a06b5d6f6b6?auto=format&fit=crop&w=800&q=60',
    timing: '10:00 - 23:00',
    website: 'https://example.com/spicehub'
  },
  {
    id: 'r2',
    name: 'Cafe Blue',
    city: 'Rishikesh',
    address: 'Laxman Jhula Road',
    avg_rating: 4.2,
    votes: 310,
    cuisines: ['Cafe', 'Continental'],
    price: 1,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
    timing: '08:00 - 21:00',
    website: 'https://example.com/cafeblue'
  },
  {
    id: 'r3',
    name: 'Mountain Bites',
    city: 'Mussoorie',
    address: 'Mall Road',
    avg_rating: 4.4,
    votes: 289,
    cuisines: ['Continental', 'Cafe'],
    price: 2,
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=60',
    timing: '09:00 - 22:00',
    website: 'https://example.com/mountainbites'
  }
  // ... you can expand or load from API
];

function StarRating({ value, size = 14 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center space-x-1 text-yellow-500">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width={size} height={size} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 15l-5.878 3.09L5.5 11.18 1 7.18l6.061-.909L10 1l2.939 5.271L19 7.18l-4.5 4L15.878 18.09 10 15z" />
        </svg>
      ))}
      {half && (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M10 15l-5.878 3.09L5.5 11.18 1 7.18l6.061-.909L10 1l2.939 5.271L19 7.18l-4.5 4L15.878 18.09 10 15z" fill="url(#half)" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 15l-5.878 3.09L5.5 11.18 1 7.18l6.061-.909L10 1l2.939 5.271L19 7.18l-4.5 4L15.878 18.09 10 15z" />
        </svg>
      ))}
    </div>
  );
}

function PricePills({ price }) {
  return (
    <div className="flex items-center space-x-1 text-gray-600">
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={`w-3 h-3 rounded-sm ${i < price ? 'bg-green-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

export default function App() {
  const [restaurants, setRestaurants] = useState(SAMPLE_RESTAURANTS);
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const cities = useMemo(() => ['All', ...Array.from(new Set(restaurants.map(r => r.city)))], [restaurants]);
  const cuisines = useMemo(() => ['All', ...Array.from(new Set(restaurants.flatMap(r => r.cuisines)))], [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (cityFilter !== 'All' && r.city !== cityFilter) return false;
      if (cuisineFilter !== 'All' && !r.cuisines.includes(cuisineFilter)) return false;
      if (priceFilter !== 'All' && String(r.price) !== String(priceFilter)) return false;
      if (query && !(r.name.toLowerCase().includes(query.toLowerCase()) || r.address.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    }).sort((a,b) => b.avg_rating - a.avg_rating);
  }, [restaurants, cityFilter, cuisineFilter, priceFilter, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-extrabold text-indigo-600">DineWise</div>
            <div className="text-sm text-gray-500">Find the best local restaurants</div>
          </div>

          <div className="flex-1 px-6">
            <div className="max-w-2xl mx-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, address or cuisine..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500">Add Restaurant</button>
            <button className="px-3 py-2 border rounded-lg">Sign In</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">Filter by</div>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="px-3 py-2 border rounded">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)} className="px-3 py-2 border rounded">
              {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="px-3 py-2 border rounded">
              <option value="All">All prices</option>
              <option value="1">$</option>
              <option value="2">$$</option>
              <option value="3">$$$</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">Showing <span className="font-medium text-gray-800">{filtered.length}</span> restaurants</div>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <motion.article key={r.id} whileHover={{ y: -6 }} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
                <div className="relative h-44 w-full">
                  <img src={r.img} alt={r.name} className="object-cover w-full h-full" />
                  <div className="absolute top-3 left-3 bg-white bg-opacity-80 px-3 py-1 rounded-md text-sm font-medium">{r.city}</div>
                  <div className="absolute top-3 right-3 bg-black bg-opacity-40 text-white px-2 py-1 rounded">{r.avg_rating.toFixed(1)}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{r.name}</h3>
                      <p className="text-sm text-gray-500">{r.address}</p>
                      <div className="mt-2 flex items-center space-x-3">
                        <StarRating value={r.avg_rating} />
                        <div className="text-sm text-gray-500">{r.votes} votes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <PricePills price={r.price} />
                      <div className="mt-2 text-xs text-gray-400">{r.timing}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.cuisines.map(c => (
                      <span key={c} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{c}</span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => setSelected(r)} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded">View</button>
                    <a href={r.website} target="_blank" rel="noreferrer" className="text-sm text-gray-600 underline">Website</a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-40 z-30 flex items-center justify-center">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl max-w-3xl w-full mx-4 overflow-hidden shadow-2xl">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.name}</h2>
                    <div className="text-sm text-gray-500">{selected.address} • {selected.city}</div>
                    <div className="mt-3 flex items-center gap-4">
                      <StarRating value={selected.avg_rating} size={16} />
                      <div className="text-sm text-gray-600">{selected.avg_rating} • {selected.votes} votes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={selected.website} target="_blank" rel="noreferrer" className="px-4 py-2 border rounded">Visit site</a>
                    <button onClick={() => setSelected(null)} className="px-4 py-2 bg-red-50 text-red-600 rounded">Close</button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img src={selected.img} alt={selected.name} className="w-full h-56 object-cover rounded" />
                    <p className="mt-3 text-gray-600">Timings: {selected.timing}</p>
                    <p className="mt-2 text-gray-600">Cuisines: {selected.cuisines.join(', ')}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Reviews</h3>
                    <div className="mt-3 space-y-3">
                      <div className="p-3 bg-gray-50 rounded">No reviews yet — integrate REVIEWS table to display user reviews here.</div>
                      <div className="p-3 bg-gray-50 rounded">You can add rating submission forms and review editor here.</div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-500">
          <div>© {new Date().getFullYear()} DineWise — Built with ❤️</div>
          <div>Made for demo — connect to your API to power this UI.</div>
        </div>
      </footer>
    </div>
  );
}
