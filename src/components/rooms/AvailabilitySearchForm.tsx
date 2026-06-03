import { useState } from 'react';

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface Props {
  onSearch: (params: SearchParams) => void;
  onClear: () => void;
  isLoading: boolean;
  hasResults: boolean;
}

function localDateISO(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AvailabilitySearchForm({ onSearch, onClear, isLoading, hasResults }: Props) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [errors, setErrors] = useState<Partial<Record<'checkIn' | 'checkOut' | 'guests', string>>>({});

  const today = localDateISO();
  const minCheckOut = checkIn || localDateISO(1);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!checkIn) next.checkIn = 'Select a check-in date';
    else if (checkIn < today) next.checkIn = 'Check-in must be today or later';

    if (!checkOut) next.checkOut = 'Select a check-out date';
    else if (checkIn && checkOut <= checkIn) next.checkOut = 'Check-out must be after check-in';

    if (guests < 1 || guests > 20) next.guests = 'Guests must be between 1 and 20';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSearch({ checkIn, checkOut, guests });
  }

  function handleClear() {
    setCheckIn('');
    setCheckOut('');
    setGuests(2);
    setErrors({});
    onClear();
  }

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && checkOut <= val) setCheckOut('');
    setErrors(prev => ({ ...prev, checkIn: undefined }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-4 tablet:p-6 mb-8 shadow-sm"
      aria-label="Check room availability"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">Check Availability</h2>
      <div className="flex flex-col tablet:flex-row gap-4 items-start tablet:items-end">
        <div className="flex flex-col gap-1 w-full tablet:w-auto">
          <label htmlFor="checkIn" className="text-sm font-bold text-gray-700">
            Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            min={today}
            onChange={handleCheckInChange}
            disabled={isLoading}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-describedby={errors.checkIn ? 'checkIn-error' : undefined}
          />
          {errors.checkIn && (
            <p id="checkIn-error" className="text-xs text-red-600">{errors.checkIn}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full tablet:w-auto">
          <label htmlFor="checkOut" className="text-sm font-bold text-gray-700">
            Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={e => {
              setCheckOut(e.target.value);
              setErrors(prev => ({ ...prev, checkOut: undefined }));
            }}
            disabled={isLoading}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-describedby={errors.checkOut ? 'checkOut-error' : undefined}
          />
          {errors.checkOut && (
            <p id="checkOut-error" className="text-xs text-red-600">{errors.checkOut}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full tablet:w-28">
          <label htmlFor="guests" className="text-sm font-bold text-gray-700">
            Guests
          </label>
          <input
            id="guests"
            type="number"
            value={guests}
            min={1}
            max={20}
            onChange={e => {
              setGuests(parseInt(e.target.value, 10) || 1);
              setErrors(prev => ({ ...prev, guests: undefined }));
            }}
            disabled={isLoading}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-describedby={errors.guests ? 'guests-error' : undefined}
          />
          {errors.guests && (
            <p id="guests-error" className="text-xs text-red-600">{errors.guests}</p>
          )}
        </div>

        <div className="flex gap-2 w-full tablet:w-auto">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 tablet:flex-none px-5 py-2 bg-slate-700 text-white text-sm font-bold rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching…' : 'Search'}
          </button>
          {hasResults && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="flex-1 tablet:flex-none px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
