import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CalendarDays, Check, Compass, MapPin, Sparkles, Wallet, Clock3, Mountain, Utensils, Landmark, Waves } from 'lucide-react';

type Activity = { time: string; title: string; detail: string; cost: number; type: string };
type DayPlan = { day: number; title: string; activities: Activity[] };
type TripResponse = { destination: string; days: number; budget: number; estimated_total: number; currency: string; itinerary: DayPlan[]; note: string };

const interestsList = ['Culture', 'Food', 'Nature', 'Adventure', 'Shopping', 'History'];
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function App() {
  const [destination, setDestination] = useState('Jaipur, India');
  const [startDate, setStartDate] = useState('2026-11-12');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState<string[]>(['Culture', 'Food', 'History']);
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleInterest(item: string) {
    setInterests(current => current.includes(item) ? current.filter(x => x !== item) : [...current, item]);
  }

  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/api/itineraries`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, start_date: startDate, days, budget, travelers, interests }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'Could not create itinerary. Check that the backend is running.');
      }
      setTrip(await response.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setLoading(false); }
  }

  const icons = [Landmark, Utensils, Mountain, Waves, Compass];

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="TripWise AI home"><span className="brand-mark"><Compass size={21}/></span><span>tripwise<span className="brand-ai">.ai</span></span></a>
      <nav><a href="#planner">Plan a trip</a><a href="#how-it-works">How it works</a></nav>
      <span className="beta-pill"><span/> BETA · FREE TO START</span>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15}/> YOUR NEXT ADVENTURE, THOUGHTFULLY PLANNED</div>
        <h1>Less planning.<br/><span>More wandering.</span></h1>
        <p className="hero-description">A trip that feels like you. Build a day-by-day travel plan around your budget, dates, and the things you love.</p>
        <div className="hero-proof"><span><Check size={15}/> Budget-aware plans</span><span><Check size={15}/> Flexible itineraries</span><span><Check size={15}/> Your pace, your trip</span></div>
      </div>
      <div className="hero-art" aria-label="Illustration of a mountain getaway">
        <div className="sun"/><div className="cloud cloud-one"/><div className="cloud cloud-two"/>
        <div className="mountain mountain-back"/><div className="mountain mountain-front"/><div className="lake"/>
        <div className="art-label"><MapPin size={16}/><span><strong>Your kind of getaway</strong><small>Somewhere wonderful awaits</small></span></div>
        <div className="art-stamp"><Sparkles size={16}/> MADE FOR YOU</div>
      </div>
    </section>

    <section className="planner-layout" id="planner">
      <form className="planner-card" onSubmit={createTrip}>
        <div className="section-heading"><div><span className="step-label">LET'S GET STARTED</span><h2>Design your getaway</h2></div><span className="step-number">01 / 02</span></div>
        <label className="field-label" htmlFor="destination">Where do you want to go?</label>
        <div className="input-with-icon"><MapPin size={18}/><input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Jaipur, India" required maxLength={100}/></div>
        <div className="field-grid">
          <div><label className="field-label" htmlFor="start-date">Start date</label><div className="input-with-icon"><CalendarDays size={17}/><input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required/></div></div>
          <div><label className="field-label" htmlFor="days">How long?</label><select id="days" value={days} onChange={e => setDays(Number(e.target.value))}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n === 1 ? 'day' : 'days'}</option>)}</select></div>
        </div>
        <div className="field-grid">
          <div><label className="field-label" htmlFor="budget">Total budget (₹)</label><div className="input-with-icon"><Wallet size={17}/><input id="budget" type="number" min={500} max={10000000} step={500} value={budget} onChange={e => setBudget(Number(e.target.value))} required/></div></div>
          <div><label className="field-label" htmlFor="travelers">Travelers</label><select id="travelers" value={travelers} onChange={e => setTravelers(Number(e.target.value))}>{[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'traveler' : 'travelers'}</option>)}</select></div>
        </div>
        <div className="interest-heading"><label className="field-label">What are you in the mood for?</label><span>Choose all that fit</span></div>
        <div className="interest-options">{interestsList.map((item, index) => { const Icon = icons[index % icons.length]; const selected = interests.includes(item); return <button type="button" key={item} className={`interest-chip ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => toggleInterest(item)}><Icon size={15}/>{item}{selected && <Check size={13}/>}</button>; })}</div>
        <button className="submit-button" type="submit" disabled={loading || interests.length === 0}>{loading ? 'Planning your trip…' : <>Create my itinerary <ArrowRight size={18}/></>}</button>
        {error && <p className="error-message" role="alert">{error}</p>}
        <p className="privacy-note">A little inspiration, a lot less stress. No paid API needed for this first version.</p>
      </form>

      <aside className="preview-panel">
        <div className="preview-top"><span className="preview-tag"><Sparkles size={13}/> YOUR TRIP PREVIEW</span><span className="preview-dot"/></div>
        {trip ? <>
          <p className="preview-kicker">YOUR PERSONALIZED ESCAPE</p><h2 className="trip-title">{trip.destination}</h2><p className="trip-subtitle"><CalendarDays size={15}/> {trip.days} days <span>·</span> ₹{trip.budget.toLocaleString('en-IN')} budget</p>
          <div className="estimate-card"><span>Estimated activity spend</span><strong>₹{trip.estimated_total.toLocaleString('en-IN')}</strong><small>{trip.note}</small></div>
          <div className="itinerary-list">{trip.itinerary.map(day => <div className="day-card" key={day.day}><div className="day-number">D{day.day}</div><div className="day-content"><strong>{day.title}</strong>{day.activities.map((a, i) => <div className="activity-row" key={`${a.time}-${i}`}><span>{a.time}</span><div><b>{a.title}</b><small>{a.detail}</small></div><em>₹{a.cost.toLocaleString('en-IN')}</em></div>)}</div></div>)}</div>
        </> : <>
          <p className="preview-kicker">A SNEAK PEEK AT YOUR NEXT ESCAPE</p><h2 className="preview-title">Your adventure<br/>starts <em>here.</em></h2><p className="preview-description">Tell us what you love. We'll turn your ideas into a trip that flows beautifully, one day at a time.</p>
          <div className="sample-itinerary"><div className="sample-image"><div className="sample-sun"/><div className="sample-hill hill-a"/><div className="sample-hill hill-b"/><div className="sample-image-label"><MapPin size={14}/> A little inspiration</div></div><div className="sample-details"><div className="sample-date"><span>DAY 01</span><span><Clock3 size={13}/> EASY PACE</span></div><h3>Find your own rhythm</h3><p>Slow mornings, local favorites, and a sunset worth remembering.</p><div className="sample-tags"><span>Local gems</span><span>Good food</span><span>Scenic stops</span></div></div></div>
          <div className="preview-footer"><span className="avatar-stack"><i>B</i><i>✦</i><i>↗</i></span><span>Made for curious travelers</span></div>
        </>}
      </aside>
    </section>

    <section className="how-section" id="how-it-works"><div className="how-heading"><span className="step-label">A BETTER WAY TO GET AWAY</span><h2>From “where should we go?” to “remember when…”</h2></div><div className="how-grid"><article><span className="how-icon"><MapPin/></span><span className="how-count">01</span><h3>Tell us your vibe</h3><p>Pick your destination, dates, budget, and the experiences you care about.</p></article><article><span className="how-icon"><Sparkles/></span><span className="how-count">02</span><h3>Get a thoughtful plan</h3><p>Turn your preferences into a practical, day-by-day starting itinerary.</p></article><article><span className="how-icon"><Compass/></span><span className="how-count">03</span><h3>Make it yours</h3><p>Review the schedule, adjust your plans, and keep building your ideal trip.</p></article></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark"><Compass size={18}/></span><span>tripwise<span className="brand-ai">.ai</span></span></a><span>Built with curiosity. Designed for the journey.</span><span>TRAVEL A LITTLE BETTER © 2026</span></footer>
  </main>;
}

export default App;
