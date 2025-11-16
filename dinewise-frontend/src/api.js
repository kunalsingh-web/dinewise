const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchRestaurants({ city, cuisine, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (cuisine) params.append('cuisine', cuisine);
  params.append('page', page);
  params.append('limit', limit);
  const url = `${API_BASE}/api/restaurants?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch error: ' + res.status);
  return res.json();
}

export async function fetchRestaurant(id) {
  const res = await fetch(`${API_BASE}/api/restaurants/${id}`);
  if (!res.ok) throw new Error('Fetch error: ' + res.status);
  return res.json();
}
