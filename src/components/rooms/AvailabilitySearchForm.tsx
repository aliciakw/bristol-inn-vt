import { useState, useEffect } from 'react';
import { FormField } from '@components/ui/FormField';
import { Button } from '@components/ui/Button';

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  guests: number;
  groundFloor: boolean;
  pets: boolean;
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
  const [groundFloor, setGroundFloor] = useState(false);
  const [pets, setPets] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'checkIn' | 'checkOut' | 'guests', string>>>({});

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const ciParam = sp.get('checkIn');
    const coParam = sp.get('checkOut');
    const guestsParam = parseInt(sp.get('guests') ?? '', 10);
    if (ciParam) setCheckIn(ciParam);
    if (coParam) setCheckOut(coParam);
    if (guestsParam > 0) setGuests(guestsParam);
    if (sp.get('groundFloor') === '1') setGroundFloor(true);
    if (sp.get('pets') === '1') setPets(true);
  }, []);

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
    if (validate()) onSearch({ checkIn, checkOut, guests, groundFloor, pets });
  }

  function handleClear() {
    setCheckIn('');
    setCheckOut('');
    setGuests(2);
    setGroundFloor(false);
    setPets(false);
    setErrors({});
    onClear();
  }

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && checkOut <= val) setCheckOut('');
    setErrors((prev) => ({ ...prev, checkIn: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Check room availability">
      <div className="flex flex-row items-start flex-wrap gap-x-4 gap-y-3 items-end">
        <FormField id="avail-check-in" label="Check-in" type="date" value={checkIn} min={today} onChange={handleCheckInChange} disabled={isLoading} error={errors.checkIn} className="flex-1 min-w-36" />
        <FormField
          id="avail-check-out"
          label="Check-out"
          type="date"
          value={checkOut}
          min={minCheckOut}
          onChange={(e) => {
            setCheckOut(e.target.value);
            setErrors((prev) => ({ ...prev, checkOut: undefined }));
          }}
          disabled={isLoading}
          error={errors.checkOut}
          className="flex-1 min-w-36"
        />
        <FormField
          id="avail-guests"
          label="Guests"
          type="number"
          value={guests}
          min={1}
          max={20}
          onChange={(e) => {
            setGuests(parseInt(e.target.value, 10) || 1);
            setErrors((prev) => ({ ...prev, guests: undefined }));
          }}
          disabled={isLoading}
          error={errors.guests}
          className="w-24"
        />

        <div className="flex gap-2 items-start pt-7 pb-0.5">
          <Button type="submit" disabled={isLoading} bg="lilac-200">
            {isLoading ? 'Searching…' : 'Search'}
          </Button>
          {hasResults && (
            <Button bg="khaki-200" onClick={handleClear} disabled={isLoading}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
