import { useState, useEffect, useRef } from 'react';
import { FormField } from '@components/ui/FormField';
import { FormCheckbox } from '@components/ui/FormCheckbox';
import { Button } from '@components/ui/Button';
import { TextStyle } from '@components/ui/TextStyle';

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
  showResetButton?: boolean;
  automatic?: boolean;
}

function localDateISO(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AvailabilitySearchForm({ navigateTo, onSearch, onClear, isLoading = false, hasResults = false, showResetButton = false, automatic = false }: Props) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [groundFloor, setGroundFloor] = useState(false);
  const [pets, setPets] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'checkIn' | 'checkOut' | 'guests', string>>>({});
  const userChangedRef = useRef(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function getErrors() {
    const next: typeof errors = {};
    if (!checkIn) next.checkIn = 'Select a check-in date';
    else if (checkIn < today) next.checkIn = 'Check-in must be today or later';
    if (!checkOut) next.checkOut = 'Select a check-out date';
    else if (checkIn && checkOut <= checkIn) next.checkOut = 'Check-out must be after check-in';
    if (guests < 1 || guests > 20) next.guests = 'Guests must be between 1 and 20';
    return next;
  }

  function validate(): boolean {
    const next = getErrors();
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  useEffect(() => {
    if (!automatic || !userChangedRef.current) return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      if (Object.keys(getErrors()).length > 0) return;
      const params = { checkIn, checkOut, guests, groundFloor, pets };
      if (navigateTo) {
        const sp = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
        if (groundFloor) sp.set('groundFloor', '1');
        if (pets) sp.set('pets', '1');
        window.location.href = `${navigateTo}?${sp.toString()}`;
      } else {
        onSearch?.(params);
      }
    }, 300);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [checkIn, checkOut, guests, groundFloor, pets]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const reservationHeadingIcon = document.getElementById('reservation-heading-icon');
    if (reservationHeadingIcon) {
      reservationHeadingIcon.classList.add('animate-spin');
    }

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
    userChangedRef.current = true;
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && checkOut <= val) setCheckOut('');
    setErrors((prev) => ({ ...prev, checkIn: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Check room availability" className="flex flex-col gap-3 bg-sand-050 shadow--card border-1 border-ink-900 rounded-lg px-4 pt-2 pb-3">
      <div className="flex flex-wrap desktop:flex-nowrap items-start gap-x-4 gap-y-3 ">
        <FormField
          id="avail-guests"
          label="Number of Guests"
          type="number"
          value={guests}
          min={1}
          max={20}
          onChange={(e) => {
            userChangedRef.current = true;
            setGuests(parseInt(e.target.value, 10) || 1);
            setErrors((prev) => ({ ...prev, guests: undefined }));
          }}
          disabled={isLoading}
          error={errors.guests}
          className="flex-1 w-24 shrink-0"
        />
        <FormField
          id="avail-check-in"
          label="Check-in"
          type="date"
          value={checkIn}
          min={today}
          onChange={handleCheckInChange}
          disabled={isLoading}
          error={errors.checkIn}
          className="flex-1 min-w-36"
        />
        <FormField
          id="avail-check-out"
          label="Check-out"
          type="date"
          value={checkOut}
          min={minCheckOut}
          onChange={(e) => {
            userChangedRef.current = true;
            setCheckOut(e.target.value);
            setErrors((prev) => ({ ...prev, checkOut: undefined }));
          }}
          disabled={isLoading}
          error={errors.checkOut}
          className="flex-1 min-w-36"
        />
      </div>
      <div className="flex flex-row gap-6 pt-4">
        <div className="flex flex-col desktop:flex-row desktop:items-center gap-4 pr-4">
          <TextStyle variant="label" element="span" className="font-medium whitespace-nowrap desktop:hidden">
            Special Needs:
          </TextStyle>
          <FormCheckbox
            name="pets"
            label="Dogs Permitted"
            checked={pets}
            onChange={(e) => {
              userChangedRef.current = true;
              setPets(e.target.checked);
            }}
            disabled={isLoading}
            clarification={
              <a href="/faq#pet-policy" className="underline hover:opacity-70">
                See Pet Policy
              </a>
            }
          />
          <FormCheckbox
            name="groundFloor"
            label="Ground Floor Only"
            checked={groundFloor}
            onChange={(e) => {
              userChangedRef.current = true;
              setGroundFloor(e.target.checked);
            }}
            disabled={isLoading}
            clarification={
              <a href="/faq#accessibility" className="underline hover:opacity-70">
                Accessibility Info
              </a>
            }
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-start flex-1 justify-stretch gap-2 shrink-0 pb-0.5 max-w-[200px]">
          {!automatic && (
            <Button size="default" type="submit" disabled={isLoading} bg="prussian-500" textColor="white" className="flex-1 hover:bg-prussian-700 flex-none">
              {isLoading ? 'Searching…' : 'Search'}
            </Button>
          )}
          {showResetButton && hasResults && (
            <Button bg="khaki-200" onClick={handleClear} disabled={isLoading} className="flex-none">
              Reset
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
