import { errorModal, restaurantModal, restaurantRow } from './components';
import type { Restaurant } from './interfaces/Restaurant';
import type { Menu } from './interfaces/Menu';
import { fetchData } from './functions';
import { apiUrl, positionOptions } from './variables';


const modal = document.querySelector<HTMLDialogElement>('dialog');
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});

const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = (restaurants: Restaurant[]): void => {
  const table = document.querySelector<HTMLTableElement>('table');
  if (!table) {
    console.warn('Table element not found');
    return;
  }
  table.innerHTML = '';

  restaurants.forEach((restaurant) => {
    const tr = restaurantRow(restaurant);
    table.appendChild(tr);

    tr.addEventListener('click', async () => {
      try {
        document
          .querySelectorAll<HTMLElement>('.highlight')
          .forEach((el) => el.classList.remove('highlight'));

        tr.classList.add('highlight');

        modal.innerHTML = '';

        const menu = (await fetchData(
          `${apiUrl}/restaurants/daily/${restaurant._id}/fi`
        )) as Menu;

        const menuHtml = restaurantModal(restaurant, menu);
        modal.insertAdjacentHTML('beforeend', menuHtml);
        modal.showModal();
      } catch (error) {
        const msg = (error as Error).message ?? 'Unknown error';
        modal.innerHTML = errorModal(msg);
        modal.showModal();
      }
    });
  });
};

const error = (err: GeolocationPositionError): void => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition): Promise<void> => {
  try {
    const crd = pos.coords;

    const restaurants = (await fetchData(
      `${apiUrl}/restaurants`
    )) as Restaurant[];

    restaurants.sort((a, b) => {
      const x1 = crd.latitude;
      const y1 = crd.longitude;

      const x2a = a.location.coordinates[1];
      const y2a = a.location.coordinates[0];
      const distanceA = calculateDistance(x1, y1, x2a, y2a);

      const x2b = b.location.coordinates[1];
      const y2b = b.location.coordinates[0];
      const distanceB = calculateDistance(x1, y1, x2b, y2b);

      return distanceA - distanceB;
    });

    createTable(restaurants);

    const sodexoBtn = document.querySelector<HTMLButtonElement>('#sodexo');
    const compassBtn = document.querySelector<HTMLButtonElement>('#compass');
    const resetBtn = document.querySelector<HTMLButtonElement>('#reset');

    if (!sodexoBtn || !compassBtn || !resetBtn) {
      console.warn('Filter buttons not found');
      return;
    }

    sodexoBtn.addEventListener('click', () => {
      const sodexoRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      createTable(sodexoRestaurants);
    });

    compassBtn.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      createTable(compassRestaurants);
    });

    resetBtn.addEventListener('click', () => {
      createTable(restaurants);
    });
  } catch (error) {
    const msg = (error as Error).message ?? 'Unknown error';
    modal.innerHTML = errorModal(msg);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);
