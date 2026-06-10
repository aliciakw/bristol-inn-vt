import { useState, useEffect } from 'react';
import { FormField } from '@components/ui/FormField';
import { FormCheckbox } from '@components/ui/FormCheckbox';
import { Button } from '@components/ui/Button';

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  guests: number;
  groundFloor: boolean;
  pets: boolean;
}

interface Props {
  navigateTo?: string;
  onSearch?: (params: SearchParams) => void;
  onClear?: () => void;
  isLoading?: boolean;
  hasResults?: boolean;
}

function localDateISO(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AvailabilitySearchForm({ navigateTo, onSearch, onClear, isLoading = false, hasResults = false }: Props) {
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
    if (!validate()) return;
    const params = { checkIn, checkOut, guests, groundFloor, pets };
    if (navigateTo) {
      const sp = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
      if (groundFloor) sp.set('groundFloor', '1');
      if (pets) sp.set('pets', '1');
      window.location.href = `${navigateTo}?${sp.toString()}`;
    } else {
      onSearch?.(params);
    }
  }

  function handleClear() {
    setCheckIn('');
    setCheckOut('');
    setGuests(2);
    setGroundFloor(false);
    setPets(false);
    setErrors({});
    onClear?.();
  }

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && checkOut <= val) setCheckOut('');
    setErrors((prev) => ({ ...prev, checkIn: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Check room availability">
      <div className="flex flex-row items-start flex-wrap gap-x-4 gap-y-3 items-end bg-sand-050 border-1 border-ink-900 rounded-lg px-4 pt-2 pb-3">
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

        <div className="w-full flex flex-col tablet:flex-row gap-4 tablet:gap-6 items-start">
          <FormCheckbox name="groundFloor" label="Wheelchair Accessible" checked={groundFloor} onChange={(e) => setGroundFloor(e.target.checked)} disabled={isLoading} />
          <FormCheckbox
            name="pets"
            label="Dogs Permitted"
            checked={pets}
            onChange={(e) => setPets(e.target.checked)}
            disabled={isLoading}
            clarification={
              <a href="/faq#pet-policy" className="underline hover:opacity-70">
                See Pet Policy
              </a>
            }
          />
        </div>
        <div className="flex gap-2 items-start pb-0.5">
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
