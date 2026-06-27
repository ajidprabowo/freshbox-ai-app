import { FreshBox, Rental, ProductBatch, BoxRecommendationResult, RentalSuggestion } from './types';
import { INITIAL_BOXES, INITIAL_RENTALS, INITIAL_PRODUCTS } from './mockData';

const IS_BROWSER = typeof window !== 'undefined';

export function getBoxes(): FreshBox[] {
  if (!IS_BROWSER) return INITIAL_BOXES;
  const stored = localStorage.getItem('freshbox_units');
  if (!stored) {
    localStorage.setItem('freshbox_units', JSON.stringify(INITIAL_BOXES));
    return INITIAL_BOXES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_BOXES;
  }
}

export function saveBoxes(boxes: FreshBox[]): void {
  if (!IS_BROWSER) return;
  localStorage.setItem('freshbox_units', JSON.stringify(boxes));
}

export function getRentals(): Rental[] {
  if (!IS_BROWSER) return INITIAL_RENTALS;
  const stored = localStorage.getItem('freshbox_rentals');
  if (!stored) {
    localStorage.setItem('freshbox_rentals', JSON.stringify(INITIAL_RENTALS));
    return INITIAL_RENTALS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_RENTALS;
  }
}

export function saveRentals(rentals: Rental[]): void {
  if (!IS_BROWSER) return;
  localStorage.setItem('freshbox_rentals', JSON.stringify(rentals));
}

export function getProducts(): ProductBatch[] {
  if (!IS_BROWSER) return INITIAL_PRODUCTS;
  const stored = localStorage.getItem('freshbox_products');
  if (!stored) {
    localStorage.setItem('freshbox_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: ProductBatch[]): void {
  if (!IS_BROWSER) return;
  localStorage.setItem('freshbox_products', JSON.stringify(products));
}

export function getLatestBoxRecommendation(): BoxRecommendationResult | null {
  if (!IS_BROWSER) return null;
  const stored = localStorage.getItem('latest_box_recommendation');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function saveLatestBoxRecommendation(rec: BoxRecommendationResult | null): void {
  if (!IS_BROWSER) return;
  if (rec === null) {
    localStorage.removeItem('latest_box_recommendation');
  } else {
    localStorage.setItem('latest_box_recommendation', JSON.stringify(rec));
  }
}

export function saveLatestRentalSuggestion(rec: RentalSuggestion | null): void {
  if (!IS_BROWSER) return;
  if (rec === null) {
    localStorage.removeItem('latest_rental_suggestion');
  } else {
    localStorage.setItem('latest_rental_suggestion', JSON.stringify(rec));
  }
}

export function getLatestRentalSuggestion(): RentalSuggestion | null {
  if (!IS_BROWSER) return null;
  const stored = localStorage.getItem('latest_rental_suggestion');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function clearLatestRentalSuggestion(): void {
  if (!IS_BROWSER) return;
  localStorage.removeItem('latest_rental_suggestion');
}

